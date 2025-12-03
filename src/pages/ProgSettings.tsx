import { useState } from "react";
import { X, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

import dashboardIcon from "../icons/daszboard.png";
import zanowieniaIcon from "../icons/zanowienia.png";
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
        <path d="M12 46c10 4 29-2 34-14" stroke="url(#g)" strokeWidth="6" strokeLinecap="round" />
        <circle cx="46" cy="22" r="6" fill="url(#g)" />
      </svg>
      <span className="font-bold text-xl tracking-tight text-white">ITFlow</span>
    </div>
  );
}

const nav = [
  { name: "Dashboard", to: "/dashboard", icon: dashboardIcon },
  { name: "Moje zadania", to: "/tasks", icon: zanowieniaIcon },
  { name: "Ustawienia", to: "/prog-ustawienia", icon: ustawieniaIcon },
];

function Sidebar() {
  return (
    <aside className="hidden md:block fixed inset-y-0 left-0 z-40">
      <div className="flex h-full w-72 flex-col bg-[linear-gradient(180deg,_#7A36EF_0%,_#2D19E9_100%)] text-white">
        <div className="flex items-center justify-between px-4 h-16">
          <Logo />
          <button className="md:hidden rounded-xl p-2 hover:bg-white/10" aria-label="Zamknij menu">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-4 px-3 space-y-1">
          {nav.map(({ name, to, icon }) => (
            <Link
              key={name}
              to={to ?? "#"}
              className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-white/10"
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

          <div className="mt-4 text-xs text-white/70">© {new Date().getFullYear()} ITFlow</div>
        </div>
      </div>
    </aside>
  );
}
/* === end Sidebar === */

export default function ProgSettings() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    languages: "",
    git: "",
  });

  const handleChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const displayValue = (value: string) => (value.trim() === "" ? "-" : value);

  return (
    <div className="min-h-screen bg-[#F3F2F8]">
      <Sidebar />

      <main className="md:ml-72">
        <div className="h-[100px] w-full bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)]" />

        <div className="px-[88px] pt-6 pb-10">
          <div className="mt-12 max-w-[645px]">
            <h1 className="text-[32px] font-extrabold text-slate-900 flex items-center gap-2">
              💻 Ustawienia programisty
            </h1>
            <p className="text-slate-500 text-[14px] mt-1">
              Zarządzaj swoim profilem programistycznym
            </p>

            <div className="mt-6 bg-white rounded-2xl shadow-lg border border-slate-100 p-6 space-y-6">

              <div className="flex gap-4">
                <div className="flex-1 flex flex-col space-y-2">
                  <label className="font-medium">Imię</label>
                  <input
                    type="text"
                    className="border rounded p-2"
                    value={editing ? profile.firstName : displayValue(profile.firstName)}
                    disabled={!editing}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                  />
                </div>

                <div className="flex-1 flex flex-col space-y-2">
                  <label className="font-medium">Nazwisko</label>
                  <input
                    type="text"
                    className="border rounded p-2"
                    value={editing ? profile.lastName : displayValue(profile.lastName)}
                    disabled={!editing}
                    onChange={(e) => handleChange("lastName", e.target.value)}
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

              <div className="flex flex-col space-y-2">
                <label className="font-medium">Języki programowania</label>
                <input
                  type="text"
                  className="border rounded p-2"
                  value={editing ? profile.languages : displayValue(profile.languages)}
                  disabled={!editing}
                  onChange={(e) => handleChange("languages", e.target.value)}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="font-medium">Git (opcjonalnie)</label>
                <input
                  type="text"
                  className="border rounded p-2"
                  value={editing ? profile.git : displayValue(profile.git)}
                  disabled={!editing}
                  onChange={(e) => handleChange("git", e.target.value)}
                />
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
