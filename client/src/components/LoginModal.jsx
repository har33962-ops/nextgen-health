// client/src/components/LoginModal.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Enhanced LoginModal.jsx
 * ✨ Features:
 *  - Twilio OTP login
 *  - Resend OTP with cooldown timer
 *  - Demo mode (shows OTP in terminal if Twilio disabled)
 *  - Matches NextGen Health UI theme
 */

export default function LoginModal({ open, onClose, onLogin }) {
  const [step, setStep] = useState(0); // 0 = enter phone, 1 = enter OTP
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [demoOtp, setDemoOtp] = useState(null);
  const [timer, setTimer] = useState(0);

  // Reset all on close
  useEffect(() => {
    if (!open) {
      setStep(0);
      setPhone("");
      setName("");
      setOtp("");
      setDemoOtp(null);
      setMessage("");
      setLoading(false);
      setTimer(0);
    }
  }, [open]);

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // --- Request OTP ---
  async function requestOtp(e) {
    e?.preventDefault();
    if (!phone) return setMessage("Please enter your phone number (e.g. +91...)");
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.ok) {
        setStep(1);
        setMessage("OTP sent — check your phone 📱");
        if (data.demo && data.otp) setDemoOtp(data.otp);
        setTimer(30); // 30s cooldown for resend
        setTimeout(() => document.getElementById("otpInput")?.focus(), 200);
      } else {
        setMessage(data.error || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setMessage("Network error while requesting OTP.");
    }
  }

  // --- Verify OTP ---
  async function verifyOtp(e) {
    e?.preventDefault();
    if (!otp) return setMessage("Enter the OTP you received");
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, name }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.ok) {
        setMessage("✅ Login successful!");
        if (typeof onLogin === "function") onLogin(data);
        setTimeout(onClose, 700);
      } else {
        setMessage(data.error || "Invalid OTP, try again.");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setMessage("Network error verifying OTP.");
    }
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,18,25,0.55)",
          backdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: 16,
        }}
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 420,
            maxWidth: "96%",
            background: "white",
            borderRadius: 14,
            padding: 24,
            boxShadow: "0 25px 60px rgba(2,6,23,0.35)",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0, color: "#3741ff" }}>NextGen Login</h3>
              <small style={{ color: "#6b7280" }}>
                Use OTP login — secure & simple
              </small>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: 0,
                fontSize: 22,
                cursor: "pointer",
                color: "#6b7280",
              }}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div style={{ height: 16 }} />

          {/* Step 0 - Phone entry */}
          {step === 0 && (
            <form onSubmit={requestOtp} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                placeholder="+91 98xxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #e6eaf5",
                  fontSize: 15,
                }}
              />
              <input
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #e6eaf5",
                  fontSize: 15,
                }}
              />
              <button
                className="btn"
                type="submit"
                disabled={loading}
                style={{ width: "100%", marginTop: 6 }}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
              <small style={{ color: "#6b7280" }}>
                Demo mode: OTP may appear in console if Twilio is off.
              </small>
            </form>
          )}

          {/* Step 1 - OTP verify */}
          {step === 1 && (
            <form onSubmit={verifyOtp} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                id="otpInput"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid #e6eaf5",
                  fontSize: 15,
                }}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="submit"
                  className="btn"
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setStep(0)}
                  style={{ flex: 1 }}
                >
                  Back
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <small style={{ color: "#6b7280" }}>
                  Didn’t get it?{" "}
                  {timer > 0 ? (
                    <span>Resend in {timer}s</span>
                  ) : (
                    <button
                      onClick={requestOtp}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#3751ff",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                      type="button"
                    >
                      Resend OTP
                    </button>
                  )}
                </small>
              </div>

              {demoOtp && (
                <div
                  style={{
                    marginTop: 8,
                    padding: 10,
                    borderRadius: 8,
                    background: "#f8fafc",
                    border: "1px dashed #cbd5e1",
                    fontSize: 14,
                  }}
                >
                  Demo OTP: <strong>{demoOtp}</strong>
                </div>
              )}
            </form>
          )}

          {/* Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ marginTop: 10, color: "#374151", textAlign: "center", fontSize: 14 }}
            >
              {message}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
