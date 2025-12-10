import { useState } from "react";
import { X, LogIn, Menu } from "lucide-react";
import { Link } from "react-router-dom";

import dashboardIcon from "../icons/daszboard.png";
import zanowieniaIcon from "../icons/zanowienia.png";
import kontaktIcon from "../icons/kontakt.png";
import ustawieniaIcon from "../icons/ustawienia.png";

/* === LOGO === */
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

/* === NAWIGACJA === */
const nav = [
  { name: "Dashboard", to: "/dashboard", icon: dashboardIcon },
  { name: "Moje zamówienia", to: "/orders", icon: zanowieniaIcon },
  { name: "Kontakt", to: "/kontakt", icon: kontaktIcon },
  { name: "Ustawienia", to: "/ustawienia", icon: ustawieniaIcon },
];

/* === SIDEBAR (desktop + mobile) === */
function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const content = (
    <div className="flex h-full w-72 flex-col bg-[linear-gradient(180deg,#7A36EF_0%,#2D19E9_100%)] text-white">
      <div className="flex items-center justify-between px-4 h-16">
        <Logo />
        <button
          className="md:hidden rounded-xl p-2 hover:bg-white/10"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <nav className="mt-4 px-3 space-y-1">
        {nav.map(({ name, to, icon }) => (
          <Link
            key={name}
            to={to}
            onClick={onClose}
            className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-white/10"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
              <img src={icon} className="h-4 w-4" />
            </span>
            {name}
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
  );

  return (
    <>
      <aside className="hidden md:block fixed inset-y-0 left-0 z-40">
        {content}
      </aside>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40"
          onClick={onClose}
        >
          <div className="h-full" onClick={(e) => e.stopPropagation()}>
            {content}
          </div>
        </div>
      )}
    </>
  );
}

/* === MOBILE HEADER === */
function MobileHeader({ onOpen }: { onOpen: () => void }) {
  return (
    <header className="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur border-b">
      <div className="h-14 flex items-center justify-between px-4">
        <button onClick={onOpen} className="rounded-xl p-2 hover:bg-slate-100">
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

/* === MAIN PAGE === */
export default function KontaktUser() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F3F2F8]">
      <MobileHeader onOpen={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="md:ml-72">
        <div className="h-[100px] w-full bg-gradient-to-r from-[#8F2AFA] via-[#5F7EFA] to-[#2D19E9]" />

        <div className="px-6 md:px-[88px] pt-6 pb-10">
          <div className="mt-12 max-w-[645px]">
            <h1 className="text-[28px] md:text-[32px] font-extrabold text-slate-900 flex items-center gap-2">
              📬 Formularz kontaktowy
            </h1>
            <p className="text-slate-500 text-[14px] mt-1">Masz pytanie? Napisz do nas!</p>

            <div className="mt-6 bg-white rounded-2xl shadow-lg border p-6">
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 flex flex-col space-y-2">
                    <label className="font-medium">Imię</label>
                    <input type="text" required className="border rounded p-2" placeholder="Wpisz imię" />
                  </div>

                  <div className="flex-1 flex flex-col space-y-2">
                    <label className="font-medium">Nazwisko</label>
                    <input type="text" required className="border rounded p-2" placeholder="Wpisz nazwisko" />
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="font-medium">Email</label>
                  <input type="email" required className="border rounded p-2" placeholder="Twój email" />
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="font-medium">Wiadomość</label>
                  <textarea required className="border rounded p-2" placeholder="Twoja wiadomość" />
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-3 rounded-xl text-white text-[14px] font-semibold bg-gradient-to-r from-[#8F2AFA] via-[#5F7EFA] to-[#2D19E9] hover:opacity-90"
                >
                  Wyślij wiadomość
                </button>
              </form>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
