// src/pages/OrdersPage.tsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import dashboardIcon from "../icons/daszboard.png";
import zanowieniaIcon from "../icons/zanowienia.png";
import kontaktIcon from "../icons/kontakt.png";
import ustawieniaIcon from "../icons/ustawienia.png";
import logoIcon from "../icons/logo.png";

import { Clock, X, LogIn, Search, Menu } from "lucide-react";

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
      <img src={logoIcon} alt="ITFlow" className={className} />
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
export function Sidebar({ role, open, onClose }: { role: Role; open: boolean; onClose: () => void }) {
  const nav = navByRole[role];
  const content = (
    <div
      className="flex h-full w-72 flex-col 
                 bg-[linear-gradient(180deg,_#7A36EF_0%,_#2D19E9_100%)] 
                 dark:bg-[linear-gradient(180deg,_#4C1D95_0%,_#1E1B4B_35%,_#020617_100%)] 
                 text-white"
    >
      <div className="flex items-center justify-between px-4 h-16">
        <Logo />
        <button className="md:hidden rounded-xl p-2 hover:bg-white/10" onClick={onClose}>
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
          className="flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-sm font-semibold"
          onClick={onClose}
        >
          <LogIn className="h-4 w-4" /> Wyloguj się
        </Link>
      </div>
    </div>
  );
  return (
    <>
      <aside className="hidden md:block fixed inset-y-0 left-0 z-40">{content}</aside>
      {open && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40" onClick={onClose}>
          <div className="h-full" onClick={(e) => e.stopPropagation()}>
            {content}
          </div>
        </div>
      )}
    </>
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
      <div className="flex-1 bg-white dark:bg-itf-darkSurface rounded-2xl shadow-lg border border-slate-100 dark:border-itf-darkBorder p-6 flex items-center justify-center text-slate-500 dark:text-slate-300 text-sm">
        Brak zamówień do wyświetlenia.
      </div>
    );
  }

  const progress = getProgressFromStatus(order.status);
  const gradient = getProgressGradient(progress);
  const updatedLabel = formatUpdatedAt(order);

  return (
    <div className="flex-1 bg-white dark:bg-itf-darkSurface rounded-2xl shadow-lg border border-slate-100 dark:border-itf-darkBorder p-6">
      <div className="space-y-4">
        <div>
          <div className="text-[13px] text-slate-500 dark:text-slate-300">
            {isProgrammer ? "Twoje zadanie" : "Twoje zamówienie"}
          </div>
          <div className="text-[18px] font-semibold text-slate-900 dark:text-white">
            {order.title}
          </div>
        </div>

        <div className="space-y-2 text-[14px]">
          <div className="text-slate-900 dark:text-white">
            Status:{" "}
            <span className="text-[#6D28D9] dark:text-purple-200 font-semibold">
              {order.status || "—"}
            </span>
          </div>

          {/* --- ДИНАМІЧНИЙ ПРОГРЕС --- */}
          <div className="flex items-center gap-3 text-slate-900 dark:text-white">
            <span>Postęp:</span>
            <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-itf-darkBorder overflow-hidden">
              <div
                className={`h-3 rounded-full bg-gradient-to-r ${gradient}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[12px] text-slate-500 dark:text-slate-300 w-10 text-right">
              {progress}%
            </span>
          </div>

          {/* --- ДИНАМІЧНА ДАТА --- */}
          <div className="flex items-center gap-2 mt-1 text-[13px] text-slate-600 dark:text-slate-300">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-itf-darkBorder">
              <Clock className="h-3 w-3 text-slate-500 dark:text-slate-400" />
            </span>
            <span>
              Ostatnia aktualizacja:{" "}
              <span className="text-slate-600 dark:text-slate-300 font-semibold">
                {updatedLabel ?? "brak danych"}
              </span>
            </span>
          </div>
        </div>

        <div className="pt-4">
  {role === "manager" && (
    <Link
      to={`/manager-orders/${order.id}/files`}
      className="inline-block px-6 py-2 rounded-xl text-[13px] font-semibold text-white bg-[#5B21D6] dark:bg-[#6D28D9] hover:bg-[#4C1DB6] dark:hover:bg-[#7C3AED]">
      Zobacz szczegóły
    </Link>
  )}

  {role === "client" && (
    <Link
      to={`/orders/${order.id}/files`}
      className="inline-block px-6 py-2 rounded-xl text-[13px] font-semibold text-white bg-[#5B21D6] dark:bg-[#6D28D9] hover:bg-[#4C1DB6] dark:hover:bg-[#7C3AED]">
      Zobacz szczegóły
    </Link>
  )}

  {role === "programmer" && (
    <Link
      to={`/tasks/${order.id}/files`}
      className="inline-block px-6 py-2 rounded-xl text-[13px] font-semibold text-white bg-[#5B21D6] dark:bg-[#6D28D9] hover:bg-[#4C1DB6] dark:hover:bg-[#7C3AED]">
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [orders, setOrders] = useState<OrderWithMeta[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase();
    return (
      o.title.toLowerCase().includes(q) ||
      (o.description || "").toLowerCase().includes(q) ||
      (o.status || "").toLowerCase().includes(q)
    );
  });

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
      <div className="min-h-screen bg-[#F3F2F8] text-slate-900 dark:bg-[#0B122A] dark:text-white">
        <Sidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="md:ml-72 p-6 md:p-10 text-slate-700 dark:text-slate-200">
          Ładowanie zamówień.
        </main>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#F3F2F8] text-slate-900 dark:bg-[#0B122A] dark:text-white">
        <Sidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="md:ml-72 p-6 md:p-10 text-red-600">{loadError}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F2F8] text-slate-900 dark:bg-[#0B122A] dark:text-white">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 bg-white/80 dark:bg-[#0B122A] backdrop-blur border-b border-slate-200 dark:border-itf-darkBorder">
        <div className="h-14 flex items-center justify-between px-4">
          <button onClick={() => setSidebarOpen(true)} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white">
            <Menu className="h-6 w-6" />
          </button>
          <div className="font-bold text-slate-900 dark:text-white">ITFlow</div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)] dark:bg-[linear-gradient(90deg,_#4C1D95_0%,_#1E1B4B_40%,_#020617_100%)]"
          >
            <LogIn className="h-4 w-4" />
            Wyloguj
          </Link>
        </div>
      </header>

      <Sidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="md:ml-72">
        <div className="h-[100px] w-full bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)] dark:bg-[linear-gradient(90deg,_#4C1D95_0%,_#1E1B4B_40%,_#020617_100%)]" />

        <div className="px-6 md:px-[88px] pt-6 md:pt-10 pb-12">
          <h1 className="text-[26px] md:text-[32px] font-extrabold text-slate-900 dark:text-white">
            {isProgrammer ? "Lista zadań" : "Lista zamówień"}
          </h1>
          <p className="text-slate-500 dark:text-slate-300 text-[14px] mt-1">
            {filteredOrders.length} {isProgrammer ? "zadań" : "zamówień"}
            {searchQuery ? " pasujących do wyszukiwania" : " w systemie"}
          </p>

          {/* ---- SEARCH BOX ---- */}
          <div className="mt-6 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Szukaj po tytule, opisie lub statusie..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-itf-darkBorder shadow-sm text-sm bg-white dark:bg-itf-darkSurface text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>


          {/* ------- MAIN CARD ------- */}
          <div className="mt-10 flex gap-10 items-start">
            <OrderMainCard role={role} order={filteredOrders[0] ?? null} />
          </div>

          {/* ------- LISTA WSZYSTKICH ZAMÓWIEŃ ------- */}
          <div className="mt-12">
            <h2 className="text-[20px] font-bold text-slate-900 dark:text-white mb-4">
              Wszystkie {isProgrammer ? "zadania" : "zamówienia"}
            </h2>

            <ul className="space-y-3">
            {filteredOrders.map((o) => (
                <li
                  key={o.id}
                  className="bg-white dark:bg-itf-darkSurface border border-slate-200 dark:border-itf-darkBorder rounded-xl p-4 shadow-sm text-[14px] flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">{o.title}</div>
                    <div className="text-slate-500 dark:text-slate-300 text-[13px]">
                      {o.status}
                    </div>
                  </div>

                  <div>
                  {role === "manager" && (
                    <Link
                      to={`/manager-orders/${o.id}/files`}
                    className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-[#5B21D6] dark:bg-[#6D28D9] hover:bg-[#4C1DB6] dark:hover:bg-[#7C3AED]">
                      Zobacz szczegóły
                    </Link>
                  )}

                  {role === "client" && (
                    <Link
                      to={`/orders/${o.id}/files`}
                      className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-[#5B21D6] dark:bg-[#6D28D9] hover:bg-[#4C1DB6] dark:hover:bg-[#7C3AED]">
                      Zobacz szczegóły
                    </Link>
                  )}

                  {role === "programmer" && (
                    <Link
                      to={`/tasks/${o.id}/files`}
                      className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-[#5B21D6] dark:bg-[#6D28D9] hover:bg-[#4C1DB6] dark:hover:bg-[#7C3AED]">
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
                    className="bg-white dark:bg-itf-darkSurface rounded-2xl shadow-md border border-slate-200 dark:border-itf-darkBorder p-4 space-y-3"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-white">
                        Tytuł zamówienia
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-slate-300 dark:border-itf-darkBorder px-3 py-2 text-sm bg-white dark:bg-itf-darkCard text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                        value={form.title}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, title: e.target.value }))
                        }
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-slate-900 dark:text-white">
                        Opis
                      </label>
                      <textarea
                        className="w-full rounded-lg border border-slate-300 dark:border-itf-darkBorder px-3 py-2 text-sm bg-white dark:bg-itf-darkCard text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
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
                        className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-200 text-slate-800 dark:bg-itf-darkBorder dark:text-slate-100"
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
              <button className="px-8 py-3 font-semibold text-[14px] rounded-xl text-white bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)] dark:bg-[#6D28D9] dark:hover:bg-[#7C3AED]">
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
