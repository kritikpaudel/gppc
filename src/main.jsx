import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App.jsx";
import "./index.css";

const isLocalhost = () => {
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h === "::1";
};

const ADMIN_KEY_LS = "mini_ctf_admin_enabled_v1";

/**
 * Admin unlock (LOCALHOST ONLY):
 * Visit: http://localhost:5173/?admin=YOUR_SECRET
 * - stores a local flag in localStorage
 * - removes query param from URL
 * - admin route will still refuse if not localhost
 */
(() => {
  if (!isLocalhost()) return;

  const params = new URLSearchParams(window.location.search);
  const adminKey = params.get("admin");

  // Put secret in .env as VITE_ADMIN_KEY=MYSECRET
  const SECRET = import.meta.env.VITE_ADMIN_KEY;

  if (adminKey && SECRET && adminKey === SECRET) {
    localStorage.setItem(ADMIN_KEY_LS, "1");
    // clean URL (remove ?admin=...)
    window.history.replaceState({}, "", window.location.pathname);
  }
})();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
