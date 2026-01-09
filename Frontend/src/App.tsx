// App.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Rocket,
  Clock,
  ArrowRight,
  Mail,
  Phone,
  LogIn,
} from "lucide-react";

import dashboardIcon from "./icons/daszboard.png";
import zanowieniaIcon from "./icons/zanowienia.png";
import kontaktIcon from "./icons/kontakt.png";
import ustawieniaIcon from "./icons/ustawienia.png";
import logoIcon from "./icons/logo.png";

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
      <img src={logoIcon} alt="ITFlow" className={className} />
      <span className="font-bold text-xl tracking-tight text-white">ITFlow</span>
    </div>
  );
}

function Sidebar({ open, onClose }: { open?: boolean; onClose?: () => void }) {
  const content = (
    <div
      className="flex h-full w-72 flex-col 
                 bg-[linear-gradient(180deg,_#7A36EF_0%,_#2D19E9_100%)] 
                 dark:bg-[linear-gradient(180deg,_#4C1D95_0%,_#1E1B4B_35%,_#020617_100%)]
                 text-white"
    >

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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-itf-darkCard text-slate-900 dark:text-white px-3 py-2 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-itf-darkSurface transition"
            >
              <LogIn className="h-4 w-4" /> Zaloguj
            </Link>
            <a
              href="/login?mode=register"
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


function AppContent() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F3F2F8] text-slate-900 dark:bg-[#0B122A] dark:text-white">
      <header className="md:hidden sticky top-0 z-30 bg-white/80 dark:bg-[#0B122A] backdrop-blur border-b border-slate-200 dark:border-itf-darkBorder">
        <div className="h-14 flex items-center justify-between px-4">
          <button onClick={() => setOpen(true)} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white" aria-label="Otwórz menu">
            <Menu className="h-6 w-6" />
          </button>
          <div className="font-bold text-slate-900 dark:text-white">ITFlow</div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)] dark:bg-[linear-gradient(90deg,_#4C1D95_0%,_#1E1B4B_40%,_#020617_100%)]"
          >
            <LogIn className="h-4 w-4" />
            Zaloguj
          </Link>
        </div>
      </header>

      <Sidebar open={open} onClose={() => setOpen(false)} />

      <main className="md:ml-72 p-6 space-y-12">
        <section id="hero" className="text-center py-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-purple-700 dark:text-white">
            Zarządzaj projektami IT jak profesjonalista
          </h1>
          <p className="text-purple-600 dark:text-white/80 max-w-xl mx-auto">
            ITFlow to nowoczesny panel do kontroli projektów, zleceń i komunikacji z zespołem.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <a
              href="/login?mode=register"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)] dark:bg-[linear-gradient(90deg,_#4C1D95_0%,_#1E1B4B_40%,_#020617_100%)] text-white font-semibold"
            >
              Wypróbuj teraz <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold text-white bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)] dark:bg-[linear-gradient(90deg,_#4C1D95_0%,_#1E1B4B_40%,_#020617_100%)]"
            >
              Dowiedz się więcej
            </a>
          </div>
        </section>

        <section id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl bg-white dark:bg-[linear-gradient(90deg,_#6D28D9_0%,_#4C1D95_40%,_#1E1B4B_100%)] text-slate-900 dark:text-white p-6 shadow-lg border border-slate-100 dark:border-itf-darkBorder"
            >
              <div className="h-10 w-10 rounded-xl bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)] dark:bg-[#1E1B4B] flex items-center justify-center mb-3">
                <Icon className="h-5 w-5 text-white dark:text-purple-200" />
              </div>
              <div className="font-semibold text-slate-900 dark:text-white">{title}</div>
              <p className="text-slate-600 dark:text-white/80 text-sm mt-1">{desc}</p>
            </div>
          ))}
        </section>

        <section
          id="contact"
          className="bg-white dark:bg-itf-darkSurface text-slate-900 dark:text-white rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-itf-darkBorder"
        >
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Skontaktuj się z nami</h2>
          <p className="text-slate-600 dark:text-white/80 mb-4">
            Masz pytania? Skontaktuj się z naszym zespołem — odpowiemy w ciągu 24h.
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <a
              href="mailto:kontakt@itflow.pl"
              className="flex items-center gap-2 text-purple-600 dark:text-indigo-400 font-medium"
            >
              <Mail className="h-4 w-4" /> kontakt@itflow.pl
            </a>
            <a
              href="tel:+48123456789"
              className="flex items-center gap-2 text-purple-600 dark:text-indigo-400 font-medium"
            >
              <Phone className="h-4 w-4" /> +48 123 456 789
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function App() {
 return <AppContent />;
}

