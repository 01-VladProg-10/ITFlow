// src/pages/OrderFilesPage.tsx

import { useEffect, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { 
    FileText, 
    ArrowLeft, 
    UserPlus, 
    MessageSquare, 
    Clock,
    X, // Dodano ikonę do zamknięcia formularza
    Send, // Dodano ikonę do wysyłki
    // Ikony do historii
    Flame, Wrench, CheckCircle, RefreshCcw, User, AlertCircle, Eye, EyeOff, Download
} from "lucide-react";

// Zakładamy, że to importy z Twoich plików
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
    downloadReport,
    type OrderFile,
} from "../api/orderFiles";

// 🚨 NOWY IMPORT DLA API WYSYŁKI MAILA
import { sendOrderEmailWithAttachment } from "../api/sent-email";

// Importy dla historii logów
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
        minute: "2-digit",
        hour12: false // Zapewnia format 24h
    });
}

// Funkcja stylująca logi 
function getLogStyle(log: LogEntry) {
    let Icon = AlertCircle;
    let bg = "bg-slate-500"; 
    let label = log.description;
    let iconColor = "text-white";

    switch (log.event_type) {
        case "status_change":
            const oldVal = STATUS_LABELS[log.old_value || ""] || log.old_value || "Brak";
            const newVal = STATUS_LABELS[log.new_value || ""] || log.new_value || "Brak";
            
            if (log.old_value && log.new_value) {
                label = `Status zmieniony z "${oldVal}" na "${newVal}"`;
            } else {
                label = `Zmiana statusu: ${newVal}`; 
            }

            const newValLower = (log.new_value || "").toLowerCase();
            if (newValLower.includes("done")) {
                Icon = Flame; bg = "bg-rose-500"; 
            } else if (newValLower.includes("rejected")) {
                Icon = AlertCircle; bg = "bg-red-500";
            } else if (newValLower.includes("review") || newValLower.includes("weryfikację")) {
                Icon = CheckCircle; bg = "bg-green-500"; 
            } else if (newValLower.includes("rework") || newValLower.includes("poprawki")) {
                Icon = Wrench; bg = "bg-yellow-500"; 
            } else {
                Icon = RefreshCcw; bg = "bg-blue-500"; 
            }
            break;

        case "file_added":
            Icon = FileText; bg = "bg-orange-500"; 
            label = `Dodano plik: ${log.description}`;
            break;

        case "assignment":
            Icon = UserPlus; bg = "bg-violet-500"; 
            label = log.description;
            break;

        case "comment":
            Icon = MessageSquare; bg = "bg-slate-500"; 
            label = `Nowy komentarz: ${log.description.substring(0, 50)}${log.description.length > 50 ? '...' : ''}`;
            break;
        
        default:
            Icon = Clock; 
            bg = "bg-gray-400";
            break;
    }

    return { Icon, bg, label, date: formatLogDate(log.timestamp), iconColor };
}

// Funkcja pomocnicza dla pobierania pliku
function downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}

// Komponenty pomocnicze
const HeaderGradient = () => <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-r from-purple-600 to-indigo-700 md:ml-72" />;
const Loading = ({ role }: { role: Role }) => (
    <div className="min-h-screen bg-[#F3F2F8]">
        <Sidebar role={role} />
        <main className="md:ml-72 pt-40 px-12 max-w-4xl mx-auto text-center text-slate-500">Ładowanie danych...</main>
    </div>
);
const ErrorMessage = ({ role, message }: { role: Role, message: string }) => (
    <div className="min-h-screen bg-[#F3F2F8]">
        <Sidebar role={role} />
        <main className="md:ml-72 pt-40 px-12 max-w-4xl mx-auto text-center text-red-600">Błąd: {message}</main>
    </div>
);
const LinkBack = ({ role }: { role: Role }) => (
    <Link to="/orders" className="relative z-10 text-white hover:text-purple-200 transition-colors flex items-center text-sm font-medium mb-4">
        <ArrowLeft className="h-4 w-4 mr-1" /> Powrót do listy zamówień
    </Link>
);
const TabButton = ({ active, onClick, children }: { active: boolean, onClick: () => void, children: ReactNode }) => (
    <button
        className={`flex items-center px-4 py-2 text-sm font-semibold transition-colors ${
            active ? 'border-b-2 border-purple-600 text-purple-600' : 'text-slate-500 hover:text-slate-700'
        }`}
        onClick={onClick}
    >
        {children}
    </button>
);
const OrderHistoryList = ({ logs }: { logs: LogEntry[] }) => (
    <div className="space-y-4">
        {logs.length === 0 ? (
            <p className="text-center text-slate-500 py-6">Brak historii działań dla tego zamówienia.</p>
        ) : (
            logs.map((log, index) => {
                const { Icon, bg, label, date, iconColor } = getLogStyle(log);
                return (
                    <div key={index} className="flex items-start p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 mr-3 ${bg}`}>
                            <Icon className={`h-4 w-4 ${iconColor}`} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-slate-800">{label}</p>
                            <p className="text-xs text-slate-500 mt-1">
                                {log.actor_name} | {date}
                            </p>
                        </div>
                    </div>
                );
            })
        )}
    </div>
);


export default function OrderFilesPage({ role }: { role: Role }) {
    const { orderId } = useParams<{ orderId: string }>();
    const id = Number(orderId);

    const [order, setOrder] = useState<Order | null>(null);
    const [files, setFiles] = useState<OrderFile[]>([]);
    const [programmers, setProgrammers] = useState<Programmer[]>([]);
    const [historyLogs, setHistoryLogs] = useState<LogEntry[]>([]); 
    const [activeTab, setActiveTab] = useState<ActiveTab>("files"); 

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
    const [isDownloadingReport, setIsDownloadingReport] = useState(false);

    // 🚨 NOWE STANY DLA FUNKCJONALNOŚCI WYSYŁKI E-MAILA
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [emailSubject, setEmailSubject] = useState("");
    const [emailMessage, setEmailMessage] = useState("");
    const [emailAttachment, setEmailAttachment] = useState<File | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);


    const isClient = role === "client";
    const isProgrammer = role === "programmer";
    const isManager = role === "manager";

    // Efekt do ładowania danych
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
            fetchOrderLogs(id), 
        ];

        Promise.all(dataPromises)
            .then(([orders, orderFiles, programmersList, logs]) => {
                const found = orders.find((o) => o.id === id) ?? null;
                setOrder(found);
                setFiles(orderFiles);
                setProgrammers(programmersList);
                // Sortujemy logi od najnowszego (najpierw najnowsze)
                const sortedLogs = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                setHistoryLogs(sortedLogs);
            })
            .catch((e: any) =>
                setError("Nie udało się pobrać danych zamówienia: " + (e.message || "Błąd sieci"))
            )
            .finally(() => setLoading(false));
    }, [id, isManager]);

    // Funkcja odświeżająca tylko pliki i logi
    const refreshFilesAndLogs = async () => {
        if (!order) return;
        try {
            const [updatedFiles, updatedLogs] = await Promise.all([
                fetchFilesByOrder(order.id),
                fetchOrderLogs(order.id)
            ]);
            setFiles(updatedFiles);
            const sortedLogs = updatedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setHistoryLogs(sortedLogs);
        } catch (e: any) {
            setMessage("Błąd odświeżania plików/historii: " + e.message);
        }
    };


    const selectedIds = files.filter((f) => selected[f.id]).map((f) => f.id);

    const toggleOne = (fileId: number) =>
        setSelected((prev) => ({ ...prev, [fileId]: !prev[fileId] }));

    const toggleSelectAll = () => {
        const areAllSelected = selectedIds.length === files.length && files.length > 0;
        if (areAllSelected) {
            setSelected({});
        } else {
            const all: Record<number, boolean> = {};
            files.forEach((f) => (all[f.id] = true));
            setSelected(all);
        }
    };

    // 🚨 FUNKCJA OBSŁUGUJĄCA WYSYŁKĘ E-MAILA
    const handleSendEmail = async () => {
        if (!order || isSendingEmail) return;

        setEmailError(null);

        if (!emailSubject || !emailMessage || !emailAttachment) {
            setEmailError("Wszystkie pola (Temat, Treść i Załącznik) są wymagane.");
            return;
        }

        const allowedTypes = ['application/pdf', 'application/zip', 'application/x-zip-compressed'];
        if (emailAttachment && !allowedTypes.includes(emailAttachment.type) && !emailAttachment.name.endsWith('.pdf') && !emailAttachment.name.endsWith('.zip')) {
            setEmailError("Dozwolone są tylko pliki PDF i ZIP.");
            return;
        }


        setIsSendingEmail(true);
        setMessage("Wysyłanie e-maila do klienta...");

        try {
    // Poprawne wywołanie funkcji z 4 argumentami
    // Kolejność: orderId, emailSubject, emailBody, attachmentData
            const response = await sendOrderEmailWithAttachment(
            order.id,            // 1. orderId (number)
            emailSubject,        // 2. emailSubject (string)
            emailMessage,        // 3. emailBody (string)
            emailAttachment      // 4. attachmentData (File | null)
        );
    
    // Krok 2: Poprawne odczytanie zwracanego obiektu
    // response to obiekt { success: boolean, message: string }
    setMessage(response.message || "✅ E-mail został pomyślnie wysłany.");
    
    // Resetowanie formularza
    setEmailSubject(""); // Zmiennej emailSubject nie użyto w funkcji, ale resetujemy
    setEmailMessage("");
    setEmailAttachment(null);
    setShowEmailForm(false);

} catch (e: any) {
    const errorMsg = e.response?.data?.error || e.message || "Wystąpił błąd podczas wysyłki.";
    setEmailError(errorMsg);
    setMessage("❌ Błąd wysyłki e-maila: " + errorMsg);
} finally {
    setIsSendingEmail(false);
}
    };


    // --- LOGIKA DOSTĘPNYCH STATUSÓW ---
    const getAvailableStatuses = () => {
        if (!order) return [];

        // Definicja przejść 
        const transitions: Record<string, Record<string, string[]>> = {
            manager: {
                submitted: ["accepted", "rejected"],
                client_review: ["awaiting_review"], 
                client_fix: ["rework_requested"],
                rework_requested: ["in_progress", "client_review"], // Manager może cofnąć do in_progress lub z góry zatwierdzić
                awaiting_review: ["in_progress"], // Manager może wycofać od klienta
                in_progress: ["client_review"], // Dodana opcja dla Managera, by wymusić weryfikację
                accepted: ["in_progress", "rejected"],
            },
            programmer: {
                accepted: ["in_progress"],
                in_progress: ["client_review"], 
                rework_requested: ["in_progress"],
            },
            client: {
                awaiting_review: ["done", "client_fix"],
                done: [],
                rejected: [],
                client_fix: [], // Klient nic nie zmienia po swojej decyzji o poprawkach
            },
        };

        let allowed: string[] = [];

        if (isManager) allowed = transitions.manager[order.status] || [];
        else if (isProgrammer) allowed = transitions.programmer[order.status] || [];
        else if (isClient) allowed = transitions.client[order.status] || [];
        
        // Unikalne statusy (na wypadek powtórzeń w definicji)
        const uniqueAllowed = Array.from(new Set(allowed));

        return uniqueAllowed.map((s) => ({
            value: s,
            label: STATUS_LABELS[s] || s,
        }));
    };

    const availableStatuses = getAvailableStatuses();
    const canChangeStatus = availableStatuses.length > 0;
    
    // Nowa stała do sprawdzenia, czy przycisk raportu ma być widoczny
    const canDownloadFinalReport = isClient && order?.status === 'done';

    const handleChangeStatus = async (status: string) => {
        if (!order) return;

        try {
            const updated = await updateOrderStatus(order.id, status);
            setOrder(updated);
            setStatusMessage(`Status został pomyślnie zmieniony na "${STATUS_LABELS[status]}".`);
            setIsChangingStatus(false);
            
            // Odświeżamy historię
            await refreshFilesAndLogs();

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
            await refreshFilesAndLogs();
            
        } catch (e: any) {
            setMessage(`Nie udało się przypisać: ${e.message || "Błąd serwera."}`);
        }
    };

    const handleDownload = () => {
        const filesToOpen = files.filter((f) => selected[f.id]);
        
        // Klient może pobrać tylko pliki widoczne
        const filesToDownload = isClient 
            ? filesToOpen.filter(f => f.visible_to_clients) 
            : filesToOpen;

        if (!filesToDownload.length) {
            setMessage(isClient 
                ? "Wybierz przynajmniej jeden plik widoczny dla klienta."
                : "Wybierz przynajmniej jeden plik."
            );
            return;
        }
        
        filesToDownload.forEach((file) => {
            // W przypadku plików, które są już wgrane, otwieramy link
            window.open(file.uploaded_file_url, "_blank");
        });
    };
    
    // NOWA IMPLEMENTACJA OBSŁUGI POBRANIA RAPORTU KOŃCOWEGO
    const handleDownloadFinalReport = async () => {
        if (!order) return;

        setIsDownloadingReport(true);
        setMessage("Przygotowywanie raportu końcowego...");

        try {
            // 1. Pobieramy Blob z API
            const pdfBlob = await downloadReport(order.id);

            // 2. Tworzymy nazwę pliku
            const filename = `Raport_Zlecenia_${order.id}_${new Date().toLocaleDateString('pl-PL').replace(/\./g, '-')}.pdf`;

            // 3. Inicjujemy pobieranie za pomocą funkcji pomocniczej
            downloadBlob(pdfBlob, filename);
            
            setMessage("Raport końcowy został pomyślnie pobrany.");

        } catch (e: any) {
            setMessage(`Błąd pobierania raportu: ${e.message || "Błąd serwera."}`);
        } finally {
            setIsDownloadingReport(false);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setUploadFileObj(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!uploadFileObj || !order) {
            setMessage("Wybierz plik, podaj jego nazwę i typ.");
            return;
        }

        if (!uploadName || !uploadType) {
            setMessage("Nazwa i Typ pliku są wymagane.");
            return;
        }

        try {
            const newFile = await uploadFile({
                file: uploadFileObj,
                order: order.id,
                name: uploadName || uploadFileObj.name,
                file_type: uploadType,
                description: uploadDescription,
                // Programista/Manager może wrzucić plik, domyślnie niewidoczny dla klienta
                visible_to_clients: isManager ? false : isProgrammer ? false : true, 
            });

            // Ustawiamy pliki, pamiętając o prawidłowym polu url
            setFiles((prev) => [...prev, { ...newFile, url: newFile.uploaded_file_url }]);
            setMessage("Plik został wgrany!");
            setUploadFileObj(null);
            setUploadName("");
            setUploadType("pdf");
            setUploadDescription("");

            // Odświeżamy historię
            await refreshFilesAndLogs();

        } catch (e: any) {
            setMessage(e.message || "Błąd przy wgrywaniu pliku.");
        }
    };

    const handleVisibilityToggle = async (fileId: number, visible: boolean) => {
        if (!isManager) return; // Tylko Manager może zmieniać widoczność
        try {
            const updated = await updateFileVisibility(fileId, visible);
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === fileId ? { ...f, visible_to_clients: updated.visible_to_clients } : f
                )
            );
            setMessage(visible ? "Plik jest teraz widoczny dla klienta." : "Plik został ukryty przed klientem.");
            
            // Opcjonalnie: dodaj log o zmianie widoczności
            await refreshFilesAndLogs();
        } catch {
            setMessage("Nie udało się zmienić widoczności pliku.");
        }
    };

    if (loading) return <Loading role={role} />;
    if (error) return <ErrorMessage role={role} message={error} />;
    
    // Pliki widoczne dla klienta (lub wszystkie dla pracownika)
    const filesToDisplay = isClient ? files.filter(f => f.visible_to_clients) : files;
    const canSeeUploadForm = isProgrammer || isManager;
    const canDownloadAnything = filesToDisplay.filter(f => selected[f.id]).length > 0;

    return (
        <div className="min-h-screen bg-[#F3F2F8]">
            <Sidebar role={role} />
            <main className="md:ml-72">
                <HeaderGradient />
                <div className="px-4 md:px-12 lg:px-[88px] pt-10 pb-12 max-w-4xl mx-auto">
                    <LinkBack role={role} />
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
                        Szczegóły zamówienia
                    </h1>
                    <p className="text-slate-500 text-sm mb-6">Zlecenie #{order?.id}: **{order?.title}**</p>

                    {/* NOWA SEKCJA ZAKŁADEK */}
                    <div className="flex border-b border-slate-200 mb-6">
                        <TabButton active={activeTab === "files"} onClick={() => setActiveTab("files")}>
                            <FileText className="h-5 w-5 mr-2" /> Pliki i Status
                        </TabButton>
                        <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")}>
                            <Clock className="h-5 w-5 mr-2" /> Historia działań ({historyLogs.length})
                        </TabButton>
                    </div>


                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6">
                        {activeTab === "files" ? (
                            // WIDOK PLIKÓW I STATUSU
                            <>
                                {/* ---- Status i Akcje Managera ---- */}
                                <div className="mb-6">
                                    <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase font-semibold">Aktualny status</p>
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold text-white shadow-md ${
                                                order?.status === 'done' ? 'bg-green-600' :
                                                order?.status === 'rejected' || order?.status === 'client_fix' ? 'bg-red-500' :
                                                order?.status === 'awaiting_review' || order?.status === 'client_review' ? 'bg-orange-500' :
                                                'bg-purple-600'
                                            }`}>
                                                {STATUS_LABELS[order?.status || ""] || order?.status}
                                            </span>
                                        </div>
                                        
                                        <div className="flex gap-3">
                                            {/* 🚨 NOWY PRZYCISK WYSYŁKI E-MAILA (Tylko dla Managera) */}
                                            {isManager && (
                                                <button
                                                    onClick={() => {
                                                        setShowEmailForm(!showEmailForm);
                                                        // Zamknij formularz zmiany statusu, jeśli otwierasz maila
                                                        setIsChangingStatus(false); 
                                                        setEmailError(null);
                                                    }}
                                                    className={`px-4 py-2 rounded-xl text-white text-[13px] font-semibold transition-colors flex items-center shadow-md ${
                                                        showEmailForm ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-500 hover:bg-slate-600'
                                                    }`}
                                                >
                                                    <Send className="h-4 w-4 mr-2" /> 
                                                    {showEmailForm ? 'Anuluj Wiadomość' : 'Wyślij wiadomość do klienta'}
                                                </button>
                                            )}

                                            {/* PRZYCISK RAPORTU KOŃCOWEGO (Tylko dla Klienta) */}
                                            {canDownloadFinalReport && (
                                                <button
                                                    onClick={handleDownloadFinalReport}
                                                   disabled={isDownloadingReport}
                                                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[13px] font-semibold transition-colors flex items-center shadow-md disabled:opacity-50"
                                                >
                                                    <Download className="h-4 w-4 mr-2" /> {isDownloadingReport ? 'Pobieranie...' : 'Pobierz Raport'}
                                                </button>
                                            )}

                                            {/* PRZYCISK ZMIANY STATUSU */}
                                            {canChangeStatus && (
                                                <button
                                                    onClick={() => {
                                                        setIsChangingStatus(!isChangingStatus);
                                                        // Zamknij formularz maila, jeśli otwierasz status
                                                        setShowEmailForm(false); 
                                                    }}
                                                    className={`px-4 py-2 rounded-xl text-white text-[13px] font-semibold transition-colors flex items-center shadow-md ${
                                                        isChangingStatus ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'
                                                    }`}
                                                >
                                                    {isChangingStatus ? "Anuluj" : "Zmień status"}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Sekcja Formularza Zmiany Statusu */}
                                    {isChangingStatus && (
                                        <div className="mt-3 p-4 border border-green-200 bg-green-50 rounded-xl shadow-inner">
                                            <p className="text-sm font-semibold mb-3 text-slate-700">Wybierz nowy status:</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {availableStatuses.map((s) => (
                                                    <button
                                                        key={s.value}
                                                        onClick={() => handleChangeStatus(s.value)}
                                                        className="text-left px-4 py-3 rounded-lg text-sm bg-white hover:bg-green-100 border border-green-100 shadow-sm transition-all font-medium text-slate-700"
                                                    >
                                                        {s.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                
                                {/* 🚨 NOWY FORMULARZ WYSYŁKI E-MAILA */}
                                {showEmailForm && isManager && (
                                    <div className="mt-3 p-4 border border-slate-200 bg-slate-50 rounded-xl shadow-inner">
                                        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center justify-between">
                                            Wyślij e-mail
                                            <button 
                                                onClick={() => setShowEmailForm(false)} 
                                                className="text-slate-400 hover:text-red-500 transition-colors"
                                                title="Zamknij"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </h3>
                                        <div className="space-y-3">
                                            <input 
                                                type="text"
                                                placeholder="Temat wiadomości (wymagany)"
                                                value={emailSubject}
                                                onChange={(e) => setEmailSubject(e.target.value)}
                                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                                            />
                                            <textarea
                                                placeholder="Treść wiadomości (wymagana)"
                                                value={emailMessage}
                                                onChange={(e) => setEmailMessage(e.target.value)}
                                                rows={4}
                                                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500 resize-none"
                                            />
                                            <label className="block text-xs font-medium text-slate-700">
                                                Załącznik (PDF lub ZIP, wymagany):
                                                <input 
                                                    type="file"
                                                    accept=".pdf,.zip"
                                                    onChange={(e) => setEmailAttachment(e.target.files?.[0] || null)}
                                                    className="block w-full text-sm mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
                                                />
                                                {emailAttachment && <p className="text-xs text-green-600 mt-1">Wybrano: **{emailAttachment.name}**</p>}
                                            </label>
                                            
                                            {emailError && (
                                                <p className="text-xs text-red-500 flex items-center">
                                                    <AlertCircle className="h-4 w-4 mr-1" /> {emailError}
                                                </p>
                                            )}
                                            
                                            <button
                                                onClick={handleSendEmail}
                                                disabled={isSendingEmail}
                                                className="w-full px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors flex items-center justify-center disabled:opacity-50"
                                            >
                                                <Send className="h-4 w-4 mr-2" />
                                                {isSendingEmail ? "Wysyłanie..." : "Wyślij e-mail z załącznikiem"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                </div>
                                
                                {/* ---- Tabela plików i logika przydzielania (brakujące w Twoim fragmencie) ---- */}
                                <div className="mt-8">
                                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                                        <FileText className="h-5 w-5 mr-2 text-purple-600" /> Pliki
                                    </h3>

                                    {/* Zarządzanie Programistą (tylko dla Managera) */}
                                    {isManager && (
                                        <div className="mb-4 p-4 border border-blue-200 bg-blue-50 rounded-xl">
                                            <p className="text-sm font-semibold mb-2 text-slate-700">Zarządzanie Zespołem:</p>
                                            <div className="flex items-center gap-3">
                                                <select
                                                    defaultValue={order?.developer || ""}
                                                    onChange={(e) => {
                                                        const id = e.target.value === "" ? null : Number(e.target.value);
                                                        if (id !== order?.developer) {
                                                            setIsAssigning(true);
                                                            handleAssignProgrammer(id);
                                                        }
                                                    }}
                                                    className="block w-full sm:w-1/2 border rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                                                    disabled={isAssigning}
                                                >
                                                    <option value="">-- Wybierz Programistę (Opcjonalnie) --</option>
                                                    {programmers.map((p) => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.username}
                                                        </option>
                                                    ))}
                                                </select>
                                                <span className="text-xs text-slate-500">
                                                    Aktualnie przypisany: **{order?.developer || 'Brak'}**
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Formularz wgrywania plików (dla Managera/Programisty) */}
                                    {canSeeUploadForm && (
                                        <div className="mb-6 p-4 border border-orange-200 bg-orange-50 rounded-xl">
                                            <h4 className="text-sm font-semibold text-slate-700 mb-3">Wgraj nowy plik:</h4>
                                            <div className="space-y-3">
                                                <input 
                                                    type="file"
                                                    onChange={handleFileChange}
                                                    className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
                                                />
                                                <div className="flex gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Nazwa pliku (wymagana)"
                                                        value={uploadName}
                                                        onChange={(e) => setUploadName(e.target.value)}
                                                        className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                                                    />
                                                    <select
                                                        value={uploadType}
                                                        onChange={(e) => setUploadType(e.target.value)}
                                                        className="w-32 border rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500"
                                                    >
                                                        <option value="pdf">PDF</option>
                                                        <option value="zip">ZIP</option>
                                                        <option value="docx">DOCX</option>
                                                        <option value="other">Inny</option>
                                                    </select>
                                                </div>
                                                <textarea
                                                    placeholder="Opis pliku (opcjonalny)"
                                                    value={uploadDescription}
                                                    onChange={(e) => setUploadDescription(e.target.value)}
                                                    rows={1}
                                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-purple-500 focus:border-purple-500 resize-none"
                                                />
                                                <button
                                                    onClick={handleUpload}
                                                    disabled={!uploadFileObj || !uploadName || !uploadType}
                                                    className="w-full px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                                                >
                                                    Wgraj plik
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {message && (
                                        <div className={`p-3 text-sm rounded-xl mb-4 ${
                                            message.includes("Błąd") || message.includes("❌") ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'
                                        }`}>
                                            {message}
                                        </div>
                                    )}
                                    {statusMessage && (
                                        <div className={`p-3 text-sm rounded-xl mb-4 ${
                                            statusMessage.includes("Błąd") ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'
                                        }`}>
                                            {statusMessage}
                                        </div>
                                    )}

                                    {/* Kontrola widoku i akcje zbiorcze */}
                                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.length === filesToDisplay.length && filesToDisplay.length > 0}
                                                onChange={toggleSelectAll}
                                                className="rounded text-purple-600 focus:ring-purple-500"
                                                disabled={filesToDisplay.length === 0}
                                            />
                                            <span className="text-sm text-slate-600">
                                                Zaznacz wszystkie ({selectedIds.length}/{filesToDisplay.length})
                                            </span>
                                        </div>
                                        
                                        <button
                                            onClick={handleDownload}
                                            disabled={!canDownloadAnything}
                                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors flex items-center disabled:opacity-50"
                                        >
                                            <Download className="h-4 w-4 mr-2" /> Pobierz zaznaczone
                                        </button>
                                    </div>

                                    {/* Lista Plików */}
                                    <div className="space-y-3">
                                        {filesToDisplay.length === 0 ? (
                                            <p className="text-center text-slate-500 py-6">Brak plików dla tego zamówienia.</p>
                                        ) : (
                                            filesToDisplay.map((file) => (
                                                <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-slate-100 hover:bg-gray-100 transition-colors">
                                                    <div className="flex items-center space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={!!selected[file.id]}
                                                            onChange={() => toggleOne(file.id)}
                                                            className="rounded text-purple-600 focus:ring-purple-500"
                                                        />
                                                        <FileText className="h-5 w-5 text-purple-500 shrink-0" />
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-800">{file.name} ({file.file_type})</p>
                                                            <p className="text-xs text-slate-500">{file.description || 'Brak opisu'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-3 shrink-0">
                                                        {isManager && (
                                                            <button
                                                                onClick={() => handleVisibilityToggle(file.id, !file.visible_to_clients)}
                                                                className={`p-1 rounded-full transition-colors ${file.visible_to_clients ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                                                                title={file.visible_to_clients ? 'Ukryj przed klientem' : 'Udostępnij klientowi'}
                                                            >
                                                                {file.visible_to_clients ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                            </button>
                                                        )}
                                                        {isProgrammer && !file.visible_to_clients && (
                                                            <span className="text-xs text-red-500 flex items-center">
                                                                <EyeOff className="h-3 w-3 mr-1" /> Ukryty
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={() => window.open(file.uploaded_file_url, "_blank")}
                                                            className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold hover:bg-purple-200 transition-colors flex items-center"
                                                            title="Otwórz plik w nowej karcie"
                                                        >
                                                            <Download className="h-3 w-3 mr-1" /> POBIERZ
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            // WIDOK HISTORII
                            <OrderHistoryList logs={historyLogs} />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}