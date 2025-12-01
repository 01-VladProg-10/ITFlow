import { X, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

import dashboardIcon from "../icons/daszboard.png";
import zanowieniaIcon from "../icons/zanowienia.png";
import kontaktIcon from "../icons/kontakt.png";
import ustawieniaIcon from "../icons/ustawienia.png";

/* === Sidebar === */
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

const nav = [
  { name: "Dashboard", href: "/dashboard", icon: dashboardIcon },
  { name: "Moje zamówienia", href: "/orders", icon: zanowieniaIcon },
  { name: "Kontakt", to: "/kontakt", icon: kontaktIcon },
  { name: "Ustawienia", href: "/ustawienia", icon: ustawieniaIcon },
];

function Sidebar() {
  return (
    <aside className="hidden md:block fixed inset-y-0 left-0 z-40">
      <div className="flex h-full w-72 flex-col bg-[linear-gradient(180deg,_#7A36EF_0%,_#2D19E9_100%)] text-white">
        <div className="flex items-center justify-between px-4 h-16">
          <Logo />
          <button className="md:hidden rounded-xl p-2 hover:bg-white/10" aria-label="Zamknij menu">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-4 px-3 space-y-1">
          {nav.map(({ name, to, icon }) => (
            <Link
              key={name}
              to={to ?? "#"}
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
            className="flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 transition px-4 py-2 text-sm font-semibold"
          >
            <LogIn className="h-4 w-4" /> Wyloguj się
          </Link>

          <div className="mt-4 text-xs text-white/70">© {new Date().getFullYear()} ITFlow</div>
        </div>
      </div>
    </aside>
  );
}
/* === end Sidebar === */

export default function KontaktUser() {
  return (
    <div className="min-h-screen bg-[#F3F2F8]">
      <Sidebar />

      <main className="md:ml-72">
        <div className="h-[100px] w-full bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)]" />

        <div className="px-[88px] pt-6 pb-10">
          <div className="mt-12 max-w-[645px]">
            <h1 className="text-[32px] font-extrabold text-slate-900 flex items-center gap-2">
              📬 Formularz kontaktowy
            </h1>
            <p className="text-slate-500 text-[14px] mt-1">
              Masz pytanie? Napisz do nas!
            </p>

            {/* FORMULARZ */}
            <div className="mt-6 bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col space-y-2">
                    <label htmlFor="firstName" className="font-medium">Imię</label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      className="border rounded p-2"
                      placeholder="Wpisz swoje imię"
                    />
                  </div>

                  <div className="flex-1 flex flex-col space-y-2">
                    <label htmlFor="lastName" className="font-medium">Nazwisko</label>
                    <input
                      id="lastName"
                      type="text"
                      required
                      className="border rounded p-2"
                      placeholder="Wpisz swoje nazwisko"
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label htmlFor="email" className="font-medium">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="border rounded p-2"
                    placeholder="Wpisz swój email"
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <label htmlFor="message" className="font-medium">Wiadomość</label>
                  <textarea
                    id="message"
                    required
                    className="border rounded p-2"
                    placeholder="Twoja wiadomość"
                  />
                </div>

                {/* Кнопка Wyślij wiadomość всередині форми */}
                <button
                  type="submit"
                  className="w-full px-8 py-3 font-semibold text-[14px] rounded-xl text-white shadow-md bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)] hover:opacity-90 transition"
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
