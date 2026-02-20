import Dashboard from "../pages/Dashboard";
import Challenge from "../pages/Challenge";
import Admin from "../pages/Admin";


export const routes = [
  { path: "/", element: <Dashboard /> },
  { path: "/challenge/:id", element: <Challenge /> },
  { path: "/admin", element: <Admin /> },
];
