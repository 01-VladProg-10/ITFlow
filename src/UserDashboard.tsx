// src/UserDashboard.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  MessageSquare,
  User,
  AlertCircle
} from "lucide-react";

import dashboardIcon from "./icons/daszboard.png";
import zanowieniaIcon from "./icons/zanowienia.png";
import kontaktIcon from "./icons/kontakt.png";
import ustawieniaIcon from "./icons/ustawienia.png";
import logoIcon from "./icons/logo.png";

import type { LatestOrder, DashboardUser } from "./api/users";
import { fetchOrderLogs, type LogEntry } from "./api/logs"; // Importujemy nowe API

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
      <img src={logoIcon} alt="ITFlow" className={className} />
      <span className="font-bold text-xl tracking-tight text-white">
        ITFlow
      </span>
    </div>
  );
}

/* === KONFIGURACJA NAV === */
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

const roleCopy: Record<RoleKey, { primaryLabel: string; buttonText: string }> = {
  client: { primaryLabel: "Twoje zamówienie", buttonText: "Nowe zamówienie" },
  manager: { primaryLabel: "Zamówienie", buttonText: "Wszystkie zamówienia" },
  programmer: { primaryLabel: "Twoje zadanie", buttonText: "Zmień status" },
};

/* === HELPERS === */
function getProgressFromStatus(statusRaw: string | null | undefined): number {
  const status = (statusRaw || "").toLowerCase().trim();
  if (status.includes("submitted") || status.includes("zgłoszone")) return 20;
  if (status.includes("accepted") || status.includes("przyjęte")) return 35;
  if (status.includes("in_progress") || status.includes("realizacji")) return 50;
  if (status.includes("review") || status.includes("sprawdzić") || status.includes("weryfikację")) return 75;
  if (status.includes("done") || status.includes("zakończone")) return 100;
  return 10;
}

function getProgressGradient(progress: number): string {
  if (progress < 40) return "from-[#6D28D9] to-[#1F4FE4]";
  if (progress < 80) return "from-[#6D28D9] to-[#22C55E]";
  return "from-[#16A34A] to-[#22C55E]";
}

function formatLatestOrderDate(latestOrder?: LatestOrder | null): string | null {
  if (!latestOrder) return null;
  // @ts-ignore
  const raw = latestOrder.updated_at || latestOrder.created_at; 
  if (!raw) return null;
  return new Date(raw).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Formatowanie daty dla logów (np. 27 kwi 2025 14:30)
function formatLogDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/* === SIDEBAR === */
function Sidebar({ role, open, onClose }: { role: RoleKey; open: boolean; onClose: () => void }) {
  const nav = navByRole[role];
  const content = (
    <div className="flex h-full w-72 flex-col bg-[linear-gradient(180deg,_#7A36EF_0%,_#2D19E9_100%)] dark:bg-[linear-gradient(180deg,_#4C1D95_0%,_#1E1B4B_35%,_#020617_100%)] text-white">
      <div className="flex items-center justify-between px-4 h-16">
        <Logo />
        <button className="md:hidden rounded-xl p-2 hover:bg-white/10" onClick={onClose}>
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="mt-4 px-3 space-y-1">
        {nav.map(({ name, to, icon }) => (
          <Link key={name} to={to} className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-white/10" onClick={onClose}>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
              <img src={icon} alt={name} className="h-4 w-4" />
            </span>
            <span>{name}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4">
        <Link to="/" className="flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 transition px-4 py-2 text-sm font-semibold">
          <LogIn className="h-4 w-4" /> Wyloguj się
        </Link>
        <div className="mt-4 text-xs text-white/70">© {new Date().getFullYear()} ITFlow</div>
      </div>
    </div>
  );
  return (
    <>
      <aside className="hidden md:block fixed inset-y-0 left-0 z-40">{content}</aside>
      {open && <div className="md:hidden fixed inset-0 z-50 bg-black/40" onClick={onClose}><div className="h-full" onClick={(e) => e.stopPropagation()}>{content}</div></div>}
    </>
  );
}

/* === MAPOWANIE LOGÓW NA UI === */

function getLogStyle(log: LogEntry) {
  // Domyślny styl
  let Icon = AlertCircle;
  let bg = "#94A3B8"; // Slate
  let label = log.description; // Domyślnie używamy opisu

  switch (log.event_type) {
    case "status_change":
      // Pobieramy stary i nowy status
      const oldVal = log.old_value || "Brak";
      const newVal = log.new_value || "Brak";
      
      // *** KLUCZOWA ZMIANA: Konstruowanie nowego opisu z old_value i new_value ***
      if (log.old_value && log.new_value) {
        label = `Status zmieniony z "${oldVal}" na "${newVal}"`;
      } else {
        // Fallback, jeśli brakuje jednego z pól (powinno być rzadkie)
        label = `Zmiana statusu: ${newVal}`; 
      }
      // *** KONIEC KLUCZOWEJ ZMIANY ***

      // Logika kolorowania ikon na podstawie NOWEGO statusu
      const newValLower = newVal.toLowerCase();
      if (newValLower.includes("done") || newValLower.includes("zakończone")) {
        Icon = Flame;
        bg = "#F43F5E"; // Red/Rose
      } else if (newValLower.includes("review") || newValLower.includes("weryfikację")) {
        Icon = CheckCircle;
        bg = "#22C55E"; // Green
      } else if (newValLower.includes("rework") || newValLower.includes("poprawki")) {
        Icon = Wrench;
        bg = "#EAB308"; // Yellow
      } else {
        Icon = RefreshCcw;
        bg = "#3B82F6"; // Blue
      }
      break;

    case "file_added":
      Icon = FileText;
      bg = "#F59E0B"; // Orange
      label = "Dodano nowy plik";
      break;

    case "assignment":
      Icon = User;
      bg = "#8B5CF6"; // Violet
      // Skracamy opis jeśli jest długi
      label = log.description.length > 40 ? "Zmiana w zespole" : log.description;
      break;

    case "comment":
      Icon = MessageSquare;
      bg = "#64748B"; // Slate
      label = "Nowy komentarz";
      break;
    
    default:
        Icon = Eye;
        bg = "#64748B";
        break;
  }

  return { Icon, bg, label, date: formatLogDate(log.timestamp) };
}

/* === MAIN DASHBOARD === */

function Dashboard({ role, latestOrder, user }: DashboardProps) {
  const { primaryLabel, buttonText } = roleCopy[role];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Stan dla historii
  const [historyLogs, setHistoryLogs] = useState<LogEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Pobieranie historii gdy zmienia się latestOrder
  useEffect(() => {
    if (latestOrder?.id) {
      setLoadingHistory(true);
      fetchOrderLogs(latestOrder.id)
        .then((data) => {
          // Bierzemy np. 6 najnowszych wpisów (backend sortuje rosnąco, więc odwracamy)
          const reversed = [...data].reverse().slice(0, 6);
          setHistoryLogs(reversed);
        })
        .catch((err) => console.error("History fetch error:", err))
        .finally(() => setLoadingHistory(false));
    } else {
      setHistoryLogs([]);
    }
  }, [latestOrder]);

  const displayName =
    (user?.first_name || user?.last_name)
      ? `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim()
      : user?.username ?? "Użytkowniku";

  const greeting = `👋 Witaj, ${displayName}!`;

  let subText: string;
  if (!latestOrder) {
    subText = role === "programmer" ? "Brak zadań z aktualizacjami." : "Brak zamówień z aktualizacjami.";
  } else {
    const base = role === "programmer" ? "Ostatnie zadanie ma status" : "Ostatnie zamówienie ma status";
    subText = `${base}: ${latestOrder.status ?? "nieznany"}.`;
  }

  const orderTitle = latestOrder?.title ?? "Brak zamówień";
  const orderStatus = latestOrder?.status ?? "—";
  const progress = getProgressFromStatus(latestOrder?.status);
  const progressGradient = getProgressGradient(progress);
  const updatedLabel = formatLatestOrderDate(latestOrder);

  return (
    <div className="min-h-screen bg-[#F3F2F8] text-slate-900 dark:bg-[#0B122A] dark:text-white">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 bg-white/80 dark:bg-[#0B122A] backdrop-blur border-b border-slate-200 dark:border-itf-darkBorder">
        <div className="h-14 flex items-center justify-between px-4">
          <button onClick={() => setSidebarOpen(true)} className="rounded-xl p-2 hover:bg-slate-100">
            <Menu className="h-6 w-6" />
          </button>
          <div className="font-bold">ITFlow</div>
          <Link to="/" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 dark:from-itf-accent dark:to-indigo-600">
            <LogIn className="h-4 w-4" /> Wyloguj
          </Link>
        </div>
      </header>

      <Sidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="md:ml-72">
        <div className="h-[100px] w-full bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)] dark:bg-[linear-gradient(90deg,_#4C1D95_0%,_#1E1B4B_40%,_#020617_100%)]" />

        <div className="px-6 md:px-[88px] pt-6 pb-10">
          <div className="mt-8 md:mt-12">
            
            {/* Greeting */}
            <div className="mb-8">
              <h1 className="text-[26px] md:text-[32px] font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                {greeting}
              </h1>
              <p className="text-slate-500 dark:text-slate-300 text-[14px] mt-1">{subText}</p>
            </div>

            <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-[88px]">
              {/* LEFT CARD */}
              <div className="w-full lg:w-[645px] self-start bg-white dark:bg-itf-darkSurface rounded-2xl shadow-lg border border-slate-100 dark:border-itf-darkBorder p-6">
                <div className="space-y-6">
                  <div>
                    <div className="text-[13px] text-slate-500 dark:text-slate-300">{primaryLabel}</div>
                    <div className="text-[18px] font-semibold text-slate-900 dark:text-white mt-1">{orderTitle}</div>
                  </div>
                  <div>
                    <div className="text-[14px] text-slate-900 dark:text-white">
                      Status: <span className="text-[#6D28D9] dark:text-purple-200 font-semibold">{orderStatus}</span>
                    </div>
                    <div className="mt-2 h-3 rounded-full bg-slate-100 dark:bg-itf-darkBorder overflow-hidden">
                      <div className={`h-3 rounded-full bg-gradient-to-r ${progressGradient}`} style={{ width: `${progress}%` }} />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[12px] text-slate-500 dark:text-slate-300">
                      <span>{progress}% ukończone</span>
                      {updatedLabel && <span>Ostatnia aktualizacja: <span className="text-[#2563EB] dark:text-indigo-400 font-semibold">{updatedLabel}</span></span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT CARD — Historia (Dynamiczna) */}
              <div className="w-full lg:w-[350px] bg-white dark:bg-itf-darkSurface rounded-2xl shadow-lg border border-slate-100 dark:border-itf-darkBorder p-6">
                <div className="text-slate-900 dark:text-white font-semibold mb-4 text-[14px] flex justify-between items-center">
                  <span>Historia działań</span>
                </div>

                {loadingHistory ? (
                  <div className="py-4 text-center text-xs text-slate-400 dark:text-slate-300">Ładowanie historii...</div>
                ) : historyLogs.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400 dark:text-slate-300">Brak wpisów w historii.</div>
                ) : (
                  <ul className="space-y-3 text-[14px]">
                    {historyLogs.map((log) => {
                      const { Icon, bg, label, date } = getLogStyle(log);
                      return (
                        <li key={log.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
                            <span
                              className="h-8 w-8 rounded-full flex items-center justify-center shadow shrink-0"
                              style={{ backgroundColor: bg }}
                            >
                              <Icon size={16} color="#FFFFFF" />
                            </span>
                            <div className="flex flex-col">
                              <span className="line-clamp-1" title={label}>{label}</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-300 md:hidden">{date}</span>
                            </div>
                          </div>
                          <span className="text-slate-400 dark:text-slate-300 text-xs whitespace-nowrap hidden md:block">
                            {date}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-10 md:mt-14 flex justify-center px-6 pb-10">
          <button
            className="w-full sm:w-auto px-8 py-3 font-semibold text-[14px] rounded-xl text-white shadow-md bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)] dark:bg-[linear-gradient(90deg,_#4C1D95_0%,_#1E1B4B_40%,_#020617_100%)] hover:opacity-90 transition"
            onClick={() => {
              if (role === "client") navigate("/orders?new=1");
              else if (role === "manager") navigate("/manager-orders");
              else if (role === "programmer") navigate("/tasks");
            }}
          >
            {buttonText}
          </button>
        </div>
      </main>
    </div>
  );
}

export default function UserDashboard(props: DashboardWrapperProps) {
  return <Dashboard role="client" latestOrder={props.latestOrder} user={props.user} />;
}

export function ManagerDashboard(props: DashboardWrapperProps) {
  return <Dashboard role="manager" latestOrder={props.latestOrder} user={props.user} />;
}

export function ProgrammerDashboard(props: DashboardWrapperProps) {
  return <Dashboard role="programmer" latestOrder={props.latestOrder} user={props.user} />;
}
