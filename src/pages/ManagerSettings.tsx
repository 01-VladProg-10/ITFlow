import { useState } from "react";
import { X, LogIn, Menu } from "lucide-react";
import { Link } from "react-router-dom";

import dashboardIcon from "../icons/daszboard.png";
import zanowieniaIcon from "../icons/zanowienia.png";
import kontaktIcon from "../icons/kontakt.png";
import ustawieniaIcon from "../icons/ustawienia.png";

/* === Sidebar === */
function Logo({ className = "h-7 w-auto" }) {
  return (
    <div className="flex items-center gap-2">
      <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden>
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
        <path
          d="M12 46c10 4 29-2 34-14"
          stroke="url(#g)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="46" cy="22" r="6" fill="url(#g)" />
      </svg>
      <span className="font-bold text-xl tracking-tight text-white">
        ITFlow
      </span>
    </div>
  );
}

const nav = [
  { name: "Dashboard", to: "/dashboard", icon: dashboardIcon },
  { name: "Zamówienia", to: "/manager-orders", icon: zanowieniaIcon },
  { name: "Zgłoszenia", to: "/reports", icon: kontaktIcon },
  { name: "Ustawienia", to: "/manager-ustawienia", icon: ustawieniaIcon },
];

function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const content = (
    <div className="flex h-full w-72 flex-col bg-[linear-gradient(180deg,_#7A36EF_0%,_#2D19E9_100%)] text-white">
      <div className="flex items-center justify-between px-4 h-16">
        <Logo />
        <button
          className="md:hidden rounded-xl p-2 hover:bg-white/10"
          aria-label="Zamknij menu"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <nav className="mt-4 px-3 space-y-1">
        {nav.map(({ name, to, icon }) => (
          <Link
            key={name}
            to={to ?? "#"}
            className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-white/10"
            onClick={onClose}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
              <img src={icon} alt={name} className="h-4 w-4" />
            </span>
            <span>{name}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto p-4">
        <Link
          to="/"
          className="flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 transition px-4 py-2 text-sm font-semibold"
        >
          <LogIn className="h-4 w-4" /> Wyloguj się
        </Link>

        <div className="mt-4 text-xs text-white/70">
          © {new Date().getFullYear()} ITFlow
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-40">
        {content}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40"
          onClick={onClose}
        >
          <div className="h-full" onClick={(e) => e.stopPropagation()}>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
/* === end Sidebar === */

export default function ManagerSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactMethod: "",
    workHours: "",
  });

  const handleChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const displayValue = (value: string) => (value.trim() === "" ? "-" : value);

  return (
    <div className="min-h-screen bg-[#F3F2F8]">
      {/* Mobile header */}
      <header className="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="h-14 flex items-center justify-between px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl p-2 hover:bg-slate-100"
            aria-label="Otwórz menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="font-bold">ITFlow</div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600"
          >
            <LogIn className="h-4 w-4" />
            Wyloguj
          </Link>
        </div>
      </header>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="md:ml-72">
        <div className="h-[100px] w-full bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)]" />

        <div className="px-6 md:px-[88px] pt-6 pb-10">
          <div className="mt-8 md:mt-12 max-w-[645px]">
            <h1 className="text-[26px] md:text-[32px] font-extrabold text-slate-900 flex items-center gap-2">
              👔 Ustawienia managera
            </h1>
            <p className="text-slate-500 text-[14px] mt-1">
              Zarządzaj swoim profilem managerskim
            </p>

            <div className="mt-6 bg-white rounded-2xl shadow-lg border border-slate-100 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex flex-col space-y-2">
                  <label className="font-medium">Imię</label>
                  <input
                    type="text"
                    className="border rounded p-2"
                    value={
                      editing
                        ? profile.firstName
                        : displayValue(profile.firstName)
                    }
                    disabled={!editing}
                    onChange={(e) =>
                      handleChange("firstName", e.target.value)
                    }
                  />
                </div>

                <div className="flex-1 flex flex-col space-y-2">
                  <label className="font-medium">Nazwisko</label>
                  <input
                    type="text"
                    className="border rounded p-2"
                    value={
                      editing
                        ? profile.lastName
                        : displayValue(profile.lastName)
                    }
                    disabled={!editing}
                    onChange={(e) =>
                      handleChange("lastName", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="font-medium">Email</label>
                <input
                  type="email"
                  className="border rounded p-2"
                  value={editing ? profile.email : displayValue(profile.email)}
                  disabled={!editing}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>

              {/* Preferowany sposób kontaktu */}
              <div className="flex flex-col space-y-2">
                <label className="font-medium">
                  Preferowany sposób kontaktu
                </label>
                <select
                  className="border rounded p-2"
                  value={
                    editing
                      ? profile.contactMethod
                      : displayValue(profile.contactMethod)
                  }
                  disabled={!editing}
                  onChange={(e) =>
                    handleChange("contactMethod", e.target.value)
                  }
                >
                  <option value="">-</option>
                  <option value="Email">Email</option>
                  <option value="Telefon">Telefon</option>
                  <option value="Teams">Teams</option>
                  <option value="Slack">Slack</option>
                </select>
              </div>

              {/* Godziny pracy */}
              <div className="flex flex-col space-y-2">
                <label className="font-medium">Godziny pracy</label>
                <select
                  className="border rounded p-2"
                  value={
                    editing
                      ? profile.workHours
                      : displayValue(profile.workHours)
                  }
                  disabled={!editing}
                  onChange={(e) => handleChange("workHours", e.target.value)}
                >
                  <option value="">-</option>
                  <option value="9:00-17:00">9:00-17:00</option>
                  <option value="8:00-16:00">8:00-16:00</option>
                  <option value="10:00-18:00">10:00-18:00</option>
                </select>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setEditing(!editing)}
                  className="px-8 py-3 font-semibold text-[14px] rounded-xl text-white shadow-md bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)] hover:opacity-90 transition"
                >
                  {editing ? "Zapisz" : "Edytuj profil"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
