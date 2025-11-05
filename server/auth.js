// server/auth.js
require("dotenv").config();
const express = require("express");
const router = express.Router();
const twilio = require("twilio");

// ✅ Twilio client setup
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// In-memory OTP store (for demo — you can later replace with DB)
const otpStore = new Map();

/**
 * 📱 Request OTP
 * POST /api/auth/otp/request
 * Body: { phone }
 */
router.post("/otp/request", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ ok: false, error: "Phone number required" });

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP temporarily (valid for 3 minutes)
    otpStore.set(phone, { otp, expires: Date.now() + 3 * 60 * 1000 });
    console.log(`📩 OTP for ${phone}: ${otp}`);

    // Send via Twilio SMS
    try {
      const message = await client.messages.create({
        body: `Your NextGen Health OTP is ${otp}`,
        from: process.env.TWILIO_PHONE,
        to: phone,
      });
      console.log("✅ Sent SMS:", message.sid);
      return res.json({ ok: true });
    } catch (twilioError) {
      console.error("⚠️ Twilio send failed:", twilioError.message);
      // Fallback for demo if Twilio fails
      return res.json({ ok: true, demo: true, otp });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});

/**
 * 🔐 Verify OTP
 * POST /api/auth/otp/verify
 * Body: { phone, otp, name }
 */
router.post("/otp/verify", async (req, res) => {
  const { phone, otp, name } = req.body;
  if (!phone || !otp) return res.status(400).json({ ok: false, error: "Missing fields" });

  const entry = otpStore.get(phone);
  if (!entry) return res.status(400).json({ ok: false, error: "OTP not requested" });

  if (Date.now() > entry.expires) {
    otpStore.delete(phone);
    return res.status(400).json({ ok: false, error: "OTP expired" });
  }

  if (entry.otp !== otp) {
    return res.status(400).json({ ok: false, error: "Incorrect OTP" });
  }

  // OTP success — generate a simple token
  otpStore.delete(phone);
  const token = Buffer.from(`${phone}:${Date.now()}`).toString("base64");

  const user = { id: phone, name: name || "User", phone };
  return res.json({ ok: true, token, user });
});

module.exports = router;
