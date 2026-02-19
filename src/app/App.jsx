import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard.jsx";
import Challenge from "../pages/Challenge.jsx";
import Admin from "../pages/Admin.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/challenge/:id" element={<Challenge />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
