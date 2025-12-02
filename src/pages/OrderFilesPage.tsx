// src/pages/OrderFilesPage.tsx
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { FileText, Download, ArrowLeft, Upload, Users, UserPlus, UserCheck } from "lucide-react"; 

import { Sidebar } from "./OrdersPage";
import { fetchOrders, type Order } from "../api/orders"; 
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

type Role = "client" | "programmer" | "manager";

export default function OrderFilesPage({ role }: { role: Role }) {
  const { orderId } = useParams<{ orderId: string }>();
  const id = Number(orderId);

  const [order, setOrder] = useState<Order | null>(null);
  const [files, setFiles] = useState<OrderFile[]>([]);
  const [programmers, setProgrammers] = useState<Programmer[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false); 

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

    const dataPromises: [Promise<Order[]>, Promise<OrderFile[]>, Promise<Programmer[]>] = [
        fetchOrders(), 
        fetchFilesByOrder(id), 
        isManager ? fetchProgrammers() : Promise.resolve([])
    ];

    Promise.all(dataPromises)
      .then(([orders, orderFiles, programmersList]) => {
        const found = orders.find((o) => o.id === id) ?? null;
        setOrder(found);
        setFiles(orderFiles);
        setProgrammers(programmersList);
      })
      .catch((e) => setError("Nie udało się pobrać danych zamówienia: " + (e.message || "Błąd sieci")))
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

  // Funkcja przypisania developera i managera
  const handleAssignProgrammer = async (developerId: number | null) => {
    if (!order) return;
    try {
      const updatedOrder = await assignDeveloperAndManagerToOrder(order.id, developerId);
      setOrder(updatedOrder); 
      setMessage(
        developerId
          ? `Programista ${programmers.find(p => p.id === developerId)?.username || developerId} został przypisany! Managerem został użytkownik ID ${updatedOrder.manager}.`
          : "Programista został usunięty z zamówienia."
      );
      setIsAssigning(false); 
    } catch (e: any) {
      setMessage(`Nie udało się przypisać: ${e.message || "Błąd serwera."}`);
    }
  };

  // NOWA FUNKCJA: Otwieranie zaznaczonych plików w nowych kartach
  const handleDownload = () => {
    const filesToOpen = files.filter((f) => selected[f.id]);
    if (!filesToOpen.length) {
      setMessage("Wybierz przynajmniej jeden plik do pobrania.");
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
      setMessage("Wybierz plik i wypełnij wymagane pola.");
      return;
    }
    try {
      const newFile = await uploadFile({
        file: uploadFileObj,
        order: order.id,
        name: uploadName || uploadFileObj.name,
        file_type: uploadType,
        description: uploadDescription,
        visible_to_clients: false,
      });
      setFiles((prev) => [...prev, { ...newFile, url: newFile.uploaded_file_url }]);
      setMessage("Plik został wgrany!");
      setUploadFileObj(null);
      setUploadName("");
      setUploadType("pdf");
      setUploadDescription("");
    } catch (e: any) {
      setMessage(e.message || "Błąd przy wgrywaniu pliku.");
    }
  };

  const handleVisibilityToggle = async (fileId: number, visible: boolean) => {
    try {
      const updated = await updateFileVisibility(fileId, visible);
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, visible_to_clients: updated.visible_to_clients } : f))
      );
    } catch {
      setMessage("Nie udało się zmienić widoczności pliku.");
    }
  };

  const assignedDeveloper = order?.developer ? programmers.find(p => p.id === order.developer) : null;

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
          <p className="text-slate-500 text-[14px] mb-6">
            {order ? order.title : `Zamówienie #${id}`}
          </p>

          {order && (isManager || isProgrammer) && (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 mb-4 space-y-2">
              <p className="text-[14px] text-slate-700 font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                Przypisany **Developer**:
                <span className="font-normal text-blue-600 ml-1">
                  {assignedDeveloper ? `${assignedDeveloper.username} (ID: ${assignedDeveloper.id})` : "Brak"}
                </span>
              </p>
              <p className="text-[14px] text-slate-700 font-semibold flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                Przypisany **Manager**:
                <span className="font-normal text-green-600 ml-1">
                  {order.manager ? `ID: ${order.manager}` : "Brak"} 
                </span>
              </p>
            </div>
          )}

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
                          {file.description}
                        </div>
                        <div className="text-[12px] text-slate-400">
                          Widoczny dla klienta:{" "}
                          {file.visible_to_clients ? "✅" : "❌"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!selected[file.id]}
                        onChange={() => toggleOne(file.id)}
                      />
                      {isManager && (
                        <button
                          onClick={() =>
                            handleVisibilityToggle(file.id, !file.visible_to_clients)
                          }
                          className="px-2 py-1 text-[12px] bg-slate-200 rounded"
                        >
                          Zmień widoczność
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isProgrammer && (
              <div className="mb-6 border-t pt-4 border-slate-200 space-y-2">
                <input type="file" onChange={handleFileChange} />
                <input
                  type="text"
                  placeholder="Nazwa pliku"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="border rounded px-2 py-1 text-[13px] block w-full max-w-sm"
                />
                <input
                  type="text"
                  placeholder="Typ pliku (pdf, docx, zip)"
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  className="border rounded px-2 py-1 text-[13px] block w-full max-w-sm"
                />
                <input
                  type="text"
                  placeholder="Opis pliku"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  className="border rounded px-2 py-1 text-[13px] block w-full max-w-sm"
                />
                <button
                  onClick={handleUpload}
                  className="px-4 py-2 rounded-xl bg-blue-500 text-white text-[13px] font-semibold flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Wgraj plik
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {(isManager || isClient || isProgrammer) && (
                <button
                  onClick={toggleSelectAll}
                  className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-slate-200 text-slate-800"
                >
                  Zaznacz wszystkie
                </button>
              )}
              {isManager && (
                <button
                  onClick={() => setIsAssigning(!isAssigning)} 
                  className="px-4 py-2 rounded-xl bg-[#8F2AFA] text-white flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Przydziel programistę
                </button>
              )}
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

            {isManager && isAssigning && (
              <div className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
                <h3 className="font-semibold mb-2 text-[14px]">Wybierz developera do przydzielenia:</h3>
                <div className="space-y-1">
                  {programmers.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleAssignProgrammer(p.id)}
                      className={`block w-full text-left px-3 py-2 rounded-md text-[13px] hover:bg-purple-100 transition 
                                ${order?.developer === p.id ? 'bg-purple-200 font-bold' : 'bg-white'}`}
                    >
                      {p.username} ({p.email}) 
                      {order?.developer === p.id && " (Obecnie przypisany)"}
                    </button>
                  ))}
                  <button
                    onClick={() => handleAssignProgrammer(null)}
                    className="block w-full text-left px-3 py-2 rounded-md text-[13px] hover:bg-red-100 bg-white transition text-red-600 font-semibold"
                  >
                    Usuń przypisanie developera
                  </button>
                </div>
              </div>
            )}

            {message && <p className="text-slate-600 text-[13px] mt-3">{message}</p>}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ==== Komponenty pomocnicze ==== */
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

function Loading({ role }: { role: Role }) {
  return (
    <div className="min-h-screen bg-[#F3F2F8]">
      <Sidebar role={role} />
      <main className="md:ml-72 p-10">Ładowanie...</main>
    </div>
  );
}

function ErrorMessage({ role, message }: { role: Role; message: string }) {
  return (
    <div className="min-h-screen bg-[#F3F2F8]">
      <Sidebar role={role} />
      <main className="md:ml-72 p-10 text-red-600">{message}</main>
    </div>
  );
}
