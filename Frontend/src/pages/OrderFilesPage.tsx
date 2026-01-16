// src/pages/OrderFilesPage.tsx

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FileText,
  Download,
  Send,
  ArrowLeft,
  Upload,
  Menu,
  LogIn,
} from "lucide-react";

import { Sidebar } from "./OrdersPage.tsx";
import { fetchOrders, type Order } from "../api/orders.ts";
import {
  fetchOrderFiles,
  sendFilesToClient,
  buildDownloadUrl,
  type OrderFile,
} from "../api/orderFiles.ts";

type Role = "client" | "programmer" | "manager";

/* --- Mobile header для цієї сторінки --- */
function MobileHeader({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  return (
    <header className="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="h-14 flex items-center justify-between px-4">
        <button
          onClick={onOpenSidebar}
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
  );
}

function HeaderGradient() {
  return (
    <div className="h-[100px] w-full bg-[linear-gradient(90deg,#8F2AFA_9%,#5F7EFA_35%,#2D19E9_100%)]" />
  );
}

function LinkBack({ role }: { role: Role }) {
  const back =
    role === "client"
      ? "/orders"
      : role === "programmer"
      ? "/tasks"
      : "/manager-orders";

  return (
    <Link
      to={back}
      className="inline-flex items-center gap-2 text-[13px] text-slate-600 hover:text-slate-800 mb-4"
    >
      <ArrowLeft className="h-4 w-4" />
      Powrót
    </Link>
  );
}

/* ============ ГОЛОВНИЙ КОМПОНЕНТ ============ */

export default function OrderFilesPage({ role }: { role: Role }) {
  const { orderId } = useParams<{ orderId: string }>();
  const id = Number(orderId);

  const [order, setOrder] = useState<Order | null>(null);
  const [files, setFiles] = useState<OrderFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isClient = role === "client";
  const isProgrammer = role === "programmer";
  const isManager = role === "manager";

  useEffect(() => {
    if (!id) {
      setError("Nieprawidłowe ID zamówienia.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([fetchOrders(), fetchOrderFiles(id)])
      .then(([orders, orderFiles]) => {
        const found = orders.find((o) => o.id === id) ?? null;
        setOrder(found);
        setFiles(orderFiles);
      })
      .catch(() => {
        setError("Nie udało się pobrać danych zamówienia.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const selectedIds = files.filter((f) => selected[f.id]).map((f) => f.id);

  const toggleOne = (fileId: number) => {
    setSelected((prev) => ({
      ...prev,
      [fileId]: !prev[fileId],
    }));
  };

  const toggleSelectAll = () => {
    const all: Record<number, boolean> = {};
    files.forEach((f) => (all[f.id] = true));
    setSelected(all);
  };

  const handleSendToClient = async () => {
    if (!order) return;
    try {
      await sendFilesToClient(order.id, selectedIds);
      setMessage("Pliki zostały wysłane do klienta!");
    } catch {
      setMessage("Nie udało się wysłać plików.");
    }
  };

  const handleDownload = () => {
    if (!order) return;
    const url = buildDownloadUrl(order.id, selectedIds);
    window.open(url, "_blank");
  };

  const handleUpload = () => {
    alert("Tu będzie upload — backend musi dać endpoint /files/upload/ 🙂");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F2F8]">
        <MobileHeader onOpenSidebar={() => setSidebarOpen(true)} />
        <Sidebar
          role={role}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="md:ml-72 p-10">Ładowanie...</main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F3F2F8]">
        <MobileHeader onOpenSidebar={() => setSidebarOpen(true)} />
        <Sidebar
          role={role}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="md:ml-72 p-10 text-red-600">{error}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F2F8]">
      <MobileHeader onOpenSidebar={() => setSidebarOpen(true)} />

      <Sidebar
        role={role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="md:ml-72">
        <HeaderGradient />

        <div className="px-6 md:px-[88px] pt-10 pb-12 max-w-3xl">
          <LinkBack role={role} />

          <h1 className="text-[28px] font-extrabold text-slate-900 mb-2">
            Szczegóły zamówienia
          </h1>
          <p className="text-slate-500 text-[14px] mb-6">
            {order ? order.title : `Zamówienie #${id}`}
          </p>

          {/* --- KARTA Z PLIKAMI --- */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <h2 className="font-semibold mb-4 text-[16px]">Pliki</h2>

            {files.length === 0 ? (
              <p className="text-[14px] text-slate-500">
                Brak plików dla tego zamówienia.
              </p>
            ) : (
              <div className="space-y-3 mb-6">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                        <FileText className="h-5 w-5 text-orange-500" />
                      </span>

                      <div>
                        <div className="font-medium text-slate-800 text-[14px]">
                          {file.name}
                        </div>
                        <div className="text-[12px] text-slate-500">
                          {(file.size / (1024 * 1024)).toFixed(1)} MB
                        </div>
                      </div>
                    </div>

                    {(isProgrammer || isManager || isClient) && (
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={!!selected[file.id]}
                        onChange={() => toggleOne(file.id)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* --- КНОПКИ --- */}
            <div className="flex flex-wrap gap-3">
              {/* Додати файл — тільки програміст */}
              {isProgrammer && (
                <button
                  onClick={handleUpload}
                  className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-blue-200 text-blue-900 flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Dodaj plik
                </button>
              )}

              {/* Zaznacz wszystkie */}
              {(isManager || isClient || isProgrammer) && files.length > 0 && (
                <button
                  onClick={toggleSelectAll}
                  className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-slate-200 text-slate-800"
                >
                  Zaznacz wszystkie
                </button>
              )}

              {/* Wyślij do klienta — тільки менеджер */}
              {isManager && (
                <button
                  disabled={!selectedIds.length}
                  onClick={handleSendToClient}
                  className="px-4 py-2 rounded-xl bg-[#8F2AFA] text-white flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  Wyślij klientowi
                </button>
              )}

              {/* Download */}
              {(isProgrammer || isManager || isClient) && (
                <button
                  disabled={!selectedIds.length}
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-xl bg-[#5F21D6] text-white flex items-center gap-2 disabled:opacity-50"
                >
                  <Download className="h-4 w-4" />
                  Pobierz
                </button>
              )}
            </div>

            {message && (
              <p className="text-slate-600 text-[13px] mt-3">{message}</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
