// src/pages/OrdersPage.tsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import dashboardIcon from "../icons/daszboard.png";
import zanowieniaIcon from "../icons/zanowienia.png";
import kontaktIcon from "../icons/kontakt.png";
import ustawieniaIcon from "../icons/ustawienia.png";

import { FileText, Clock, Flame, X, LogIn } from "lucide-react";

import { fetchOrders, createOrder, type Order } from "../api/orders";

type Role = "client" | "manager" | "programmer";

/** Розширюємо Order локально, щоб мати дати з беку (якщо будуть) */
type OrderWithMeta = Order & {
  updated_at?: string | null;
  created_at?: string | null;
};

/* === LOGO (як у тебе в інших файлах) === */
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

/* -------------------- SIDEBAR NAV -------------------- */

const navByRole = {
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
    { name: "Zgłoszenia", to: "/reports", icon: kontaktIcon },
    { name: "Ustawienia", to: "/manager-ustawienia", icon: ustawieniaIcon },
  ],
} as const;

/* -------------------- SIDEBAR -------------------- */
export function Sidebar({ role }: { role: Role }) {
  const nav = navByRole[role];

  return (
    <aside className="hidden md:block fixed inset-y-0 left-0 z-40">
      <div className="flex h-full w-72 flex-col bg-[linear-gradient(180deg,_#7A36EF_0%,_#2D19E9_100%)] text-white">
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

/* -------------------- PROGRESS HELPERS -------------------- */

/** Мапимо статус → % прогресу */
function getProgressFromStatus(statusRaw: string | null | undefined): number {
  const status = (statusRaw || "").toLowerCase().trim();

  switch (status) {
    case "submitted":
    case "nowe":
    case "new":
      return 20;
    case "in_progress":
    case "in progress":
    case "w trakcie":
      return 50;
    case "in_review":
    case "review":
    case "do akceptacji":
      return 75;
    case "done":
    case "completed":
    case "zakończone":
      return 100;
    default:
      return 10; // невідомий статус — трохи заповнена лінія
  }
}

/** Чим ближче до 100%, тим більше зеленого в градієнті */
function getProgressGradient(progress: number): string {
  if (progress < 40) {
    // фіолетовий → синій
    return "from-[#6D28D9] to-[#1F4FE4]";
  }
  if (progress < 80) {
    // фіолетовий → синьо-зелений
    return "from-[#6D28D9] to-[#22C55E]";
  }
  // майже готово → зелений
  return "from-[#16A34A] to-[#22C55E]";
}

/** Форматуємо updated_at з беку до гарного польського формату */
function formatUpdatedAt(order: OrderWithMeta): string | null {
  const raw =
    (order as any).updated_at ??
    (order as any).updatedAt ??
    (order as any).modified_at ??
    null;

  if (!raw) return null;

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;

  return d.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* -------------------- MAIN ORDER CARD -------------------- */
function OrderMainCard({
  role,
  order,
}: {
  role: Role;
  order: OrderWithMeta | null;
}) {
  const isProgrammer = role === "programmer";

  if (!order) {
    return (
      <div className="flex-1 bg-white rounded-2xl shadow-lg border border-slate-100 p-6 flex items-center justify-center text-slate-500 text-sm">
        Brak zamówień do wyświetlenia.
      </div>
    );
  }

  const progress = getProgressFromStatus(order.status);
  const gradient = getProgressGradient(progress);
  const updatedLabel = formatUpdatedAt(order);

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
      <div className="space-y-4">
        <div>
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

          {/* --- ДИНАМІЧНИЙ ПРОГРЕС --- */}
          <div className="flex items-center gap-3">
            <span>Postęp:</span>
            <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-3 rounded-full bg-gradient-to-r ${gradient}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[12px] text-slate-500 w-10 text-right">
              {progress}%
            </span>
          </div>

          {/* --- ДИНАМІЧНА ДАТА --- */}
          <div className="flex items-center gap-2 mt-1 text-[13px] text-slate-600">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-100">
              <Clock className="h-3 w-3 text-orange-500" />
            </span>
            <span>
              Ostatnia aktualizacja:{" "}
              <span className="text-[#2563EB] font-semibold">
                {updatedLabel ?? "brak danych"}
              </span>
            </span>
          </div>
        </div>

        <div className="pt-4">
  {role === "manager" && (
    <Link
      to={`/manager-orders/${order.id}/files`}
      className="inline-block px-6 py-2 rounded-xl text-[13px] font-semibold text-white bg-[#5B21D6] hover:bg-[#4C1DB6]">
      Zobacz szczegóły
    </Link>
  )}

  {role === "client" && (
    <Link
      to={`/orders/${order.id}/files`}
      className="inline-block px-6 py-2 rounded-xl text-[13px] font-semibold text-white bg-[#5B21D6] hover:bg-[#4C1DB6]">
      Zobacz szczegóły
    </Link>
  )}

  {role === "programmer" && (
    <Link
      to={`/tasks/${order.id}/files`}
      className="inline-block px-6 py-2 rounded-xl text-[13px] font-semibold text-white bg-[#5B21D6] hover:bg-[#4C1DB6]">
      Zobacz szczegóły
    </Link>
  )}
</div>

      </div>
    </div>
  );
}

/* ============================================================
   MAIN PAGE – підтримка ?new=1 + всі замовлення
============================================================ */
export function OrdersPage({ role }: { role: Role }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const openNew = params.get("new") === "1";

  const isProgrammer = role === "programmer";

  const [orders, setOrders] = useState<OrderWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(role === "client" && openNew);
  const [form, setForm] = useState({ title: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  /* ---- Pobieranie listy zamówień ---- */
  useEffect(() => {
    setLoading(true);
    fetchOrders()
      .then((data) => {
        setOrders(data as OrderWithMeta[]);
      })
      .catch((err) => {
        console.error("fetchOrders error", err);
        setLoadError("Nie udało się pobrać listy zamówień.");
      })
      .finally(() => setLoading(false));
  }, []);

  /* ---- Ręczne odświeżanie listy (przycisk dla managera) ---- */
  async function handleRefreshOrders() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchOrders();
      setOrders(data as OrderWithMeta[]);
    } catch (err) {
      console.error("refreshOrders error", err);
      setLoadError("Nie udało się pobrać listy zamówień.");
    } finally {
      setLoading(false);
    }
  }

  /* ---- Tworzenie zamówienia ---- */
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

      setOrders((prev) => [newOrder as OrderWithMeta, ...prev]);
      setCreateSuccess("Zamówienie zostało utworzone.");
      setForm({ title: "", description: "" });
      setShowForm(false);
    } catch (err: any) {
      setCreateError(
        err instanceof Error
          ? err.message
          : "Nie udało się utworzyć zamówienia."
      );
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F2F8]">
        <Sidebar role={role} />
        <main className="md:ml-72 p-10 text-slate-700">
          Ładowanie zamówień.
        </main>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#F3F2F8]">
        <Sidebar role={role} />
        <main className="md:ml-72 p-10 text-red-600">{loadError}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F2F8]">
      <Sidebar role={role} />

      <main className="md:ml-72">
        <div className="h-[100px] w-full bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)]" />

        <div className="px-[88px] pt-10 pb-12">
          <h1 className="text-[32px] font-extrabold text-slate-900">
            {isProgrammer ? "Lista zadań" : "Lista zamówień"}
          </h1>
          <p className="text-slate-500 text-[14px] mt-1">
            {orders.length} {isProgrammer ? "zadań" : "zamówień"} w systemie
          </p>

          {/* ------- MAIN CARD + RIGHT PANEL ------- */}
          <div className="mt-10 flex gap-10 items-start">
            <OrderMainCard role={role} order={orders[0] ?? null} />
          </div>

          {/* ------- LISTA WSZYSTKICH ZAMÓWIEŃ ------- */}
          <div className="mt-12">
            <h2 className="text-[20px] font-bold text-slate-900 mb-4">
              Wszystkie {isProgrammer ? "zadania" : "zamówienia"}
            </h2>

            <ul className="space-y-3">
              {orders.map((o) => (
                <li
                  key={o.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-[14px] flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="font-medium text-slate-900">{o.title}</div>
                    <div className="text-slate-500 text-[13px]">
                      {o.status}
                    </div>
                  </div>

                                <div>
                  {role === "manager" && (
                    <Link
                      to={`/manager-orders/${o.id}/files`}
                      className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-[#8F2AFA] hover:bg-[#7C22E2]">
                      Zobacz szczegóły
                    </Link>
                  )}

                  {role === "client" && (
                    <Link
                      to={`/orders/${o.id}/files`}
                      className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-[#8F2AFA] hover:bg-[#7C22E2]">
                      Zobacz szczegóły
                    </Link>
                  )}

                  {role === "programmer" && (
                    <Link
                      to={`/tasks/${o.id}/files`}
                      className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-[#8F2AFA] hover:bg-[#7C22E2]">
                      Zobacz szczegóły
                    </Link>
                  )}
                </div>

                </li>
              ))}
            </ul>
          </div>

          {/* ------- FORMULARZ / PRZYCISKI -------- */}
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
                      <label className="block text-sm font-medium mb-1">
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
                      <label className="block text-sm font-medium mb-1">
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
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={creating}
                        className="px-6 py-2 rounded-xl text-sm font-semibold text-white bg-[#8F2AFA] hover:bg-[#7C22E2]"
                      >
                        {creating ? "Tworzenie." : "Złóż zamówienie"}
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
                  <button
                    className="px-8 py-3 font-semibold text-[14px] rounded-xl text-white bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)]"
                    onClick={() => setShowForm(true)}
                  >
                    Nowe zamówienie
                  </button>
                )}
              </>
            )}

            {role === "programmer" && (
              <button className="px-8 py-3 font-semibold text-[14px] rounded-xl text-white bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)]">
                Zmień status
              </button>
            )}

            {role === "manager" && (
              <button
                onClick={handleRefreshOrders}
                className="px-8 py-3 font-semibold text-[14px] rounded-xl text-white bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)]"
              >
                Zamówienia
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* -------------------- EXPORTS FOR ROUTER -------------------- */
export function ClientOrdersPage() {
  return <OrdersPage role="client" />;
}

export function ProgrammerOrdersPage() {
  return <OrdersPage role="programmer" />;
}

export function ManagerOrdersPage() {
  return <OrdersPage role="manager" />;
}
