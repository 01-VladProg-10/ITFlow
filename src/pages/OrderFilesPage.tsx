// src/pages/OrderFilesPage.tsx

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { 
    FileText, 
    ArrowLeft, 
    UserPlus, 
    MessageSquare, 
    Clock,
    // Importujemy ikony potrzebne do historii
    Flame, Wrench, CheckCircle, RefreshCcw, User, AlertCircle 
} from "lucide-react";

import { Sidebar } from "./OrdersPage";
import { fetchOrders, type Order, updateOrderStatus } from "../api/orders";
import {
  fetchProgrammers,
  assignDeveloperAndManagerToOrder,
  type Programmer,
} from "../api/assignments";
import {
  fetchFilesByOrder,
  uploadFile,
  updateFileVisibility,
  type OrderFile,
} from "../api/orderFiles";

// Importy dla historii logów (Pamiętaj, że musisz mieć to dostępne w logs.ts)
import { fetchOrderLogs, type LogEntry } from "../api/logs"; 


type Role = "client" | "programmer" | "manager";
type ActiveTab = "files" | "history"; // Nowy stan dla zakładek

// Stała z nazwami statusów - dopasowana do logicznego znaczenia
const STATUS_LABELS: Record<string, string> = {
  submitted: "Zgłoszone",
  accepted: "Przyjęte (Do realizacji)",
  in_progress: "W realizacji",
  client_review: "Weryfikacja Wewnętrzna (Czeka na Managera)",
  awaiting_review: "Oczekuje na Weryfikację Klienta",
  client_fix: "Prośba o poprawki (Decyzja Klienta)",
  rework_requested: "Wysłane do Poprawki",
  done: "Zakończone",
  rejected: "Odrzucone",
};


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

// Funkcja stylująca logi (przeniesiona z UserDashboard.tsx)
function getLogStyle(log: LogEntry) {
  let Icon = AlertCircle;
  let bg = "#94A3B8"; // Slate
  let label = log.description;

  switch (log.event_type) {
    case "status_change":
      const oldVal = STATUS_LABELS[log.old_value || ""] || log.old_value || "Brak";
      const newVal = STATUS_LABELS[log.new_value || ""] || log.new_value || "Brak";
      
      // Używamy przetłumaczonych statusów, jeśli są dostępne
      if (log.old_value && log.new_value) {
        label = `Status zmieniony z "${oldVal}" na "${newVal}"`;
      } else {
        label = `Zmiana statusu: ${newVal}`; 
      }

      const newValLower = (log.new_value || "").toLowerCase();
      if (newValLower.includes("done") || newValLower.includes("zakończone")) {
        Icon = Flame; bg = "#F43F5E"; // Red/Rose
      } else if (newValLower.includes("review") || newValLower.includes("weryfikację")) {
        Icon = CheckCircle; bg = "#22C55E"; // Green
      } else if (newValLower.includes("rework") || newValLower.includes("poprawki")) {
        Icon = Wrench; bg = "#EAB308"; // Yellow
      } else {
        Icon = RefreshCcw; bg = "#3B82F6"; // Blue
      }
      break;

    case "file_added":
      Icon = FileText; bg = "#F59E0B"; // Orange
      label = `Dodano plik: ${log.description}`;
      break;

    case "assignment":
      Icon = User; bg = "#8B5CF6"; // Violet
      label = log.description;
      break;

    case "comment":
      Icon = MessageSquare; bg = "#64748B"; // Slate
      label = `Nowy komentarz: ${log.description.substring(0, 50)}...`;
      break;
    
    default:
        Icon = Clock; // Używamy zegara dla ogólnych akcji
        bg = "#64748B";
        break;
  }

  return { Icon, bg, label, date: formatLogDate(log.timestamp) };
}


export default function OrderFilesPage({ role }: { role: Role }) {
  const { orderId } = useParams<{ orderId: string }>();
  const id = Number(orderId);

  const [order, setOrder] = useState<Order | null>(null);
  const [files, setFiles] = useState<OrderFile[]>([]);
  const [programmers, setProgrammers] = useState<Programmer[]>([]);
  const [historyLogs, setHistoryLogs] = useState<LogEntry[]>([]); // NOWY STAN DLA LOGÓW
  const [activeTab, setActiveTab] = useState<ActiveTab>("files"); // NOWY STAN DLA ZAKŁADEK

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Upload state
  const [uploadFileObj, setUploadFileObj] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState<string>("");
  const [uploadType, setUploadType] = useState<string>("pdf");
  const [uploadDescription, setUploadDescription] = useState<string>("");

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

    const dataPromises: [Promise<Order[]>, Promise<OrderFile[]>, Promise<Programmer[]>, Promise<LogEntry[]>] = [
      fetchOrders(),
      fetchFilesByOrder(id),
      isManager ? fetchProgrammers() : Promise.resolve([]),
      fetchOrderLogs(id), // POBIERANIE WSZYSTKICH LOGÓW
    ];

    Promise.all(dataPromises)
      .then(([orders, orderFiles, programmersList, logs]) => {
        const found = orders.find((o) => o.id === id) ?? null;
        setOrder(found);
        setFiles(orderFiles);
        setProgrammers(programmersList);
        // Sortujemy logi od najnowszego, bo backend zwraca od najstarszego (domyślne 'ordering')
        const sortedLogs = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setHistoryLogs(sortedLogs);
      })
      .catch((e) =>
        setError("Nie udało się pobrać danych zamówienia: " + (e.message || "Błąd sieci"))
      )
      .finally(() => setLoading(false));
  }, [id, isManager]);

  const selectedIds = files.filter((f) => selected[f.id]).map((f) => f.id);

  const toggleOne = (fileId: number) =>
    setSelected((prev) => ({ ...prev, [fileId]: !prev[fileId] }));

  const toggleSelectAll = () => {
    const all: Record<number, boolean> = {};
    files.forEach((f) => (all[f.id] = true));
    setSelected(all);
  };

  // --- LOGIKA DOSTĘPNYCH STATUSÓW (Musi być zgodna z Backendem) ---
  const getAvailableStatuses = () => {
    if (!order) return [];

    // Definicja przejść identyczna jak w Pythonie
    const transitions: Record<string, Record<string, string[]>> = {
      manager: {
        submitted: ["accepted", "rejected"],
        // Programista zgłosił (client_review) -> Manager zatwierdza do klienta (awaiting_review)
        client_review: ["awaiting_review"], 
        // Klient zgłosił uwagi (client_fix) -> Manager przekazuje do programisty (rework_requested)
        client_fix: ["rework_requested"],
        // Opcje cofnięcia / korekty przez managera:
        rework_requested: ["in_progress"], 
        awaiting_review: ["in_progress"],
      },
      programmer: {
        accepted: ["in_progress"],
        // Programista kończy i prosi Managera o sprawdzenie
        in_progress: ["client_review"], 
        // Programista wznawia pracę po poprawkach
        rework_requested: ["in_progress"],
      },
      client: {
        // Klient widzi tylko to co Manager zatwierdził
        awaiting_review: ["done", "client_fix"],
      },
    };

    let allowed: string[] = [];

    if (isManager) allowed = transitions.manager[order.status] || [];
    else if (isProgrammer) allowed = transitions.programmer[order.status] || [];
    else if (isClient) allowed = transitions.client[order.status] || [];

    return allowed.map((s) => ({
      value: s,
      label: STATUS_LABELS[s] || s,
    }));
  };

  const availableStatuses = getAvailableStatuses();
  const canChangeStatus = availableStatuses.length > 0;

  const handleChangeStatus = async (status: string) => {
    if (!order) return;

    try {
      const updated = await updateOrderStatus(order.id, status);
      setOrder(updated);
      setStatusMessage("Status został pomyślnie zmieniony!");
      setIsChangingStatus(false);
      // Opcjonalnie: odświeżamy historię po zmianie statusu
      const updatedLogs = await fetchOrderLogs(order.id);
      const sortedLogs = updatedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setHistoryLogs(sortedLogs);

    } catch (e: any) {
      setStatusMessage("Błąd: " + (e.message || "nie udało się zmienić statusu."));
    }
  };

  const handleAssignProgrammer = async (developerId: number | null) => {
    if (!order) return;
    try {
      const updatedOrder = await assignDeveloperAndManagerToOrder(order.id, developerId);
      setOrder(updatedOrder);
      setMessage(
        developerId
          ? `Programista ${
              programmers.find((p) => p.id === developerId)?.username || developerId
            } został przypisany!`
          : "Programista został usunięty z zamówienia."
      );
      setIsAssigning(false);
      // Odświeżamy historię po zmianie zespołu
      const updatedLogs = await fetchOrderLogs(order.id);
      const sortedLogs = updatedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setHistoryLogs(sortedLogs);
      
    } catch (e: any) {
      setMessage(`Nie udało się przypisać: ${e.message || "Błąd serwera."}`);
    }
  };

  const handleDownload = () => {
    const filesToOpen = files.filter((f) => selected[f.id]);
    if (!filesToOpen.length) {
      setMessage("Wybierz przynajmniej jeden plik.");
      return;
    }
    filesToOpen.forEach((file) => {
      window.open(file.uploaded_file_url, "_blank");
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setUploadFileObj(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!uploadFileObj || !order) {
      setMessage("Uzupełnij wymagane pola.");
      return;
    }
    try {
      const newFile = await uploadFile({
        file: uploadFileObj,
        order: order.id,
        name: uploadName || uploadFileObj.name,
        file_type: uploadType,
        description: uploadDescription,
        visible_to_clients: false, // Domyślnie niewidoczne, Manager zatwierdza
      });
      setFiles((prev) => [...prev, { ...newFile, url: newFile.uploaded_file_url }]);
      setMessage("Plik został wgrany!");
      setUploadFileObj(null);
      setUploadName("");
      setUploadType("pdf");
      setUploadDescription("");
      // Odświeżamy historię po wgraniu pliku
      const updatedLogs = await fetchOrderLogs(order.id);
      const sortedLogs = updatedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setHistoryLogs(sortedLogs);

    } catch (e: any) {
      setMessage(e.message || "Błąd przy wgrywaniu pliku.");
    }
  };

  const handleVisibilityToggle = async (fileId: number, visible: boolean) => {
    try {
      const updated = await updateFileVisibility(fileId, visible);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, visible_to_clients: updated.visible_to_clients } : f
        )
      );
    } catch {
      setMessage("Nie udało się zmienić widoczności pliku.");
    }
  };

  if (loading) return <Loading role={role} />;
  if (error) return <ErrorMessage role={role} message={error} />;

  return (
    <div className="min-h-screen bg-[#F3F2F8]">
      <Sidebar role={role} />
      <main className="md:ml-72">
        <HeaderGradient />
        <div className="px-[88px] pt-10 pb-12 max-w-3xl">
          <LinkBack role={role} />
          <h1 className="text-[28px] font-extrabold text-slate-900 mb-2">
            Szczegóły zamówienia
          </h1>
          <p className="text-slate-500 text-[14px] mb-6">{order?.title}</p>

          {/* NOWA SEKCJA ZAKŁADEK */}
          <div className="flex border-b border-slate-200 mb-6">
            <TabButton active={activeTab === "files"} onClick={() => setActiveTab("files")}>
              Pliki i Status
            </TabButton>
            <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")}>
              Historia działań ({historyLogs.length})
            </TabButton>
          </div>


          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            {activeTab === "files" ? (
                // WIDOK PLIKÓW I STATUSU
                <>
                    {/* ---- Status ---- */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-[12px] text-slate-400 uppercase font-semibold">Aktualny status</p>
                                <p className="text-[18px] text-purple-600 font-bold">
                                    {STATUS_LABELS[order?.status || ""] || order?.status}
                                </p>
                            </div>
                            
                            {canChangeStatus && (
                                <button
                                    onClick={() => setIsChangingStatus(!isChangingStatus)}
                                    className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-[13px] font-semibold transition-colors"
                                >
                                    {isChangingStatus ? "Anuluj zmianę" : "Zmień status"}
                                </button>
                            )}
                        </div>

                        {isChangingStatus && (
                            <div className="mt-3 p-4 border border-green-200 bg-green-50 rounded-lg animate-in fade-in slide-in-from-top-2">
                                <p className="text-[13px] font-semibold mb-2 text-slate-700">Wybierz nowy status:</p>
                                <div className="flex flex-col gap-2">
                                    {availableStatuses.map((s) => (
                                        <button
                                            key={s.value}
                                            onClick={() => handleChangeStatus(s.value)}
                                            className="text-left px-4 py-3 rounded-lg text-[13px] bg-white hover:bg-green-100 border border-green-100 shadow-sm transition-all font-medium text-slate-700"
                                        >
                                            {s.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {statusMessage && (
                            <p className="text-slate-600 text-[13px] mt-2 bg-slate-100 p-2 rounded">{statusMessage}</p>
                        )}
                    </div>

                    <hr className="my-6 border-slate-100" />

                    {/* ---- Pliki ---- */}
                    <h2 className="font-semibold mb-4 text-[16px]">Pliki projektowe</h2>

                    {files.length === 0 ? (
                        <p className="text-[14px] text-slate-500 italic">Brak plików w tym zamówieniu.</p>
                    ) : (
                        <div className="space-y-3 mb-6">
                            {files.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 transition-colors hover:bg-slate-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 shrink-0">
                                            <FileText className="h-5 w-5 text-orange-500" />
                                        </span>
                                        <div>
                                            <div className="font-medium text-slate-800 text-[14px]">
                                                {file.name}
                                            </div>
                                            <div className="text-[12px] text-slate-500">
                                                {file.description || "Brak opisu"}
                                            </div>
                                            {isManager && (
                                                <div className="text-[11px] mt-1 font-semibold">
                                                    {file.visible_to_clients ? (
                                                        <span className="text-green-600">Widoczny dla klienta</span>
                                                    ) : (
                                                        <span className="text-red-500">Niewidoczny dla klienta</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        {isManager && (
                                            <button
                                                onClick={() => handleVisibilityToggle(file.id, !file.visible_to_clients)}
                                                className={`px-3 py-1 text-[11px] rounded font-medium border ${
                                                    file.visible_to_clients 
                                                        ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" 
                                                        : "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                                                }`}
                                            >
                                                {file.visible_to_clients ? "Ukryj" : "Pokaż Klientowi"}
                                            </button>
                                        )}
                                        
                                        <div className="flex items-center gap-2 pl-3 border-l border-slate-300">
                                            <label className="text-[12px] text-slate-500 mr-1">Wybierz</label>
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                                checked={!!selected[file.id]}
                                                onChange={() => toggleOne(file.id)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upload plików - dostępny dla Programisty (zawsze) i Managera */}
                    {(isProgrammer || isManager) && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <h3 className="text-[14px] font-semibold text-blue-800 mb-3">Dodaj nowy plik</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <input type="file" onChange={handleFileChange} className="text-[12px]" />
                                <input
                                    type="text"
                                    placeholder="Nazwa wyświetlana"
                                    value={uploadName}
                                    onChange={(e) => setUploadName(e.target.value)}
                                    className="border rounded px-3 py-2 text-[13px] w-full"
                                />
                                <input
                                    type="text"
                                    placeholder="Typ (np. pdf, zip)"
                                    value={uploadType}
                                    onChange={(e) => setUploadType(e.target.value)}
                                    className="border rounded px-3 py-2 text-[13px] w-full"
                                />
                                <input
                                    type="text"
                                    placeholder="Krótki opis"
                                    value={uploadDescription}
                                    onChange={(e) => setUploadDescription(e.target.value)}
                                    className="border rounded px-3 py-2 text-[13px] w-full"
                                />
                            </div>
                            <button
                                onClick={handleUpload}
                                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold transition-colors"
                            >
                                Wgraj plik
                            </button>
                        </div>
                    )}

                    {/* Przyciski Akcji (Download) */}
                    <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-slate-100">
                        <button
                            onClick={toggleSelectAll}
                            className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                            Zaznacz wszystkie
                        </button>

                        <button
                            disabled={!selectedIds.length}
                            onClick={handleDownload}
                            className="px-4 py-2 rounded-xl bg-[#5F21D6] hover:bg-[#4a1a9b] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[13px] font-semibold shadow-sm"
                        >
                            Pobierz wybrane ({selectedIds.length})
                        </button>

                        {isManager && (
                            <button
                                onClick={() => setIsAssigning(!isAssigning)}
                                className="ml-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-2 text-[13px] font-semibold transition-colors shadow-sm"
                            >
                                <UserPlus className="h-4 w-4" />
                                {isAssigning ? "Ukryj panel" : "Zarządzaj zespołem"}
                            </button>
                        )}
                    </div>
                </>

            ) : (
                // WIDOK HISTORII
                <OrderHistoryList logs={historyLogs} />
            )}


            {/* Przydzielanie programisty (Manager) */}
            {isManager && isAssigning && (
              <div className="mt-4 p-4 border border-purple-100 rounded-xl bg-purple-50 animate-in fade-in">
                <h3 className="font-semibold mb-3 text-[14px] text-purple-900">Przypisz programistę do zlecenia:</h3>
                <div className="space-y-1">
                  {programmers.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleAssignProgrammer(p.id)}
                      className={`flex w-full items-center justify-between px-3 py-2 rounded-md text-[13px] transition-colors ${
                        order?.developer === p.id
                          ? "bg-purple-200 text-purple-900 font-bold border border-purple-300"
                          : "bg-white hover:bg-purple-100 text-slate-700"
                      }`}
                    >
                      <span>{p.username} <span className="text-slate-400 font-normal">({p.email})</span></span>
                      {order?.developer === p.id && <span>✓ Przypisany</span>}
                    </button>
                  ))}
                  
                  <hr className="my-2 border-purple-200" />
                  
                  <button
                    onClick={() => handleAssignProgrammer(null)}
                    className="block w-full text-left px-3 py-2 rounded-md text-[13px] hover:bg-red-100 text-red-600 font-medium transition-colors"
                  >
                    Usuń przypisanie (Brak programisty)
                  </button>
                </div>
              </div>
            )}

            {message && (
              <div className="mt-4 p-3 bg-slate-800 text-white rounded-lg text-[13px] text-center shadow-md animate-bounce-in">
                {message}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ==== NOWY KOMPONENT: Lista Historii Działań ====
function OrderHistoryList({ logs }: { logs: LogEntry[] }) {
    if (logs.length === 0) {
        return (
            <div className="py-8 text-center text-sm text-slate-400">
                Brak zapisanych działań w historii tego zamówienia.
            </div>
        );
    }

    return (
        <ul className="divide-y divide-slate-100">
            {logs.map((log, index) => {
                const { Icon, bg, label, date } = getLogStyle(log);
                const actor = log.actor_name || "System";
                
                return (
                    <li key={log.id} className="flex items-start gap-4 py-4">
                        <span
                            className="h-10 w-10 mt-1 rounded-full flex items-center justify-center shadow-md shrink-0"
                            style={{ backgroundColor: bg }}
                        >
                            <Icon size={20} color="#FFFFFF" />
                        </span>
                        <div className="flex-grow">
                            <p className="font-semibold text-slate-800 text-[14px]">
                                {label}
                            </p>
                            <p className="text-[12px] text-slate-500 mt-0.5">
                                Przez: <span className="font-medium text-slate-700">{actor}</span>
                                <span className="mx-2 text-slate-300">|</span>
                                <span className="font-mono text-slate-400">{date}</span>
                            </p>
                            {/* Wyświetlanie pełnego opisu/komentarza */}
                            {log.event_type === 'comment' && (
                                <blockquote className="mt-2 text-[13px] italic p-3 border-l-4 border-slate-200 bg-slate-50 text-slate-600">
                                    {log.description}
                                </blockquote>
                            )}
                            {log.event_type !== 'comment' && log.description && (
                                <p className="text-[12px] text-slate-400 mt-1">{log.description}</p>
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

// ==== NOWY KOMPONENT: Przycisk Zakładki ====
function TabButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-[14px] font-semibold transition-colors ${
                active 
                    ? "border-b-2 border-purple-600 text-purple-600"
                    : "border-b-2 border-transparent text-slate-500 hover:text-slate-700"
            }`}
        >
            {children}
        </button>
    );
}

/* ==== Komponenty pomocnicze (pozostałe) ==== */

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
      className="inline-flex items-center gap-2 text-[13px] text-slate-600 hover:text-slate-800 mb-4 transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      Powrót do listy
    </Link>
  );
}

function Loading({ role }: { role: Role }) {
  return (
    <div className="min-h-screen bg-[#F3F2F8]">
      <Sidebar role={role} />
      <main className="md:ml-72 p-10 flex items-center justify-center h-screen">
        <div className="text-slate-500 animate-pulse">Ładowanie danych zamówienia...</div>
      </main>
    </div>
  );
}

function ErrorMessage({ role, message }: { role: Role; message: string }) {
  return (
    <div className="min-h-screen bg-[#F3F2F8]">
      <Sidebar role={role} />
      <main className="md:ml-72 p-10">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Błąd! </strong>
            <span className="block sm:inline">{message}</span>
        </div>
      </main>
      
    </div>
  );
}