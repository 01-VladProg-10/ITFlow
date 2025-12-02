import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import App from "./App";
import Login from "./login";
import DashboardSwitch from "./DashboardSwitch";

// PAGES
import ManagerReports from "./pages/ManagerReports";
import ManagerReportDetail from "./pages/ManagerReportDetail";
import KontaktUser from "./pages/KontaktUser";
import UserSettings from "./pages/UserSettings";
import ProgSettings from "./pages/ProgSettings";
import ManagerSettings from "./pages/ManagerSettings";
import {
  ClientOrdersPage,
  ProgrammerOrdersPage,
  ManagerOrdersPage,
} from "./pages/OrdersPage";
import OrderFilesPage from "./pages/OrderFilesPage";

// KONFIGURACJA ROUTERA
const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/login", element: <Login /> },
  { path: "/dashboard", element: <DashboardSwitch /> },

  { path: "/kontakt", element: <KontaktUser /> },

  // MANAGER REPORTS
  { path: "/reports", element: <ManagerReports /> },
  { path: "/reports/:id", element: <ManagerReportDetail /> },

  // USTAWIENIA
  { path: "/ustawienia", element: <UserSettings /> },
  { path: "/prog-ustawienia", element: <UserSettings /> },
  { path: "/manager-ustawienia", element: <UserSettings /> },

  // ORDERS
  { path: "/orders", element: <ClientOrdersPage /> },
  { path: "/orders/:orderId/files", element: <OrderFilesPage role="client" /> },

  { path: "/tasks", element: <ProgrammerOrdersPage /> },
  { path: "/tasks/:orderId/files", element: <OrderFilesPage role="programmer" /> },

  { path: "/manager-orders", element: <ManagerOrdersPage /> },
  { path: "/manager-orders/:orderId/files", element: <OrderFilesPage role="manager" /> },
]);

// RENDER
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
