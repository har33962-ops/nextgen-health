// server/index.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const twilio = require("twilio");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();

// ----- Middleware -----
app.use(cors({ origin: "*" })); // allow all origins for now. In prod, set to your frontend URL.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ----- Database (SQLite) -----
const dbFile = path.join(__dirname, "nextgen.db");
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error("❌ Failed to open SQLite DB:", err.message);
    process.exitCode = 1;
  } else {
    console.log("🔗 Connected to SQLite DB at", dbFile);
  }
});

// Ensure users table exists
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER,
      contact TEXT NOT NULL
    )`,
    (err) => {
      if (err) console.error("DB table creation error:", err.message);
    }
  );
});

// ----- Twilio client (optional) -----
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log("🔔 Twilio client configured.");
  } catch (e) {
    console.warn("⚠️ Failed to init Twilio client:", e.message);
  }
} else {
  console.log("ℹ️ Twilio not configured (TWILIO_* env vars missing). OTP features will be in demo mode.");
}

// ----- Helper: send JSON error -----
function sendError(res, status, msg) {
  return res.status(status).json({ ok: false, error: msg });
}

// ----- Health / root route -----
app.get("/", (req, res) => {
  res.send("NextGen Health Server Running ✅");
});

// ----- Registration endpoint -----
// Expects { name, age, contact }
app.post("/api/register", (req, res) => {
  const { name, age, contact } = req.body || {};
  if (!name || !contact) {
    return sendError(res, 400, "Missing required fields: name and contact.");
  }

  const id = uuidv4();
  const ageInt = age ? parseInt(age, 10) || null : null;

  db.run(
    `INSERT INTO users (id, name, age, contact) VALUES (?, ?, ?, ?)`,
    [id, name, ageInt, contact],
    function (err) {
      if (err) {
        console.error("DB insert error:", err.message);
        return sendError(res, 500, "Database error");
      }

      // Optionally: send a welcome SMS via Twilio (demo: disabled if no Twilio)
      if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
        twilioClient.messages
          .create({
            from: process.env.TWILIO_PHONE_NUMBER,
            to: contact,
            body: `Welcome ${name}! You have been registered on NextGen Health.`,
          })
          .then((m) => {
            console.log("Twilio message sent:", m.sid);
          })
          .catch((twErr) => {
            console.warn("Twilio send failed:", twErr.message);
          });
      }

      return res.status(201).json({ ok: true, message: "User registered successfully", id });
    }
  );
});

// ----- Optional: expose API routes to check users (dev only) -----
app.get("/api/users", (req, res) => {
  db.all("SELECT id, name, age, contact FROM users ORDER BY rowid DESC LIMIT 200", [], (err, rows) => {
    if (err) return sendError(res, 500, "Database error");
    res.json({ ok: true, users: rows });
  });
});

// ----- Serve client build when present (useful if you deploy frontend build into server folder) -----
const clientBuildPath = path.join(__dirname, "..", "client", "build");
app.use(express.static(clientBuildPath));
app.get("*", (req, res, next) => {
  // If request starts with /api, skip serving index.html
  if (req.path.startsWith("/api")) return next();
  // Serve client build index if it exists
  const indexHtml = path.join(clientBuildPath, "index.html");
  res.sendFile(indexHtml, (err) => {
    if (err) {
      // If file not found, fallback to 404
      return res.status(404).send("Not found");
    }
  });
});

// ----- Start server -----
const PORT = Number(process.env.PORT || 4000);
const server = app.listen(PORT, () => {
  console.log(`🚀 NextGen Health Server Running on port ${PORT}`);
});

// ----- Graceful shutdown -----
function shutdown() {
  console.log("Shutting down server...");
  server.close(() => {
    db.close(() => {
      console.log("DB closed. Exiting.");
      process.exit(0);
    });
  });
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);