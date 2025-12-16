import { useEffect, useState } from "react";
import { X, LogIn, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../api/kontakt";

import dashboardIcon from "../icons/daszboard.png";
import zanowieniaIcon from "../icons/zanowienia.png";
import kontaktIcon from "../icons/kontakt.png";
import ustawieniaIcon from "../icons/ustawienia.png";
import logoIcon from "../icons/logo.png";

/* === Sidebar === */
function Logo({ className = "h-7 w-auto" }) {
  return (
    <div className="flex items-center gap-2">
      <img src={logoIcon} alt="ITFlow" className={className} />
      <span className="font-bold text-xl tracking-tight text-white">ITFlow</span>
    </div>
  );
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const nav = [
    { name: "Dashboard", to: "/dashboard", icon: dashboardIcon },
    { name: "Moje zamówienia", to: "/orders", icon: zanowieniaIcon },
    { name: "Kontakt", to: "/kontakt", icon: kontaktIcon },
    { name: "Ustawienia", to: "/ustawienia", icon: ustawieniaIcon },
  ];
  const content = (
    <div className="flex h-full w-72 flex-col bg-[linear-gradient(180deg,_#7A36EF_0%,_#2D19E9_100%)] dark:bg-[linear-gradient(180deg,_#4C1D95_0%,_#1E1B4B_35%,_#020617_100%)] text-white">
      <div className="flex items-center justify-between px-4 h-16">
        <Logo />
        <button className="md:hidden rounded-xl p-2 hover:bg-white/10" aria-label="Zamknij menu" onClick={onClose}>
          <X className="h-6 w-6" />
        </button>
      </div>

      <nav className="mt-4 px-3 space-y-1">
        {nav.map(({ name, to, icon }) => (
          <Link
            key={name}
            to={to ?? "#"}
            className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-white/10"
            onClick={onClose}
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
          onClick={onClose}
        >
          <LogIn className="h-4 w-4" /> Wyloguj się
        </Link>

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
/* === end Sidebar === */

export default function UserSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    password: "",
    passwordVerify: "",
  });

  useEffect(() => {
    getUserProfile()
      .then((data) => {
        setProfile({
          username: data.username || "",
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          email: data.email || "",
          company: data.company || "",
          password: "",
          passwordVerify: "",
        });
      })
      .catch(console.error);
  }, []);

  const handleChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const displayValue = (value: string) => (value.trim() === "" ? "-" : value);

  const handleSave = async () => {
    if (profile.password || profile.passwordVerify) {
      if (profile.password !== profile.passwordVerify) {
        alert("❌ Hasła muszą być identyczne!");
        return;
      }
    }

    try {
      const payload: any = {
        username: profile.username,
        first_name: profile.firstName,
        last_name: profile.lastName,
        email: profile.email,
        company: profile.company,
      };
      if (profile.password) {
        payload.password = profile.password;
        payload.password_verify = profile.passwordVerify;
      }

      const updated = await updateUserProfile(payload);
      setProfile({
        username: updated.username,
        firstName: updated.first_name,
        lastName: updated.last_name,
        email: updated.email,
        company: updated.company || "",
        password: "",
        passwordVerify: "",
      });
      alert("✅ Profil został zaktualizowany!");
      setEditing(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Błąd przy aktualizacji profilu");
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F2F8] text-slate-900 dark:bg-[#0B122A] dark:text-white">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 bg-white/80 dark:bg-[#0B122A] backdrop-blur border-b border-slate-200 dark:border-itf-darkBorder">
        <div className="h-14 flex items-center justify-between px-4">
          <button onClick={() => setSidebarOpen(true)} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white">
            <Menu className="h-6 w-6" />
          </button>
          <div className="font-bold text-slate-900 dark:text-white">ITFlow</div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)] dark:bg-[linear-gradient(90deg,_#4C1D95_0%,_#1E1B4B_40%,_#020617_100%)]"
          >
            <LogIn className="h-4 w-4" />
            Wyloguj
          </Link>
        </div>
      </header>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="md:ml-72">
        <div
          className="h-[100px] w-full 
                     bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)] 
                     dark:bg-[linear-gradient(90deg,_#4C1D95_0%,_#1E1B4B_40%,_#020617_100%)]"
        />

        <div className="px-6 md:px-[88px] pt-6 pb-10">
          <div className="mt-8 md:mt-12 max-w-[645px]">
            <div>
              <h1 className="text-[26px] md:text-[32px] font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                🛠 Ustawienia konta
              </h1>
              <p className="text-slate-500 dark:text-slate-300 text-[14px] mt-1">
                Zarządzaj swoim profilem
              </p>
            </div>

            <div className="mt-6 bg-white dark:bg-itf-darkSurface rounded-2xl shadow-lg border border-slate-100 dark:border-itf-darkBorder p-6 space-y-6">
              <div className="flex flex-col space-y-2">
                <label className="font-medium text-slate-900 dark:text-white">Nazwa użytkownika</label>
                <input
                  type="text"
                  className="border border-slate-200 dark:border-itf-darkBorder rounded p-2 bg-white dark:bg-itf-darkCard text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/60"
                  value={editing ? profile.username : displayValue(profile.username)}
                  disabled={!editing}
                  onChange={(e) => handleChange("username", e.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1 flex flex-col space-y-2">
                  <label className="font-medium text-slate-900 dark:text-white">Imię</label>
                  <input
                    type="text"
                    className="border border-slate-200 dark:border-itf-darkBorder rounded p-2 bg-white dark:bg-itf-darkCard text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/60"
                    value={editing ? profile.firstName : displayValue(profile.firstName)}
                    disabled={!editing}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                  />
                </div>

                <div className="flex-1 flex flex-col space-y-2">
                  <label className="font-medium text-slate-900 dark:text-white">Nazwisko</label>
                  <input
                    type="text"
                    className="border border-slate-200 dark:border-itf-darkBorder rounded p-2 bg-white dark:bg-itf-darkCard text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/60"
                    value={editing ? profile.lastName : displayValue(profile.lastName)}
                    disabled={!editing}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <label className="font-medium text-slate-900 dark:text-white">Email</label>
                <input
                  type="email"
                  className="border border-slate-200 dark:border-itf-darkBorder rounded p-2 bg-white dark:bg-itf-darkCard text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/60"
                  value={editing ? profile.email : displayValue(profile.email)}
                  disabled={!editing}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="font-medium text-slate-900 dark:text-white">Firma</label>
                <input
                  type="text"
                  className="border border-slate-200 dark:border-itf-darkBorder rounded p-2 bg-white dark:bg-itf-darkCard text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/60"
                  value={editing ? profile.company : displayValue(profile.company)}
                  disabled={!editing}
                  onChange={(e) => handleChange("company", e.target.value)}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="font-medium text-slate-900 dark:text-white">Nowe hasło</label>
                <input
                  type="password"
                  className="border border-slate-200 dark:border-itf-darkBorder rounded p-2 bg-white dark:bg-itf-darkCard text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/60"
                  value={profile.password}
                  disabled={!editing}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Wpisz nowe hasło"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="font-medium text-slate-900 dark:text-white">Powtórz nowe hasło</label>
                <input
                  type="password"
                  className="border border-slate-200 dark:border-itf-darkBorder rounded p-2 bg-white dark:bg-itf-darkCard text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/60"
                  value={profile.passwordVerify}
                  disabled={!editing}
                  onChange={(e) => handleChange("passwordVerify", e.target.value)}
                  placeholder="Powtórz nowe hasło"
                />
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => (editing ? handleSave() : setEditing(true))}
                  className="px-8 py-3 font-semibold text-[14px] rounded-xl text-white shadow-md 
                             bg-[linear-gradient(90deg,_#8F2AFA_9%,_#5F7EFA_35%,_#2D19E9_100%)] 
                             dark:bg-[linear-gradient(90deg,_#4C1D95_0%,_#1E1B4B_40%,_#020617_100%)] 
                             hover:opacity-90 transition"
                >
                  {editing ? "Zapisz" : "Edytuj profil"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
