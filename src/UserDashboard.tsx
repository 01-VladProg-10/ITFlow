// src/UserDashboard.tsx
import { useState } from "react";

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
  Menu,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import type { LatestOrder, DashboardUser } from "./api/users";

/* === TYPES === */

type RoleKey = "client" | "manager" | "programmer";

type NavItem = {
  name: string;
  to: string;
  icon: string;
};

type DashboardProps = {
  role: RoleKey;
  latestOrder?: LatestOrder | null;
  user?: DashboardUser;
};

type DashboardWrapperProps = {
  latestOrder?: LatestOrder | null;
  user?: DashboardUser;
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
      <span className="font-bold text-xl tracking-tight text-white">
        ITFlow
      </span>
    </div>
  );
}

/* === КОНФІГ НАВІГАЦІЇ ПО РОЛЯХ === */

const navByRole: Record<RoleKey, NavItem[]> = {
  client: [
    { name: "Dashboard", to: "/dashboard", icon: dashboardIcon },
    { name: "Moje zamówienia", to: "/orders", icon: zanowieniaIcon },
    { name: "Kontakt", to: "/kontakt", icon: kontaktIcon },
    { name: "Ustawienia", to: "/ustawienia", icon: ustawieniaIcon },
  ],
  manager: [
    { name: "Dashboard", to: "/dashboard", icon: dashboardIcon },
    { name: "Zamówienia", to: "/manager-orders", icon: zanowieniaIcon },
    { name: "Zgłoszenia", to: "/reports", icon: kontaktIcon },
    { name: "Ustawienia", to: "/manager-ustawienia", icon: ustawieniaIcon },
  ],
  programmer: [
    { name: "Dashboard", to: "/dashboard", icon: dashboardIcon },
    { name: "Moje zadania", to: "/tasks", icon: zanowieniaIcon },
    { name: "Ustawienia", to: "/prog-ustawienia", icon: ustawieniaIcon },
  ],
};

/**
 * Тепер roleCopy зберігає тільки те, що не залежить від бекенду.
 * greeting і subText будемо рахувати динамічно всередині Dashboard.
 */
const roleCopy: Record<
  RoleKey,
  {
    primaryLabel: string;
    buttonText: string;
  }
> = {
  client: {
    primaryLabel: "Twoje zamówienie",
    buttonText: "Nowe zamówienie",
  },
  manager: {
    primaryLabel: "Zamówienie",
    buttonText: "Wszystkie zamówienia",
  },
  programmer: {
    primaryLabel: "Twoje zadanie",
    buttonText: "Zmień status",
  },
};

/* === SIDEBAR (desktop + mobile overlay) === */

function Sidebar({
  role,
  open,
  onClose,
}: {
  role: RoleKey;
  open: boolean;
  onClose: () => void;
}) {
  const nav = navByRole[role];

  const content = (
    <div className="flex h-full w-72 flex-col bg-[linear-gradient(180deg,_#7A36EF_0%,_#2D19E9_100%)] text-white">
      <div className="flex items-center justify-between px-4 h-16">
        <Logo />
        {/* X видно тільки на мобілці */}
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
            to={to}
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

/* === ІСТОРІЯ (правий блок) — однакова для всіх === */

const history = [
  { Icon: Flame, bg: "#F43F5E", label: "Gotowe", date: "27 kwi 2025" },
  {
    Icon: FileText,
    bg: "#F59E0B",
    label: "Dodany plik pośredni",
    date: "23 kwi 2025",
  },
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

/* === ГОЛОВНИЙ DASHBOARD === */

function Dashboard({ role, latestOrder, user }: DashboardProps) {
  const { primaryLabel, buttonText } = roleCopy[role];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Ім'я користувача з беку
  const displayName =
    (user?.first_name || user?.last_name)
      ? `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim()
      : user?.username ?? "Użytkowniku";

  const greeting = `👋 Witaj, ${displayName}!`;

  // Динамічний subText на основі latest_order
  let subText: string;
  if (!latestOrder) {
    subText =
      role === "programmer"
        ? "Brak zadań z aktualizacjami."
        : "Brak zamówień z aktualizacjami.";
  } else {
    const base =
      role === "programmer" ? "Ostatnie zadanie ma status" : "Ostatnie zamówienie ma status";
    subText = `${base}: ${latestOrder.status ?? "nieznany"}.`;
  }

  // Дані в картці з бекенду, з fallback
  const orderTitle = latestOrder?.title ?? "Brak zamówień";
  const orderStatus = latestOrder?.status ?? "—";

  return (
    <div className="min-h-screen bg-[#F3F2F8]">
      {/* mobile header */}
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

      <Sidebar
        role={role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="md:ml-72">
        <div className="h-[100px] w-full bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)]" />

        <div className="px-6 md:px-[88px] pt-6 pb-10">
          <div className="mt-8 md:mt-12">
            {/* welcome */}
            <div className="mb-8">
              <h1 className="text-[26px] md:text-[32px] font-extrabold text-slate-900 flex items-center gap-2">
                {greeting}
              </h1>
              <p className="text-slate-500 text-[14px] mt-1">{subText}</p>
            </div>

            <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-[88px]">
              {/* LEFT CARD — zamówienie / zadanie */}
              <div className="w-full lg:w-[645px] self-start bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                <div className="space-y-6">
                  <div>
                    <div className="text-[13px] text-slate-500">
                      {primaryLabel}
                    </div>
                    <div className="text-[18px] font-semibold text-slate-900 mt-1">
                      {orderTitle}
                    </div>
                  </div>

                  <div>
                    <div className="text-[14px]">
                      Status:{" "}
                      <span className="text-[#6D28D9] font-semibold">
                        {orderStatus}
                      </span>
                    </div>
                    <div className="mt-2 h-3 rounded-full bg-slate-100 mb-6">
                      <div className="h-3 w-[85%] rounded-full bg-gradient-to-r from-[#6D28D9] to-[#1F4FE4]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT CARD — historia */}
              <div className="w-full lg:w-[350px] bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                <div className="text-slate-900 font-semibold mb-4 text-[14px]">
                  Historia działań
                </div>
                <ul className="space-y-3 text-[14px]">
                  {history.map(({ Icon, bg, label, date }, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 text-slate-800">
                        <span
                          className="h-8 w-8 rounded-full flex items-center justify-center shadow"
                          style={{ backgroundColor: bg }}
                        >
                          <Icon size={16} color="#FFFFFF" />
                        </span>
                        {label}
                      </div>
                      <span className="text-slate-400 text-xs whitespace-nowrap">
                        {date}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Кнопка внизу — різна логіка залежно від ролі */}
        <div className="-mt-8 md:-mt-12 flex justify-center px-6 pb-10">
          <button
            className="w-full sm:w-auto px-8 py-3 font-semibold text-[14px] rounded-xl text-white shadow-md bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)] hover:opacity-90 transition"
            onClick={() => {
              if (role === "client") {
                navigate("/orders?new=1");
              } else if (role === "manager") {
                navigate("/manager-orders");
              } else if (role === "programmer") {
                navigate("/tasks");
              }
            }}
          >
            {buttonText}
          </button>
        </div>
      </main>
    </div>
  );
}

/* === ЕКСПОРТИ ДЛЯ РІЗНИХ РОЛЕЙ (DashboardSwitch їх викликає) === */

export default function UserDashboard(props: DashboardWrapperProps) {
  return (
    <Dashboard
      role="client"
      latestOrder={props.latestOrder}
      user={props.user}
    />
  );
}

export function ManagerDashboard(props: DashboardWrapperProps) {
  return (
    <Dashboard
      role="manager"
      latestOrder={props.latestOrder}
      user={props.user}
    />
  );
}

export function ProgrammerDashboard(props: DashboardWrapperProps) {
  return (
    <Dashboard
      role="programmer"
      latestOrder={props.latestOrder}
      user={props.user}
    />
  );
}
