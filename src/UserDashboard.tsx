import dashboardIcon from "./icons/daszboard.png";
import zanowieniaIcon from "./icons/zanowienia.png";
import kontaktIcon from "./icons/kontakt.png";
import ustawieniaIcon from "./icons/ustawienia.png";

import {
  Flame,
  FileText,
  Wrench,
  CheckCircle,
  RefreshCcw,
  Eye,
  X,
  LogIn,
} from "lucide-react";
import { Link } from "react-router-dom";

/* === TYPES === */

type RoleKey = "client" | "manager" | "programmer";

type NavItem = {
  name: string;
  to: string;
  icon: string;
};

/* === LOGO === */

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
      <span className="font-bold text-xl tracking-tight text-white">ITFlow</span>
    </div>
  );
}

/* === КОНФІГ НАВІГАЦІЇ ПО РОЛЯХ === */

const navByRole: Record<RoleKey, NavItem[]> = {
  client: [
    { name: "Dashboard", to: "#", icon: dashboardIcon },
    { name: "Moje zamówienia", to: "#", icon: zanowieniaIcon },
    { name: "Kontakt", to: "/kontakt", icon: kontaktIcon },
    { name: "Ustawienia", to: "#", icon: ustawieniaIcon },
  ],
  manager: [
    { name: "Dashboard", to: "#", icon: dashboardIcon },
    { name: "Zamówienia", to: "#", icon: zanowieniaIcon },
    { name: "Zgłoszenia", to: "#", icon: kontaktIcon },
    { name: "Ustawienia", to: "#", icon: ustawieniaIcon },
  ],
  programmer: [
    { name: "Dashboard", to: "#", icon: dashboardIcon },
    { name: "Moje zadania", to: "#", icon: zanowieniaIcon },
    { name: "Ustawienia", to: "#", icon: ustawieniaIcon },
  ],
};

/* === ТЕКСТИ ПО РОЛЯХ (центр екрана) === */

const roleCopy: Record<
  RoleKey,
  {
    greeting: string;
    subText: string;
    primaryLabel: string;
    buttonText: string;
  }
> = {
  client: {
    greeting: "👋 Witaj, Jan Kowalski!",
    subText: "1 zamówienie ma aktualizację",
    primaryLabel: "Twoje zamówienie",
    buttonText: "Nowe zamówienie",
  },
  manager: {
    greeting: "👋 Witaj, Kacper Pasternak!",
    subText: "1 zamówienie ma aktualizację",
    primaryLabel: "Zamówienie",
    buttonText: "Wszystkie zamówienia",
  },
  programmer: {
    greeting: "👋 Witaj, Anna Nowak!",
    subText: "1 zadanie ma aktualizację",
    primaryLabel: "Twoje zadanie",
    buttonText: "Zmień status",
  },
};

/* === Sidebar === */

function Sidebar({ role }: { role: RoleKey }) {
  const nav = navByRole[role];

  return (
    <aside className="hidden md:block fixed inset-y-0 left-0 z-40">
      <div className="flex h-full w-72 flex-col bg-[linear-gradient(180deg,_#7A36EF_0%,_#2D19E9_100%)] text-white">
        <div className="flex items-center justify-between px-4 h-16">
          <Logo />
          <button
            className="md:hidden rounded-xl p-2 hover:bg-white/10"
            aria-label="Zamknij menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-4 px-3 space-y-1">
          {nav.map(({ name, to, icon }) => (
            <Link
              key={name}
              to={to}
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

          <div className="mt-4 text-xs text-white/70">
            © {new Date().getFullYear()} ITFlow
          </div>
        </div>
      </div>
    </aside>
  );
}

/* === ІСТОРІЯ (правий блок) — однакова для всіх === */

const history = [
  { Icon: Flame, bg: "#F43F5E", label: "Gotowe", date: "27 kwi 2025" },
  { Icon: FileText, bg: "#F59E0B", label: "Dodany plik pośredni", date: "23 kwi 2025" },
  { Icon: Wrench, bg: "#EAB308", label: "Do poprawy", date: "23 kwi 2025" },
  {
    Icon: CheckCircle,
    bg: "#22C55E",
    label: "Do sprawdzania klientowi",
    date: "22 kwi 2025",
  },
  { Icon: RefreshCcw, bg: "#3B82F6", label: "W realizacji", date: "13 kwi 2025" },
  { Icon: Eye, bg: "#8B5CF6", label: "Do rozpatrzenia", date: "12 kwi 2025" },
];

/* === ГОЛОВНИЙ DASHBOARD, параметризований роллю === */

function Dashboard({ role }: { role: RoleKey }) {
  const copy = roleCopy[role];

  return (
    <div className="min-h-screen bg-[#F3F2F8]">
      <Sidebar role={role} />

      <main className="md:ml-72">
        <div className="h-[100px] w-full bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)]" />

        <div className="px-[88px] pt-6 pb-10">
          <div className="mt-12">
            {/* welcome */}
            <div className="mb-8">
              <h1 className="text-[32px] font-extrabold text-slate-900 flex items-center gap-2">
                {copy.greeting}
              </h1>
              <p className="text-slate-500 text-[14px] mt-1">{copy.subText}</p>
            </div>

            <div className="flex items-start gap-[88px]">
              {/* LEFT CARD */}
              <div className="w-[645px] self-start bg-white rounded-2xl shadow-lg border border-slate-100 p-6 pb-6">
                <div className="space-y-6">
                  <div>
                    <div className="text-[13px] text-slate-500">
                      {copy.primaryLabel}
                    </div>
                    <div className="text-[18px] font-semibold text-slate-900 mt-1">
                      Tworzenie strony WWWI
                    </div>
                  </div>

                  <div>
                    <div className="text-[14px]">
                      Status:{" "}
                      <span className="text-[#6D28D9] font-semibold">Gotowe</span>
                    </div>
                    <div className="mt-2 h-3 rounded-full bg-slate-100 mb-6">
                      <div className="h-3 w-[85%] rounded-full bg-gradient-to-r from-[#6D28D9] to-[#1F4FE4]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT CARD */}
              <div className="w-[350px] bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                <div className="text-slate-900 font-semibold mb-4 text-[14px]">
                  Historia działań
                </div>
                <ul className="space-y-3 text-[14px]">
                  {history.map(({ Icon, bg, label, date }, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-slate-800">
                        <span
                          className="h-8 w-8 rounded-full flex items-center justify-center shadow"
                          style={{ backgroundColor: bg }}
                        >
                          <Icon size={16} color="#FFFFFF" />
                        </span>
                        {label}
                      </div>
                      <span className="text-slate-400 text-xs">{date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="-mt-12 flex justify-center">
          <button className="px-8 py-3 font-semibold text-[14px] rounded-xl text-white shadow-md bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)] hover:opacity-90 transition">
            {copy.buttonText}
          </button>
        </div>
      </main>
    </div>
  );
}

/* === ЕКСПОРТИ ДЛЯ РІЗНИХ РОЛЕЙ === */

// Client
export default function UserDashboard() {
  return <Dashboard role="client" />;
}

// Менеджер
export function ManagerDashboard() {
  return <Dashboard role="manager" />;
}

// Програміст
export function ProgrammerDashboard() {
  return <Dashboard role="programmer" />;
}
