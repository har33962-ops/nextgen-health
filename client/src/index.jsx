// client/src/index.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";

// Optional: report performance metrics (can be extended later)
function reportWebVitals(metric) {
  console.log(metric);
}

// Mount the root React app
const container = document.getElementById("root");
const root = createRoot(container);

// Wrap everything in React.StrictMode and BrowserRouter
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Optional: Uncomment to enable web vitals (for debugging / performance checks)
// reportWebVitals();
