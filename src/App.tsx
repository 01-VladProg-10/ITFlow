
import { useState } from "react";
import {
  CheckCircle2, Menu, X, Sparkles, ShieldCheck, Rocket, Clock,
  ArrowRight, Mail, Phone, ArrowUpRight, Home, FolderKanban,
  MessageCircle, Settings, LogIn
} from "lucide-react";

type NavItem = { name: string; href: string; icon: any; disabled?: boolean };

const nav: NavItem[] = [
  { name: "Dashboard", href: "#hero", icon: Home },
  { name: "Możliwości", href: "#features", icon: FolderKanban },
  { name: "Kontakt", href: "#contact", icon: MessageCircle },
  { name: "Ustawienia", href: "#", icon: Settings, disabled: true },
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
    <div className="flex h-full w-72 flex-col bg-gradient-to-b from-violet-600 to-blue-600 text-white">
      <div className="flex items-center justify-between px-4 h-16">
        <Logo />
        {onClose && (
          <button onClick={onClose} className="md:hidden rounded-xl p-2 hover:bg-white/10" aria-label="Zamknij menu">
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      <nav className="mt-4 px-3 space-y-1">
        {nav.map(({ name, href, icon: Icon, disabled }) => (
          <a
            key={name}
            href={href}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-white/10"}`}
            onClick={onClose}
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
              <Icon className="h-4 w-4" />
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
            <a href="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-slate-900 px-3 py-2 text-sm font-semibold">
              <LogIn className="h-4 w-4" /> Zaloguj
            </a>
            <a href="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-black/20 px-3 py-2 text-sm font-semibold">
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
      {/* Desktop */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-40">{content}</aside>
      {/* Mobile overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40" onClick={onClose}>
          <div className="h-full" onClick={(e) => e.stopPropagation()}>{content}</div>
        </div>
      )}
    </>
  );
}

function DashboardMock() {
  return (
    <div className="relative rounded-2xl bg-white/80 backdrop-blur shadow-xl ring-1 ring-black/5 p-5 md:p-6 w-full">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-3">
          {["Dashboard", "Moje zamówienia", "Kontakt", "Ustawienia"].map((t, i) => (
            <div key={t} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${i === 0 ? "bg-indigo-50 text-indigo-700" : "bg-slate-50 text-slate-600"}`}>
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
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="h-14 flex items-center justify-between px-4">
          <button onClick={() => setOpen(true)} className="rounded-xl p-2 hover:bg-slate-100" aria-label="Otwórz menu">
            <Menu className="h-6 w-6" />
          </button>
          <div className="font-bold">ITFlow</div>
          <a href="/login" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600">
            Zaloguj
          </a>
        </div>
      </header>

      {/* Sidebar */}
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* Content (space for sidebar on md+) */}
      <main className="md:pl-72">
        {/* Gradient halo like screenshot */}
        <div className="pointer-events-none absolute right-0 top-0 -z-10 h-[28rem] w-[60%] bg-gradient-to-tr from-violet-500/25 to-blue-500/25 blur-3xl" />

        {/* HERO */}
        <section id="hero" className="px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="max-w-6xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-indigo-700 text-xs font-medium">
              <Sparkles className="h-4 w-4" /> Witaj w ITFlow
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
              Panel, który znasz — teraz jako strona startowa
            </h1>
            <p className="mt-3 text-slate-600 text-lg max-w-2xl">
              Zanim się zalogujesz, zobacz jak wygląda praca w ITFlow. Styl identyczny: lewy pasek, karty i gradienty.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/register" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 shadow">
                Załóż darmowe konto <ArrowRight className="h-4 w-4" />
              </a>
              <a href="/login" className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
                Zaloguj się
              </a>
            </div>

            <div className="mt-10">
              <DashboardMock />
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-6xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Możliwości</h2>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f) => (
                <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white flex items-center justify-center">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-semibold text-lg">{f.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-6xl grid md:grid-cols-2 gap-6 rounded-2xl border border-slate-200 bg-white p-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Masz pytania?</h2>
              <p className="mt-2 text-slate-600">Napisz — odpowiemy w 24h.</p>
              <div className="mt-4 flex flex-col gap-2 text-sm text-slate-700">
                <div className="inline-flex items-center gap-2"><Mail className="h-4 w-4" /> support@itflow.dev</div>
                <div className="inline-flex items-center gap-2"><Phone className="h-4 w-4" /> +48 600 000 000</div>
              </div>
            </div>
            <form className="grid grid-cols-1 gap-3">
              <input className="rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Imię" />
              <input className="rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="E-mail" />
              <textarea rows={4} className="rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Wiadomość" />
              <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-blue-600 shadow hover:shadow-md">
                Wyślij wiadomość <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>

        <footer className="px-4 sm:px-6 lg:px-8 py-10 text-slate-500">
          <div className="max-w-6xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="text-sm">© {new Date().getFullYear()} ITFlow</div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-slate-700">Polityka prywatności</a>
              <a href="#" className="hover:text-slate-700">Regulamin</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
