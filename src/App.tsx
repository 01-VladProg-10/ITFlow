// App.tsx
import { useState } from "react";
<<<<<<< HEAD
import { Link } from "react-router-dom";
import {
  CheckCircle2, Menu, X, Sparkles, ShieldCheck, Rocket, Clock,
=======
import {Link } from "react-router-dom";
import {
   Menu, X, Sparkles, ShieldCheck, Rocket, Clock,
>>>>>>> 167d2b46339eef27cb1c19d34fbdb3708b3443a1
  ArrowRight, Mail, Phone, LogIn
} from "lucide-react";

import dashboardIcon from "./icons/daszboard.png";
import zanowieniaIcon from "./icons/zanowienia.png";
import kontaktIcon from "./icons/kontakt.png";
import ustawieniaIcon from "./icons/ustawienia.png";

type NavItem = { name: string; href: string; icon: string; disabled?: boolean };

const nav: NavItem[] = [
  { name: "Dashboard", href: "#hero", icon: dashboardIcon },
  { name: "Możliwości", href: "#features", icon: zanowieniaIcon },
  { name: "Kontakt", href: "#contact", icon: kontaktIcon },
  { name: "Ustawienia", href: "#", icon: ustawieniaIcon, disabled: true },
];

const features = [
  { icon: Rocket, title: "Szybki start", desc: "Utwórz projekt w 2 minuty i przypisz zadania." },
  { icon: ShieldCheck, title: "Bezpieczeństwo", desc: "Szyfrowanie i kontrola dostępu." },
  { icon: Clock, title: "Status live", desc: "Aktualizacje w czasie rzeczywistym." },
  { icon: Sparkles, title: "Przyjazny UI", desc: "Lekki, znajomy interfejs jak w panelu." },
];

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
        <path d="M12 46c10 4 29-2 34-14" stroke="url(#g)" strokeWidth="6" strokeLinecap="round" />
        <circle cx="46" cy="22" r="6" fill="url(#g)" />
      </svg>
      <span className="font-bold text-xl tracking-tight text-white">ITFlow</span>
    </div>
  );
}

function Sidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const content = (
<<<<<<< HEAD
    <div className="flex h-full w-72 flex-col bg-gradient-to-b from-violet-600 to-blue-600 text-white">
=======
    <div className="flex h-full w-72 flex-col bg-[linear-gradient(180deg,_#7A36EF_0%,_#2D19E9_100%)] text-white">

>>>>>>> 167d2b46339eef27cb1c19d34fbdb3708b3443a1
      <div className="flex items-center justify-between px-4 h-16">
        <Logo />
        {onClose && (
          <button onClick={onClose} className="md:hidden rounded-xl p-2 hover:bg-white/10" aria-label="Zamknij menu">
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      <nav className="mt-4 px-3 space-y-1">
        {nav.map(({ name, href, icon, disabled }) => (
          <a
            key={name}
            href={href}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
              disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-white/10"
            }`}
            onClick={onClose}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
              <img src={icon} alt={name} className="h-4 w-4" />
            </span>
            <span>{name}</span>
          </a>
        ))}
      </nav>

      <div className="mt-auto p-4">
        <div className="rounded-2xl bg-white/10 p-3 text-sm">
          <div className="font-semibold">Masz już konto?</div>
          <p className="text-white/80 mt-1">Zaloguj się, aby zobaczyć panel.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-slate-900 px-3 py-2 text-sm font-semibold"
            >
              <LogIn className="h-4 w-4" /> Zaloguj
            </Link>
            <a
<<<<<<< HEAD
              href="#"
=======
              href="/login?mode=register"
>>>>>>> 167d2b46339eef27cb1c19d34fbdb3708b3443a1
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-black/20 px-3 py-2 text-sm font-semibold"
            >
              Załóż konto
            </a>
          </div>
        </div>
        <div className="mt-4 text-xs text-white/70">© {new Date().getFullYear()} ITFlow</div>
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

<<<<<<< HEAD
function DashboardMock() {
  return (
    <div className="relative rounded-2xl bg-white/80 backdrop-blur shadow-xl ring-1 ring-black/5 p-5 md:p-6 w-full">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-3">
          {["Dashboard", "Moje zamówienia", "Kontakt", "Ustawienia"].map((t, i) => (
            <div
              key={t}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                i === 0 ? "bg-indigo-50 text-indigo-700" : "bg-slate-50 text-slate-600"
              }`}
            >
              <div className="h-8 w-8 rounded-xl bg-white shadow flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <span>{t}</span>
            </div>
          ))}
          <div className="pt-2 text-xs text-slate-400">Wyloguj się</div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-100 p-4 bg-white">
            <div className="text-slate-800 font-semibold mb-1">Witaj, Jan Kowalski!</div>
            <div className="text-slate-500 text-sm">1 zamówienie ma aktualizację</div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl p-4 bg-white border border-slate-100">
              <div className="text-slate-600 text-sm mb-1">Twoje zamówienie</div>
              <div className="font-semibold">Tworzenie strony WWW</div>
              <div className="mt-2 text-sm">
                Status: <span className="text-indigo-600 font-medium">Gotowe</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div className="h-2 w-10/12 rounded-full bg-gradient-to-r from-violet-500 to-blue-500" />
              </div>
            </div>

            <div className="rounded-2xl p-4 bg-white border border-slate-100">
              <div className="font-semibold mb-3">Historia działań</div>
              <ul className="text-sm space-y-2">
                {["Gotowe", "Dodany plik pośredni", "Do poprawy", "Do sprawdzania klientowi"].map((s, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
=======

function AppContent() {
>>>>>>> 167d2b46339eef27cb1c19d34fbdb3708b3443a1
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="h-14 flex items-center justify-between px-4">
          <button onClick={() => setOpen(true)} className="rounded-xl p-2 hover:bg-slate-100" aria-label="Otwórz menu">
            <Menu className="h-6 w-6" />
          </button>
          <div className="font-bold">ITFlow</div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600"
          >
            <LogIn className="h-4 w-4" />
            Zaloguj
          </Link>
        </div>
      </header>

      <Sidebar open={open} onClose={() => setOpen(false)} />

      <main className="md:ml-72 p-6 space-y-12">
        <section id="hero" className="text-center py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-slate-800">
            Zarządzaj projektami IT jak profesjonalista
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto">
            ITFlow to nowoczesny panel do kontroli projektów, zleceń i komunikacji z zespołem.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <a
<<<<<<< HEAD
              href="#"
=======
              href="/login?mode=register"
>>>>>>> 167d2b46339eef27cb1c19d34fbdb3708b3443a1
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold"
            >
              Wypróbuj teraz <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border border-slate-300 font-semibold text-slate-700 bg-white"
            >
              Dowiedz się więcej
            </a>
          </div>
        </section>

        <section id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 flex items-center justify-center text-white mb-3">
                <Icon className="h-5 w-5" />
              </div>
              <div className="font-semibold text-slate-800">{title}</div>
              <p className="text-slate-600 text-sm mt-1">{desc}</p>
            </div>
          ))}
        </section>

        <section id="contact" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold mb-4 text-slate-800">Skontaktuj się z nami</h2>
          <p className="text-slate-600 mb-4">
            Masz pytania? Skontaktuj się z naszym zespołem — odpowiemy w ciągu 24h.
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <a href="mailto:kontakt@itflow.pl" className="flex items-center gap-2 text-indigo-600 font-medium">
              <Mail className="h-4 w-4" /> kontakt@itflow.pl
            </a>
            <a href="tel:+48123456789" className="flex items-center gap-2 text-indigo-600 font-medium">
              <Phone className="h-4 w-4" /> +48 123 456 789
            </a>
          </div>
        </section>
<<<<<<< HEAD

        <section className="py-6">
          <DashboardMock />
        </section>
=======
>>>>>>> 167d2b46339eef27cb1c19d34fbdb3708b3443a1
      </main>
    </div>
  );
}
<<<<<<< HEAD
=======

export default function App() {
 return <AppContent />;
}

>>>>>>> 167d2b46339eef27cb1c19d34fbdb3708b3443a1
