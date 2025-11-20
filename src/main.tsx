import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import App from "./App";
import Login from "./login";
import UserDashboard from "./UserDashboard";
import KontaktUser from "./pages/KontaktUser";
import UserSettings from "./pages/UserSettings";
import ProgSettings from "./pages/ProgSettings";
import ManagerSettings from "./pages/ManagerSettings";


const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/login", element: <Login /> },
  { path: "/dashboard", element: <UserDashboard /> },
  { path: "/kontakt", element: <KontaktUser /> },
  { path: "/ustawienia", element: <UserSettings /> },
  { path: "/prog-ustawienia", element: <ProgSettings /> },
  { path: "/manager-ustawienia", element: <ManagerSettings /> },

]);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
