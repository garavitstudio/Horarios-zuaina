"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Usuario o contraseña incorrectos. Inténtalo de nuevo.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #1F1A24 0%, #7A3FA0 50%, #1F1A24 100%)" }}>

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo / Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4"
            style={{ background: "#F2EA00" }}>
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="#1F1A24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Zuaina Horarios</h1>
          <p className="text-sm" style={{ color: "#D6EAF7" }}>
            Asociación Sociocultural La Vida es Zuaina
          </p>
        </div>

        {/* Tarjeta login */}
        <div className="rounded-2xl p-8 shadow-2xl" style={{ background: "white" }}>
          <h2 className="text-xl font-semibold mb-6" style={{ color: "#1F1A24" }}>
            Acceso al sistema
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#7A3FA0" }}>
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="Introduce tu usuario"
                className="w-full px-4 py-3 rounded-xl border text-sm transition-all"
                style={{
                  borderColor: "#D9D9D9",
                  outline: "none",
                  color: "#1F1A24",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#7A3FA0"; e.target.style.boxShadow = "0 0 0 3px #EEE0F8"; }}
                onBlur={(e) => { e.target.style.borderColor = "#D9D9D9"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#7A3FA0" }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Introduce tu contraseña"
                className="w-full px-4 py-3 rounded-xl border text-sm transition-all"
                style={{
                  borderColor: "#D9D9D9",
                  outline: "none",
                  color: "#1F1A24",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#7A3FA0"; e.target.style.boxShadow = "0 0 0 3px #EEE0F8"; }}
                onBlur={(e) => { e.target.style.borderColor = "#D9D9D9"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "#FEE2E2", color: "#DC2626" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
              style={{
                background: loading ? "#D9D9D9" : "#7A3FA0",
                color: "white",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => { if (!loading) (e.target as HTMLButtonElement).style.background = "#6a329a"; }}
              onMouseLeave={(e) => { if (!loading) (e.target as HTMLButtonElement).style.background = "#7A3FA0"; }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </>
              ) : "Entrar"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#D6EAF7", opacity: 0.6 }}>
          © {new Date().getFullYear()} Asociación La Vida es Zuaina
        </p>
      </div>
    </div>
  );
}
