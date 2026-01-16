import { useEffect, useState } from "react";
import {
  fetchDashboard,
  type DashboardResponse,
} from "./api/users.ts";

import UserDashboard, {
  ManagerDashboard,
  ProgrammerDashboard,
} from "./UserDashboard.tsx";

const ROLE_CLIENT = "client";
const ROLE_MANAGER = "manager";
const ROLE_PROGRAMMER = "programmer";

export default function DashboardSwitch() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch((err) => {
        console.error("fetchDashboard error", err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Ładowanie...</div>;
  if (!data)
    return (
      <div className="p-6">
        Brak dostępu. Zaloguj się ponownie.
      </div>
    );

  // groups z pola "groups" (["manager"]) i z user.groups ([{name:"manager"}])
  const groupNamesTop = (data.groups || [])
    .map((g) => (g || "").toLowerCase());

  const groupNamesUser = (data.user?.groups || [])
    .map((g) => (g.name || "").toLowerCase());

  const groupNames = Array.from(
    new Set([...groupNamesTop, ...groupNamesUser])
  );

  // przekazujemy latest_order i user dalej do dashboardów
  if (groupNames.includes(ROLE_PROGRAMMER)) {
    return (
      <ProgrammerDashboard
        latestOrder={data.latest_order}
        user={data.user}
      />
    );
  }

  if (groupNames.includes(ROLE_MANAGER)) {
    return (
      <ManagerDashboard
        latestOrder={data.latest_order}
        user={data.user}
      />
    );
  }

  if (groupNames.includes(ROLE_CLIENT)) {
    return (
      <UserDashboard
        latestOrder={data.latest_order}
        user={data.user}
      />
    );
  }

  return (
    <div className="p-6">
      Nieznana rola: {groupNames.join(", ") || "—"}
    </div>
  );
}
