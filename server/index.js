// server/index.js
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const Database = require("better-sqlite3");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const twilio = require("twilio");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- Initialize SQLite database ---
const db = new Database("./nextgen.db");

// --- Initialize Twilio ---
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const otpStore = {}; // { phone: { otp, expires } }

// Helper functions
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function cleanExpiredOtps() {
  const now = Date.now();
  for (const phone in otpStore) {
    if (otpStore[phone].expires < now) delete otpStore[phone];
  }
}
setInterval(cleanExpiredOtps, 60000);

// ✅ --- AUTH / OTP ROUTES ---
app.post("/api/auth/otp/request", async (req, res) => {
  const { phone } = req.body;
  if (!phone)
    return res.status(400).json({ ok: false, error: "Phone number required" });

  const otp = generateOTP();
  otpStore[phone] = { otp, expires: Date.now() + OTP_EXPIRY_MS };

  try {
    const message = await twilioClient.messages.create({
      body: `Your NextGen Health OTP is ${otp}. It expires in 5 minutes.`,
      from: process.env.TWILIO_PHONE, // e.g. +12298508517
      to: phone,
    });

    console.log(`✅ OTP sent to ${phone}: ${otp}`);
    res.json({ ok: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("⚠️ Twilio send failed:", err.message);
    // Fallback: return demo OTP for testing
    res.json({
      ok: true,
      demo: true,
      otp,
      message: "Demo OTP (Twilio failed or in trial mode)",
    });
  }
});

app.post("/api/auth/otp/verify", (req, res) => {
  const { phone, otp, name } = req.body;
  if (!phone || !otp)
    return res.status(400).json({ ok: false, error: "Phone and OTP required" });

  const record = otpStore[phone];
  if (!record)
    return res
      .status(400)
      .json({ ok: false, error: "No OTP request found or expired" });

  if (record.expires < Date.now()) {
    delete otpStore[phone];
    return res.status(400).json({ ok: false, error: "OTP expired" });
  }

  if (record.otp === otp) {
    delete otpStore[phone];
    const user = { id: uuidv4(), name: name || "User", phone };
    const token = "demo-jwt-token"; // replace with real JWT later
    console.log(`✅ OTP verified for ${phone}`);
    return res.json({ ok: true, message: "OTP verified", user, token });
  }

  return res.status(400).json({ ok: false, error: "Invalid OTP" });
});

// ✅ --- PATIENT ROUTES ---
app.post("/api/patients", (req, res) => {
  const { name, age, contact } = req.body;
  if (!name || !contact)
    return res.status(400).json({ error: "Name and contact required" });

  const id = "u_" + Date.now();
  db.prepare("INSERT INTO patients (id,name,age,contact) VALUES (?,?,?,?)").run(
    id,
    name,
    age || null,
    contact
  );
  res.json({ id, name, age, contact });
});

app.get("/api/patients/:id", (req, res) => {
  const patient = db
    .prepare("SELECT * FROM patients WHERE id = ?")
    .get(req.params.id);
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  res.json(patient);
});

// ✅ --- APPOINTMENTS ROUTES ---
app.post("/api/appointments", (req, res) => {
  const { department, symptoms, preferredDoctor, preferredDate, patientId } =
    req.body;
  if (!department || !symptoms || !patientId)
    return res.status(400).json({ error: "Missing fields" });

  const id = "a_" + Date.now();
  const createdAt = new Date().toISOString();
  db.prepare(
    "INSERT INTO appointments (id,department,symptoms,preferredDoctor,preferredDate,status,patientId,createdAt) VALUES (?,?,?,?,?,?,?,?)"
  ).run(
    id,
    department,
    symptoms,
    preferredDoctor || null,
    preferredDate || null,
    "Requested",
    patientId,
    createdAt
  );
  res.json({
    id,
    department,
    symptoms,
    preferredDoctor,
    preferredDate,
    status: "Requested",
    patientId,
  });
});

app.get("/api/appointments", (req, res) => {
  const rows = db.prepare("SELECT * FROM appointments").all();
  res.json(rows);
});

app.get("/api/appointments/patient/:patientId", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM appointments WHERE patientId = ?")
    .all(req.params.patientId);
  res.json(rows);
});

app.put("/api/appointments/:id/assign", (req, res) => {
  const { doctor } = req.body;
  db.prepare(
    "UPDATE appointments SET assignedDoctor = ?, status = ? WHERE id = ?"
  ).run(doctor, "Confirmed", req.params.id);
  res.json({ ok: true });
});

app.put("/api/appointments/:id/status", (req, res) => {
  const { status } = req.body;
  db.prepare("UPDATE appointments SET status = ? WHERE id = ?").run(
    status,
    req.params.id
  );
  res.json({ ok: true });
});

app.put("/api/appointments/:id/notes", (req, res) => {
  const { notes, prescription } = req.body;
  db.prepare("UPDATE appointments SET notes = ?, prescription = ? WHERE id = ?")
    .run(notes, prescription, req.params.id);
  res.json({ ok: true });
});

// ✅ --- FEEDBACK ROUTES ---
app.post("/api/appointments/:id/feedback", (req, res) => {
  const { rating, comments } = req.body;
  const at = new Date().toISOString();
  db.prepare(
    "INSERT INTO feedback (appointmentId,rating,comments,at) VALUES (?,?,?,?)"
  ).run(req.params.id, rating, comments, at);
  res.json({ ok: true });
});

app.get("/api/appointments/:id/feedback", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM feedback WHERE appointmentId = ?")
    .all(req.params.id);
  res.json(rows);
});

// ✅ --- HEALTH CHECK ---
app.get("/", (req, res) => res.send("NextGen Health Server Running ✅"));

// ✅ --- START SERVER ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
