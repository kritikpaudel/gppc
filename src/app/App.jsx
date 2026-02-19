import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Challenge from "../pages/Challenge";
import Admin from "../pages/Admin";
import Ch2Profile from "../pages/Ch2Profile";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />

      {/* ✅ Challenge 2 profile route */}
      <Route path="/challenge/ch2/profile" element={<Ch2Profile />} />

      {/* existing */}
      <Route path="/challenge/:id" element={<Challenge />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
