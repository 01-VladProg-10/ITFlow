import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import App from "./App";
import Login from "./login";
<<<<<<< HEAD
=======
import KontaktUser from "./pages/KontaktUser";
import DashboardSwitch from "./DashboardSwitch";
import UserSettings from "./pages/UserSettings";
import ProgSettings from "./pages/ProgSettings";
import ManagerSettings from "./pages/ManagerSettings";
import {
  ClientOrdersPage,
  ProgrammerOrdersPage,
  ManagerOrdersPage,
} from "./pages/OrdersPage";
import ManagerReports from "./pages/ManagerReports";
import OrderFilesPage from "./pages/OrderFilesPage";
>>>>>>> 167d2b46339eef27cb1c19d34fbdb3708b3443a1

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/login", element: <Login /> },
<<<<<<< HEAD
=======
  { path: "/dashboard", element: <DashboardSwitch /> },

  { path: "/kontakt", element: <KontaktUser /> },
  { path: "/reports", element: <ManagerReports /> },


  { path: "/ustawienia", element: <UserSettings /> },
  { path: "/prog-ustawienia", element: <ProgSettings /> },
  { path: "/manager-ustawienia", element: <ManagerSettings /> },


  { path: "/orders", element: <ClientOrdersPage /> },          
  { path: "/tasks", element: <ProgrammerOrdersPage /> },      
  { path: "/manager-orders", element: <ManagerOrdersPage /> }, 

 /* CLIENT */
  { path: "/orders", element: <ClientOrdersPage /> },
  { path: "/orders/:orderId/files", element: <OrderFilesPage role="client" /> },

  /* PROGRAMMER */
  { path: "/tasks", element: <ProgrammerOrdersPage /> },
  { path: "/tasks/:orderId/files", element: <OrderFilesPage role="programmer" /> },

  /* MANAGER */
  { path: "/manager-orders", element: <ManagerOrdersPage /> },
  {
    path: "/manager-orders/:orderId/files",
    element: <OrderFilesPage role="manager" />,
  },
>>>>>>> 167d2b46339eef27cb1c19d34fbdb3708b3443a1
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
