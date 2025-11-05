// ✅ CommonJS version (works in Node.js v18+)
require("dotenv").config();
const twilio = require("twilio");

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendTestSMS() {
  try {
    const message = await client.messages.create({
      from: process.env.TWILIO_PHONE,   // your Twilio number
      to: "+917300361359",              // your verified number
      body: "Hello from NextGen Health 👋 — Twilio setup successful!",
    });
    console.log("✅ Message sent successfully!");
    console.log("SID:", message.sid);
  } catch (error) {
    console.error("❌ Failed to send SMS:", error.message);
  }
}

sendTestSMS();
