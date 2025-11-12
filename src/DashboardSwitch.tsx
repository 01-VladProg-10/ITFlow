import { useEffect, useState } from "react";
import { fetchMe } from "./api/users";
import type { MeResponse } from "./api/users";

// РОЛІ
const ROLE_CLIENT = "client";
const ROLE_MANAGER = "manager";
const ROLE_PROGRAMMER = "programmer";

import UserDashboard from "./UserDashboard";   
// СТВОРИТИ СТОРІНКИ ДЛЯ КОЖНОГО З НИХ 
function ManagerDashboard() { return <div className="p-6">Panel managera</div>; }
function AdminDashboard() { return <div className="p-6">Panel programisty</div>; }

export default function DashboardSwitch() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMe()
      .then(setMe)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Ładowanie...</div>;
  if (!me) return <div className="p-6">Brak dostępu. Zaloguj się ponownie.</div>;

  const groupNames = (me.groups || []).map(g => (g.name || "").toLowerCase());

  if (groupNames.includes(ROLE_PROGRAMMER))   return <AdminDashboard />;
  if (groupNames.includes(ROLE_MANAGER)) return <ManagerDashboard />;
  if (groupNames.includes(ROLE_CLIENT))  return <UserDashboard />; // твій наявний клієнтський

  return <div className="p-6">Nieznana rola: {groupNames.join(", ") || "—"}</div>;
}
