// src/pages/OrdersPage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import dashboardIcon from "../icons/daszboard.png";
import zanowieniaIcon from "../icons/zanowienia.png";
import kontaktIcon from "../icons/kontakt.png";
import ustawieniaIcon from "../icons/ustawienia.png";

import {
  FileText,
  Download,
  Clock,
  Flame,
  X,
  LogIn,
} from "lucide-react";

import { fetchOrders, createOrder, type Order } from "../api/orders";

type Role = "client" | "manager" | "programmer";

type NavItem = {
  name: string;
  to: string;
  icon: string;
};

type OrdersPageProps = {
  role: Role;
};

/* === Logo === */
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

/* === Sidebar nav === */
const navByRole: Record<Role, NavItem[]> = {
  client: [
    { name: "Dashboard", to: "/dashboard", icon: dashboardIcon },
    { name: "Moje zamówienia", to: "/orders", icon: zanowieniaIcon },
    { name: "Kontakt", to: "/kontakt", icon: kontaktIcon },
    { name: "Ustawienia", to: "/ustawienia", icon: ustawieniaIcon },
  ],
  programmer: [
    { name: "Dashboard", to: "/dashboard", icon: dashboardIcon },
    { name: "Moje zadania", to: "/tasks", icon: zanowieniaIcon },
    { name: "Ustawienia", to: "/prog-ustawienia", icon: ustawieniaIcon },
  ],
  manager: [
    { name: "Dashboard", to: "/dashboard", icon: dashboardIcon },
    { name: "Zamówienia", to: "/manager-orders", icon: zanowieniaIcon },
    { name: "Zgłoszenia", to: "/#", icon: kontaktIcon }, 
    { name: "Ustawienia", to: "/manager-ustawienia", icon: ustawieniaIcon },
  ],
};

/* === Sidebar === */
function Sidebar({ role }: { role: Role }) {
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

/* === Gradient button === */
function GradientButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-8 py-3 font-semibold text-[14px] rounded-xl text-white shadow-md bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)] hover:opacity-90 transition"
    >
      {children}
    </button>
  );
}

/* === Main order card === */
function OrderMainCard({ role, order }: { role: Role; order: Order | null }) {
  const isProgrammer = role === "programmer";

  if (!order) {
    return (
      <div className="flex-1 bg-white rounded-2xl shadow-lg border border-slate-100 p-6 flex items-center justify-center text-slate-500 text-sm">
        Brak zamówień do wyświetlenia.
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="text-[13px] text-slate-500">
            {isProgrammer ? "Twoje zadanie" : "Twoje zamówienie"}
          </div>
          <div className="text-[18px] font-semibold text-slate-900">
            {order.title}
          </div>
        </div>

        <div className="space-y-2 text-[14px]">
          <div>
            Status:{" "}
            <span className="text-[#6D28D9] font-semibold">
              {order.status || "—"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>Postęp:</span>
            <div className="flex-1 h-3 rounded-full bg-slate-100">
              <div className="h-3 w-[85%] rounded-full bg-gradient-to-r from-[#6D28D9] to-[#1F4FE4]" />
            </div>
          </div>
          <div>
            Termin:{" "}
            <span className="text-[#2563EB] font-semibold">27 kwi 2025</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-[13px] text-slate-600">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-100">
              <Clock className="h-3 w-3 text-orange-500" />
            </span>
            <span>
              Ostatnia aktualizacja:{" "}
              <span className="text-[#2563EB] font-semibold">
                27 kwi 2025
              </span>
            </span>
          </div>
        </div>

        <div className="pt-4">
          <button className="px-6 py-2 rounded-xl text-[13px] font-semibold text-white bg-[#5B21D6] hover:bg-[#4C1DB6] transition">
            Zobacz szczegóły
          </button>
        </div>
      </div>
    </div>
  );
}

/* === Client panel (files) === */
function ClientFilesPanel() {
  const files = [
    { name: "Raport.pdf", color: "#F59E0B" },
    { name: "Poprawki.pdf", color: "#F59E0B" },
  ];

  return (
    <div className="w-[260px] bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
      <h2 className="font-semibold mb-4 text-[20px] text-slate-900">
        Pliki
      </h2>

      <div className="space-y-4">
        {files.map((file, idx) => (
          <div
            key={idx}
            className="bg-[#F5F3FF] rounded-2xl p-4 flex flex-col gap-3 shadow-sm"
          >
            {/* Górna linia */}
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <FileText className="h-5 w-5" style={{ color: file.color }} />
              </span>

              <span className="text-slate-800 font-medium text-[15px]">
                {file.name}
              </span>
            </div>

            {/* Przycisk Pobierz */}
            <button className="self-start px-4 py-1.5 text-[13px] font-semibold rounded-xl bg-[linear-gradient(90deg,#8F2AFA,#5F7EFA,#2D19E9)] text-white shadow hover:opacity-90 transition">
              Pobierz
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* === Programmer history panel === */
function ProgrammerHistoryPanel() {
  const history = [
    {
      label: "Gotowe",
      color: "#EF4444",
      iconBg: "bg-red-100",
      icon: Flame,   // 🔥
    },
    {
      label: "Dodany plik pośredni",
      color: "#F59E0B",
      iconBg: "bg-orange-100",
      icon: FileText, // документ
    },
  ];

  return (
    <div className="w-[260px] bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
      <h2 className="font-semibold mb-4 text-[20px] text-slate-900">
        Historia
      </h2>

      <div className="space-y-4">
        {history.map((item, idx) => {
          const Icon = item.icon;

          return (
            <div
              key={idx}
              className="bg-[#F5F3FF] rounded-2xl p-4 flex flex-col gap-3 shadow-sm"
            >
              {/* Górna linia */}
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${item.iconBg}`}
                >
                  <Icon className="h-5 w-5" style={{ color: item.color }} />
                </span>

                <span className="text-slate-800 font-medium text-[15px]">
                  {item.label}
                </span>
              </div>

              {/* Przycisk */}
              <button className="self-start px-4 py-1.5 text-[13px] font-semibold rounded-xl bg-[linear-gradient(90deg,#8F2AFA,#5F7EFA,#2D19E9)] text-white shadow hover:opacity-90 transition">
                Zobacz
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}


/* === Manager panel – nowy, jak z makiet === */
function ManagerFilesPanel() {
  const files = [
    {
      name: "Raport.pdf",
      size: "2.3 MB",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-500",
    },
    {
      name: "Poprawki.pdf",
      size: "3.1 MB",
      iconBg: "bg-green-100",
      iconColor: "text-green-500",
    },
    {
      name: "Gotowe.zip",
      size: "100 MB",
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
    },
  ];

  return (
    <div className="w-[300px] bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
      <h2 className="font-semibold mb-4 text-[16px] text-slate-900">
        Pliki od programisty
      </h2>

      {/* Lista plików */}
      <div className="space-y-3 mb-6">
        {files.map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2"
          >
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${file.iconBg}`}
              >
                <FileText className={`h-5 w-5 ${file.iconColor}`} />
              </span>

              <div className="flex flex-col">
                <span className="font-medium text-slate-800 text-[14px]">
                  {file.name}
                </span>
                <span className="text-[12px] text-slate-500">
                  {file.size}
                </span>
              </div>
            </div>

            {/* Checkbox */}
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300"
            />
          </div>
        ))}
      </div>

      {/* Przyciski */}
      <div className="flex items-center gap-3 mb-6">
        <button className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-slate-200 text-slate-800">
          Pokaż klientowi
        </button>

        <button className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-[#8F2AFA] hover:bg-[#7C22E2] transition flex items-center gap-2">
          <Download className="h-4 w-4" />
          Pobierz
        </button>
      </div>
    </div>
  );
}

function RightSidePanel({ role }: { role: Role }) {
  if (role === "client") return <ClientFilesPanel />;
  if (role === "programmer") return <ProgrammerHistoryPanel />;
  return <ManagerFilesPanel />;
}

/* === Główna strona z logiką Task1 + Task5 === */
export function OrdersPage({ role }: OrdersPageProps) {
  const isProgrammer = role === "programmer";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Task1 – stan formularza
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  // Task5 – pobieranie listy z backendu
  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    fetchOrders()
      .then(setOrders)
      .catch((err) => {
        console.error("fetchOrders error", err);
        setLoadError(
          err instanceof Error
            ? err.message
            : "Nie udało się pobrać listy zamówień."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    setCreateSuccess(null);
    try {
      const newOrder = await createOrder({
        title: form.title,
        description: form.description,
      });
      setOrders((prev) => [newOrder, ...prev]);
      setCreateSuccess("Zamówienie zostało utworzone.");
      setForm({ title: "", description: "" });
      setShowForm(false);
    } catch (err: any) {
      console.error("createOrder error", err);
      // front tylko wypisuje to, co backend zwrócił
      setCreateError(
        err instanceof Error ? err.message : "Nie udało się utworzyć zamówienia."
      );
    } finally {
      setCreating(false);
    }
  }

  const firstOrder = orders[0] ?? null;

  // widoki ładowania / błędu – proste, ale z sidebar
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F2F8]">
        <Sidebar role={role} />
        <main className="md:ml-72 p-10 text-slate-700">Ładowanie zamówień...</main>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#F3F2F8]">
        <Sidebar role={role} />
        <main className="md:ml-72 p-10 text-red-600 whitespace-pre-wrap">
          {loadError}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F2F8]">
      <Sidebar role={role} />

      <main className="md:ml-72">
        {/* Gradient bar */}
        <div className="h-[100px] w-full bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)]" />

        <div className="px-[88px] pt-10 pb-12">
          {/* header */}
          <div>
            <h1 className="text-[32px] font-extrabold text-slate-900">
              {isProgrammer ? "Lista zadań" : "Lista zamówień"}
            </h1>
            <p className="text-slate-500 text-[14px] mt-1">
              {orders.length}{" "}
              {isProgrammer ? "zadań" : "zamówień"} w systemie
            </p>
          </div>

          <div className="mt-10 flex gap-10 items-start">
            <OrderMainCard role={role} order={firstOrder} />
            <RightSidePanel role={role} />
          </div>

          {/* dół strony – przyciski + formularz klienta */}
          <div className="mt-12 space-y-4 max-w-xl">
            {role === "client" && (
              <>
                {createError && (
                  <div className="text-sm text-red-600 whitespace-pre-wrap">
                    {createError}
                  </div>
                )}
                {createSuccess && (
                  <div className="text-sm text-green-600">
                    {createSuccess}
                  </div>
                )}

                {showForm ? (
                  <form
                    onSubmit={handleCreateOrder}
                    className="bg-white rounded-2xl shadow-md border border-slate-200 p-4 space-y-3"
                  >
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Tytuł zamówienia
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        value={form.title}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, title: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Opis
                      </label>
                      <textarea
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        rows={4}
                        value={form.description}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            description: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={creating}
                        className="px-6 py-2 rounded-xl text-sm font-semibold text-white bg-[#8F2AFA] hover:bg-[#7C22E2] disabled:opacity-60"
                      >
                        {creating ? "Tworzenie..." : "Złóż zamówienie"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-200 text-slate-800"
                      >
                        Anuluj
                      </button>
                    </div>
                  </form>
                ) : (
                  <GradientButton onClick={() => setShowForm(true)}>
                    Nowe zamówienie
                  </GradientButton>
                )}
              </>
            )}

            {role === "programmer" && (
              <GradientButton>Zmień status</GradientButton>
            )}

            {role === "manager" && (
              <GradientButton>Zamówienia</GradientButton>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* === Public wrappers for router === */

export function ClientOrdersPage() {
  return <OrdersPage role="client" />;
}

export function ProgrammerOrdersPage() {
  return <OrdersPage role="programmer" />;
}

export function ManagerOrdersPage() {
  return <OrdersPage role="manager" />;
}
