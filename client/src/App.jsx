// client/src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { FaClock, FaHeart, FaLightbulb, FaGithub, FaLinkedin } from "react-icons/fa";
import LoginModal from "./components/LoginModal";

import Projects from "./pages/Projects";
import Resources from "./pages/Resources";
import Profile from "./pages/Profile";

/* ============================
   API client (points to backend)
   ============================ */

// Prefer Render environment variable at build time; fallback to deployed backend.
const API_URL =
  (typeof process !== "undefined" && process.env.REACT_APP_API_URL) ||
  "https://nextgen-health-backend.onrender.com";

// Make sure axios instance uses that baseURL so built bundle contains the URL.
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Alias in case older code refers to "Id"
const Id = api;

/* ---------- Topbar ---------- */
function Topbar({ user, setUser }) {
  return (
    <motion.header
      className="topbar"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="brand-row container">
        <div className="brand-left">
          <div className="logo-mark">NG</div>
          <div>
            <Link to="/" className="brand-link">NextGen Health</Link>
            <div className="brand-sub">Smart Care • Thapar Project</div>
          </div>
        </div>

        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/resources">Resources</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/admin" className="admin-link">Admin</Link>
          {user ? (
            <button
              className="btn-ghost"
              onClick={() => {
                setUser(null);
                localStorage.removeItem("demo_user");
              }}
            >
              Logout
            </button>
          ) : null}
        </nav>
      </div>
    </motion.header>
  );
}

/* ---------- Home (contains registration form) ---------- */
function Home({ onRegister, setUser }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Submit handler: posts to backend /api/register (uses api instance above)
  async function submit(e) {
    e.preventDefault();
    if (!name || !contact) {
      return alert("Please enter name and contact.");
    }

    setLoading(true);
    try {
      // NOTE: backend endpoint used here is /api/register
      const res = await api.post("/api/register", { name, age: Number(age || 0), contact });
      const data = res.data;

      // success handling
      alert("✅ Registration successful!");
      console.log("Register response:", data);

      // persist user locally and update parent
      localStorage.setItem("demo_user", JSON.stringify(data));
      setUser(data);
      if (typeof onRegister === "function") onRegister(data);

      // navigate to dashboard (if exists)
      navigate("/profile");
    } catch (err) {
      console.error("Register error:", err?.response?.data ?? err.message ?? err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        (err.message ? String(err.message) : "Server or network error");
      alert("❌ Failed to register — " + msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container hero-enhanced">
      <motion.section
        className="hero-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div className="hero-left" initial={{ x: -30 }} animate={{ x: 0 }}>
          <h1>
            NextGen Health — <span className="accent">Smart Care</span>
          </h1>
          <p className="lead">
            A telehealth and clinic management demo for Thapar College — appointments,
            doctor notes, analytics & project ideas — all in one modern web portal.
          </p>

          <div className="stats-row">
            <motion.div className="stat" whileHover={{ scale: 1.05 }}>
              <div className="stat-num"><CountUp end={120} duration={2} />+</div>
              <div className="stat-label">Student Users</div>
            </motion.div>

            <motion.div className="stat" whileHover={{ scale: 1.05 }}>
              <div className="stat-num"><CountUp end={45} duration={2} /></div>
              <div className="stat-label">Project Ideas</div>
            </motion.div>

            <motion.div className="stat" whileHover={{ scale: 1.05 }}>
              <div className="stat-num"><CountUp end={98} duration={2} />%</div>
              <div className="stat-label">Satisfaction</div>
            </motion.div>
          </div>

          <div className="hero-actions">
            <button
              className="btn hero-btn"
              onClick={() => window.dispatchEvent(new CustomEvent("open-login"))}
            >
              Get Started
            </button>
            <Link to="/projects" className="btn btn-outline">View Ideas</Link>
          </div>

          <div className="features-grid">
            <div className="feature"><FaClock /> Fast booking</div>
            <div className="feature"><FaHeart /> Clinic notes</div>
            <div className="feature"><FaLightbulb /> Proposal hub</div>
          </div>
        </motion.div>

        <motion.aside
          className="hero-form card"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="pill">Quick Register</div>
          <form onSubmit={submit} className="form-compact">
            <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <input placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} />
            <input placeholder="Contact (e.g. +91...)" value={contact} onChange={(e) => setContact(e.target.value)} />
            <button className="btn full" type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register & Try"}
            </button>
          </form>
          <small className="muted">
            Used for demo only — no real data is sent off your machine.
          </small>

          <img
            src="/hero-illustration.svg"
            alt="Healthcare illustration"
            style={{ marginTop: 12, width: "100%", borderRadius: 10 }}
            onError={(e) => (e.target.style.display = "none")}
          />
        </motion.aside>
      </motion.section>

      <section className="container showcase">
        <h3>Why students love it</h3>
        <div className="card-grid cards-3">
          <motion.div className="card feature-card" whileHover={{ scale: 1.03 }}>
            <div className="card-head">Project-ready templates</div>
            <div className="card-desc">
              Pre-built idea cards and proposal forms so you can jump straight into implementation.
            </div>
            <div className="card-foot">
              <button className="btn btn-sm">Explore</button>
            </div>
          </motion.div>

          <motion.div className="card feature-card" whileHover={{ scale: 1.03 }}>
            <div className="card-head">Admin tools</div>
            <div className="card-desc">
              Assign supervisors, track progress, update notes, and manage appointments with one click.
            </div>
            <div className="card-foot">
              <button className="btn btn-sm btn-outline">Open</button>
            </div>
          </motion.div>

          <motion.div className="card feature-card" whileHover={{ scale: 1.03 }}>
            <div className="card-head">Presentation-ready</div>
            <div className="card-desc">
              Clean visuals and built-in analytics make it ideal for showcasing in your final demo.
            </div>
            <div className="card-foot">
              <button className="btn btn-sm">Get Slides</button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

/* ---------- APP ROOT ---------- */
export default function App() {
  const saved = typeof window !== "undefined" && localStorage.getItem("demo_user");
  const [user, setUser] = useState(saved ? JSON.parse(saved) : null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem("demo_user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    const handler = () => setShowLogin(true);
    window.addEventListener("open-login", handler);
    return () => window.removeEventListener("open-login", handler);
  }, []);

  function handleLoginSuccess(response) {
    if (response?.token) localStorage.setItem("jwt", response.token);
    if (response?.user) setUser(response.user);
  }

  return (
    <div className="app">
      <Topbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Home onRegister={() => {}} setUser={setUser} />} />
        <Route path="/projects" element={<Projects user={user} />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
      </Routes>

      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={handleLoginSuccess}
      />

      <footer className="site-footer">
        <div className="container">
          <div>© {new Date().getFullYear()} NextGen Health — Thapar College Project</div>
          <div className="muted" style={{ marginTop: 8 }}>
            Built with ❤️ using React, Node.js, and SQLite
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 12, justifyContent: "center" }}>
            <a href="https://github.com" target="_blank" rel="noreferrer"><FaGithub size={18} /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer"><FaLinkedin size={18} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
