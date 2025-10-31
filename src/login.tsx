import { useState } from "react";
import { LogIn, Mail, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* 🔹 Динамічний фон */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-blue-500 to-indigo-600 bg-[length:400%_400%] animate-gradient animate-gradient-xy z-0" />

      <div className="relative w-full max-w-2xl bg-white/20 backdrop-blur-md p-12 rounded-3xl shadow-xl border border-white/30 z-10">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-white">Zaloguj się do ITFlow</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-medium text-white/90 mb-2">Email</label>
            <div className="flex items-center gap-3 border border-white/40 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500 bg-white/10">
              <Mail className="h-6 w-6 text-white/70" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Twój email"
                required
                className="w-full outline-none text-white text-lg bg-transparent placeholder-white/70"
              />
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium text-white/90 mb-2">Hasło</label>
            <div className="flex items-center gap-3 border border-white/40 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-indigo-500 bg-white/10">
              <Lock className="h-6 w-6 text-white/70" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Twoje hasło"
                required
                className="w-full outline-none text-white text-lg bg-transparent placeholder-white/70"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-violet-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:opacity-90 transition text-lg"
          >
            <LogIn className="h-6 w-6" /> Zaloguj
          </button>
        </form>

        <div className="mt-6 text-lg text-center text-white/80">
          Nie masz konta? <a href="/register" className="text-white font-medium underline">Załóż konto</a>
        </div>
      </div>
    </div>
  );
}
