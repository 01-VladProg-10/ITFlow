import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Clock, X, LogIn } from "lucide-react";

import dashboardIcon from "../icons/daszboard.png";
import zanowieniaIcon from "../icons/zanowienia.png";
import kontaktIcon from "../icons/kontakt.png";
import ustawieniaIcon from "../icons/ustawienia.png";

import { type ContactMessage, getMessages } from "../api/message";

/* === TYPES === */
type Role = "manager";

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

/* === SIDEBAR === */
const navByRole = {
  manager: [
    { name: "Dashboard", to: "/dashboard", icon: dashboardIcon },
    { name: "Zamówienia", to: "/manager-orders", icon: zanowieniaIcon },
    { name: "Zgłoszenia", to: "/reports", icon: kontaktIcon },
    { name: "Ustawienia", to: "/manager-ustawienia", icon: ustawieniaIcon },
  ],
} as const;

function Sidebar({ role }: { role: Role }) {
  const nav = navByRole[role];

  return (
    <aside className="hidden md:block fixed inset-y-0 left-0 z-40">
      <div className="flex h-full w-72 flex-col bg-[linear-gradient(180deg,_#7A36EF_0%,_#2D19E9_100%)] dark:bg-[linear-gradient(180deg,_#4C1D95_0%,_#1E1B4B_35%,_#020617_100%)] text-white">
        <div className="flex items-center justify-between px-4 h-16">
          <Logo />
          <button className="md:hidden rounded-xl p-2 hover:bg-white/10">
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
            className="flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-semibold"
          >
            <LogIn className="h-4 w-4" /> Wyloguj się
          </Link>
        </div>
      </div>
    </aside>
  );
}

/* === REPORT CARD === */
interface ReportCardProps {
  report: ContactMessage;
  section: "new" | "old";
}

function ReportCard({ report, section }: ReportCardProps) {
  return (
    <div className="bg-white dark:bg-itf-darkSurface rounded-2xl border border-slate-200 dark:border-itf-darkBorder shadow-md p-6 hover:shadow-lg transition">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[16px] font-bold text-slate-900 dark:text-white">
              {report.first_name} {report.last_name}
            </h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-300 mt-1">{report.email}</p>
          </div>
          {!report.is_answered && section === "new" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
              Nowe
            </span>
          )}
        </div>

        <div>
          <h4 className="text-[14px] font-semibold text-slate-800 dark:text-slate-200">Wiadomość</h4>
          <p className="text-[13px] text-slate-600 dark:text-slate-300 line-clamp-3">
            {report.request_message}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-itf-darkBorder">
          <div className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-300">
            <Clock className="h-4 w-4" />
            <span>{new Date(report.created_at).toLocaleDateString()}</span>
          </div>
          <Link
            to={`/reports/${report.id}`}
            className="inline-flex items-center px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-[#8F2AFA] hover:bg-[#7C22E2] transition"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Więcej
          </Link>
        </div>
      </div>
    </div>
  );
}

/* === MAIN PAGE === */
export default function ManagerReports() {
  const [reports, setReports] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMessages()
      .then((data) => setReports(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const newReports = reports.filter((r) => !r.is_answered);
  const oldReports = reports.filter((r) => r.is_answered);

  return (
    <div className="min-h-screen bg-[#F3F2F8] dark:bg-[#0B122A] text-slate-900 dark:text-white">
      <Sidebar role="manager" />

      <main className="md:ml-72">
        <div className="h-[100px] w-full bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)] dark:bg-[linear-gradient(90deg,_#4C1D95_0%,_#312E81_40%,_#020617_100%)]" />

        <div className="px-[88px] pt-10 pb-12">
          <h1 className="text-[32px] font-extrabold text-slate-900 dark:text-white">Zgłoszenia</h1>
          <p className="text-slate-500 dark:text-slate-300 text-[14px] mt-1">
            {newReports.length} nowe zgłoszenie{newReports.length !== 1 ? "a" : ""}
          </p>

          {loading && <p className="mt-4 text-slate-500 dark:text-slate-300">Ładowanie...</p>}

          {newReports.length > 0 && (
            <div className="mt-12">
              <h2 className="text-[16px] font-semibold text-slate-700 dark:text-slate-200 mb-4">
                Nowe zgłoszenia
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {newReports.map((report) => (
                  <ReportCard key={report.id} report={report} section="new" />
                ))}
              </div>
            </div>
          )}

          {oldReports.length > 0 && (
            <div className="mt-12">
              <h2 className="text-[16px] font-semibold text-slate-700 dark:text-slate-200 mb-4">
                Stare zgłoszenia
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {oldReports.map((report) => (
                  <ReportCard key={report.id} report={report} section="old" />
                ))}
              </div>
            </div>
          )}

          {!loading && reports.length === 0 && (
            <div className="mt-12 text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-500 dark:text-slate-300">Brak zgłoszeń do wyświetlenia.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
