// src/app/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "../pages/Dashboard.jsx";
import Challenge from "../pages/Challenge.jsx";
import Admin from "../pages/Admin.jsx";

// CH2 special page
import Ch2Profile from "../pages/Ch2Profile.jsx";

import Challenge3 from "../challenges/Challenge3.jsx";
// CH3 admin page
import Ch3Admin from "../challenges/Ch3Admin.jsx";

const ADMIN_KEY_LS = "mini_ctf_admin_enabled_v1";

const isLocalhost = () => {
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1" || h === "::1";
};

export default function App() {
  // ✅ must be localhost AND unlocked via ?admin=SECRET (set by main.jsx)
  const adminEnabled = isLocalhost() && localStorage.getItem(ADMIN_KEY_LS) === "1";

  return (
    <Routes>
      {/* Dashboard */}
      <Route path="/" element={<Dashboard />} />

      {/* CH2 profile pages */}
      <Route path="/challenge/ch2/profile" element={<Ch2Profile />} />
      <Route path="/challenge/ch3" element={<Challenge3 />} />

      {/* CH3 admin page */}
      <Route path="/challenge/ch3/admin" element={<Ch3Admin />} />

      {/* Challenge page (ch1/ch2/ch3/ch4 via /challenge/:id) */}
      <Route path="/challenge/:id" element={<Challenge />} />

      {/* Admin panel (local only + unlocked) */}
      <Route path="/admin" element={adminEnabled ? <Admin /> : <Navigate to="/" replace />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
