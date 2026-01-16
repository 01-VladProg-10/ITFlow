import { useState } from "react";
import { Menu, LogIn, X } from "lucide-react";
import { Link } from "react-router-dom";

import dashboardIcon from "../icons/daszboard.png";
import zanowieniaIcon from "../icons/zanowienia.png";
import kontaktIcon from "../icons/kontakt.png";
import ustawieniaIcon from "../icons/ustawienia.png";

function Logo({ className = "h-7 w-auto" }) {
  return (
    <div className="flex items-center gap-2">
      <svg className={className} viewBox="0 0 64 64" fill="none">
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
  { name: "Dashboard", to: "/dashboard", icon: dashboardIcon },
  { name: "Zamówienia", to: "/manager-orders", icon: zanowieniaIcon },
  { name: "Zgłoszenia", to: "/reports", icon: kontaktIcon },
  { name: "Ustawienia", to: "/manager-ustawienia", icon: ustawieniaIcon },
];

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const content = (
    <div className="flex h-full w-72 flex-col bg-gradient-to-b from-[#7A36EF] to-[#2D19E9] text-white">
      <div className="flex items-center justify-between h-16 px-4">
        <Logo />
        <button className="md:hidden p-2 rounded-xl hover:bg-white/10" onClick={onClose}>
          <X className="h-6 w-6" />
        </button>
      </div>

      <nav className="px-3 mt-4 space-y-1">
        {nav.map((item) => (
          <Link
            key={item.name}
            to={item.to}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl hover:bg-white/10"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
              <img src={item.icon} className="h-4 w-4" />
            </span>
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="mt-auto p-4">
        <Link
          to="/"
          className="flex justify-center items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold"
        >
          <LogIn className="h-4 w-4" />
          Wyloguj się
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:block fixed inset-y-0 left-0 z-40">{content}</aside>

      {open && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40" onClick={onClose}>
          <div onClick={(e) => e.stopPropagation()} className="h-full">
            {content}
          </div>
        </div>
      )}
    </>
  );
}

function MobileHeader({ onOpen }: { onOpen: () => void }) {
  return (
    <header className="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur border-b">
      <div className="h-14 px-4 flex items-center justify-between">
        <button onClick={onOpen} className="p-2 rounded-xl hover:bg-slate-100">
          <Menu className="h-6 w-6" />
        </button>

        <div className="font-bold">ITFlow</div>

        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-violet-600 to-blue-600"
        >
          <LogIn className="h-4 w-4" />
          Wyloguj
        </Link>
      </div>
    </header>
  );
}

export default function ManagerReports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F3F2F8]">
      <MobileHeader onOpen={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="md:ml-72">
        <div className="h-[100px] bg-gradient-to-r from-[#8F2AFA] via-[#5F7EFA] to-[#2D19E9]" />

        <div className="px-6 md:px-[88px] pt-10 pb-16">
          <h1 className="text-[28px] md:text-[32px] font-extrabold text-slate-900">
            📢 Zgłoszenia użytkowników
          </h1>
          <p className="text-slate-500 text-[14px] mt-1">
            Tu znajdziesz listę zgłoszeń od klientów.
          </p>

          <div className="mt-8 bg-white border rounded-2xl shadow p-6">
            <p className="text-slate-600 text-sm">
              Moduł raportów zostanie tu dodany wkrótce…
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
