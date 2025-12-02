import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, X, LogIn } from "lucide-react";

import { getMessage, respondToMessage, type ContactMessage } from "../api/message";
import dashboardIcon from "../icons/daszboard.png";
import zanowieniaIcon from "../icons/zanowienia.png";
import kontaktIcon from "../icons/kontakt.png";
import ustawieniaIcon from "../icons/ustawienia.png";
import { Link } from "react-router-dom";

/* === SIDEBAR === */
type Role = "manager";

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
      <div className="flex h-full w-72 flex-col bg-[linear-gradient(180deg,_#7A36EF_0%,_#2D19E9_100%)] text-white">
        <div className="flex items-center justify-between px-4 h-16">
          <h2 className="font-bold text-xl tracking-tight text-white">ITFlow</h2>
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

/* === DETAIL PAGE === */
export default function ManagerReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<ContactMessage | null>(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getMessage(Number(id))
      .then((data) => setReport(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSendResponse = async () => {
    if (!report) return;
    setSending(true);
    setError("");
    try {
      await respondToMessage(report.id, response);
      alert("Odpowiedź została wysłana!");
      navigate("/reports"); // powrót do listy zgłoszeń
    } catch (err: any) {
      setError(err.message || "Błąd przy wysyłaniu odpowiedzi");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p className="p-8 text-slate-500">Ładowanie zgłoszenia...</p>;
  if (!report) return <p className="p-8 text-red-500">Nie znaleziono zgłoszenia.</p>;

  return (
    <div className="min-h-screen bg-[#F3F2F8]">
      <Sidebar role="manager" />

      <main className="md:ml-72 p-8">
        <h1 className="text-2xl font-bold mb-4">Szczegóły zgłoszenia</h1>

        <div className="bg-white rounded-2xl shadow-md p-6 max-w-3xl">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{report.first_name} {report.last_name}</h2>
            <p className="text-slate-500">{report.email}</p>
            <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
              <Clock className="h-4 w-4" />
              <span>{new Date(report.created_at).toLocaleString()}</span>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold">Wiadomość od klienta</h3>
            <p className="text-slate-600 whitespace-pre-wrap">{report.request_message}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold">Odpowiedź</h3>
            {report.is_answered ? (
              <p className="text-slate-600 whitespace-pre-wrap">{report.response_message}</p>
            ) : (
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2"
                rows={5}
                placeholder="Wpisz odpowiedź..."
              />
            )}
          </div>

          {!report.is_answered && (
            <div className="flex gap-4">
              <button
                onClick={handleSendResponse}
                disabled={sending || !response.trim()}
                className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition disabled:opacity-50"
              >
                {sending ? "Wysyłanie..." : "Wyślij odpowiedź"}
              </button>
            </div>
          )}

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </main>
    </div>
  );
}