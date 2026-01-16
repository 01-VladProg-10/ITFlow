import React, { useState } from "react";
import { LogIn, UserPlus, Mail, Lock } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { loginUser, fetchMe, registerUser } from "./api/users.ts";

export default function AuthDualPanel() {
 

const [search] = useSearchParams();
const initialMode = search.get("mode") === "register" ? "register" : "login";
const [mode, setMode] = useState<"login" | "register">(initialMode);


  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regUsername, setRegUsername] = useState("");
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPasswordVerify, setRegPasswordVerify] = useState("");

  

  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginUser(loginUsername, loginPassword);
      const me = await fetchMe();
      console.log("Zalogowany użytkownik:", me);

      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      alert("Nie udało się zalogować: " + (err.message || "Błąd"));
    }
  };


  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regPasswordVerify) {
      alert("Hasła nie są takie same!");
      return;
    }

    try {
      await registerUser({
        username: regUsername,
        email: regEmail,
        first_name: regFirstName,
        last_name: regLastName,
        password: regPassword,
      });

      alert("Konto zostało utworzone. Możesz się teraz zalogować.");
      setMode("login");
      // Opcjonalnie wstawiamy login z rejestracji do pola logowania
      setLoginUsername(regUsername);
      setLoginPassword("");
    } catch (err: any) {
      alert("Nie udało się zarejestrować: " + (err.message || "Błąd"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-6">
      {/* background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-blue-500 to-indigo-600 bg-[length:400%_400%] animate-gradient z-0" />

      <div className="relative z-10 w-full max-w-4xl">
        <div className="mx-auto bg-transparent rounded-3xl p-1">
          <div className="relative overflow-hidden rounded-3xl" style={{ minHeight: 520 }}>
            <div
              className="flex w-[200%] transition-transform duration-600 ease-in-out"
              style={{ transform: mode === "login" ? "translateX(0%)" : "translateX(-50%)" }}
            >

              {/* LEFT PANEL - LOGIN */}
              <section className="w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-lg border border-white/20">
                  <h2 className="text-3xl font-bold text-white text-center mb-6">
                    Zaloguj się do ITFlow
                  </h2>

                  <form onSubmit={handleLoginSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">Username</label>
                      <div className="flex items-center gap-3 border border-white/30 rounded-2xl px-4 py-3 bg-white/6 focus-within:ring-2 focus-within:ring-indigo-400">
                        <Mail className="h-5 w-5 text-white/70" />
                        <input
                          type="username"
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          placeholder="Twój username"
                          required
                          className="w-full bg-transparent outline-none text-white placeholder-white/70 text-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">Hasło</label>
                      <div className="flex items-center gap-3 border border-white/30 rounded-2xl px-4 py-3 bg-white/6 focus-within:ring-2 focus-within:ring-indigo-400">
                        <Lock className="h-5 w-5 text-white/70" />
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Twoje hasło"
                          required
                          className="w-full bg-transparent outline-none text-white placeholder-white/70 text-lg"
                        />
                      </div>
                    </div>

                    {/* BUTTON — gradient shift A */}
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-3 
                      bg-gradient-to-r from-violet-500 to-blue-500 
                      bg-[length:200%_200%] hover:bg-right 
                      text-white font-semibold py-3 px-6 rounded-2xl 
                      shadow-lg hover:shadow-xl 
                      transition-all duration-300 text-lg cursor-pointer"
                    >
                      <LogIn className="h-5 w-5" /> Zaloguj
                    </button>
                  </form>

                  <div className="mt-6 text-center text-white/80 text-base">
                    Nie masz konta?{" "}
                    <button
                      onClick={() => setMode("register")}
                      className="text-white font-medium underline-offset-4 hover:underline hover:text-white/60 transition cursor-pointer"
                    >
                      Załóż konto
                    </button>
                  </div>
                </div>
              </section>

              {/* RIGHT PANEL - REGISTER */}
              <section className="w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-lg border border-white/20">
                  <h2 className="text-3xl font-bold text-white text-center mb-6">
                    Zarejestruj się w ITFlow
                  </h2>

                  <form onSubmit={handleRegisterSubmit} className="space-y-5">
  <div>
    <label className="block text-sm font-medium text-white/90 mb-2">Username</label>
    <input
      type="text"
      value={regUsername}
      onChange={(e) => setRegUsername(e.target.value)}
      placeholder="Twój username"
      required
      className="w-full bg-transparent outline-none text-white placeholder-white/70 text-lg px-4 py-3 border border-white/30 rounded-2xl"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-white/90 mb-2">Imię</label>
    <input
      type="text"
      value={regFirstName}
      onChange={(e) => setRegFirstName(e.target.value)}
      placeholder="Twoje imię"
      required
      className="w-full bg-transparent outline-none text-white placeholder-white/70 text-lg px-4 py-3 border border-white/30 rounded-2xl"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-white/90 mb-2">Nazwisko</label>
    <input
      type="text"
      value={regLastName}
      onChange={(e) => setRegLastName(e.target.value)}
      placeholder="Twoje nazwisko"
      required
      className="w-full bg-transparent outline-none text-white placeholder-white/70 text-lg px-4 py-3 border border-white/30 rounded-2xl"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-white/90 mb-2">Email</label>
    <input
      type="email"
      value={regEmail}
      onChange={(e) => setRegEmail(e.target.value)}
      placeholder="Twój email"
      required
      className="w-full bg-transparent outline-none text-white placeholder-white/70 text-lg px-4 py-3 border border-white/30 rounded-2xl"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-white/90 mb-2">Hasło</label>
    <input
      type="password"
      value={regPassword}
      onChange={(e) => setRegPassword(e.target.value)}
      placeholder="Twoje hasło"
      required
      className="w-full bg-transparent outline-none text-white placeholder-white/70 text-lg px-4 py-3 border border-white/30 rounded-2xl"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-white/90 mb-2">Potwierdź hasło</label>
    <input
      type="password"
      value={regPasswordVerify}
      onChange={(e) => setRegPasswordVerify(e.target.value)}
      placeholder="Powtórz hasło"
      required
      className="w-full bg-transparent outline-none text-white placeholder-white/70 text-lg px-4 py-3 border border-white/30 rounded-2xl"
    />
  </div>

  <button
    type="submit"
    className="w-full flex items-center justify-center gap-3 
      bg-gradient-to-r from-violet-500 to-blue-500 
      bg-[length:200%_200%] hover:bg-right 
      text-white font-semibold py-3 px-6 rounded-2xl 
      shadow-lg hover:shadow-xl 
      transition-all duration-300 text-lg cursor-pointer"
  >
    <UserPlus className="h-5 w-5" /> Zarejestruj
  </button>
</form>


                  <div className="mt-6 text-center text-white/80 text-base">
                    Masz już konto?{" "}
                    <button
                      onClick={() => setMode("login")}
                      className="text-white font-medium underline-offset-4 hover:underline hover:text-white/60 transition cursor-pointer"
                    >
                      Zaloguj
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* indicators */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
              <button
                className={`w-3 h-3 rounded-full ${mode === "login" ? "bg-white" : "bg-white/40"} cursor-pointer`}
                aria-label="Login panel"
                onClick={() => setMode("login")}
              />
              <button
                className={`w-3 h-3 rounded-full ${mode === "register" ? "bg-white" : "bg-white/40"} cursor-pointer`}
                aria-label="Register panel"
                onClick={() => setMode("register")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
