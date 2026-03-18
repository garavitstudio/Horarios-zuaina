"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Worker {
  id: string;
  name: string;
  position: string;
  scheduleType: "CONTINUOUS" | "SPLIT";
  weeklyHours: number;
  active: boolean;
}

const YEARS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 1 + i);

type Status = "idle" | "loading" | "ready" | "error";

export default function HorariosPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [search, setSearch] = useState("");
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [status, setStatus] = useState<Status>("idle");
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [zipFilename, setZipFilename] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/workers")
      .then((r) => r.json())
      .then((data) => setWorkers(Array.isArray(data) ? data.filter((w: Worker) => w.active) : []));
  }, []);

  const filtered = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.position.toLowerCase().includes(search.toLowerCase())
  );

  async function handleGenerate() {
    if (!selectedWorker) return;
    setStatus("loading");
    setZipBlob(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId: selectedWorker.id, year }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Error generando PDF");
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="(.+)"/);
      const fname = match ? match[1] : `horarios_${year}.zip`;

      setZipBlob(blob);
      setZipFilename(fname);
      setStatus("ready");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error desconocido");
      setStatus("error");
    }
  }

  function handleDownload() {
    if (!zipBlob) return;
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = zipFilename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen" style={{ background: "#F5F5F5" }}>
      <header style={{ background: "#E93A8A" }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/"
            className="p-1.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-white">Sacar horarios</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Buscador de trabajadores */}
        <div className="rounded-2xl p-6 shadow-sm" style={{ background: "white" }}>
          <h2 className="font-bold text-base mb-4" style={{ color: "#7A3FA0" }}>
            1. Selecciona trabajador/a
          </h2>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedWorker(null); setStatus("idle"); }}
            placeholder="Buscar por nombre o puesto..."
            className="w-full px-4 py-3 rounded-xl border text-sm mb-4"
            style={{ borderColor: "#D9D9D9", color: "#1F1A24" }}
          />
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-sm text-center py-4" style={{ color: "#9CA3AF" }}>
                No hay trabajadores activos
              </p>
            )}
            {filtered.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => { setSelectedWorker(w); setStatus("idle"); setZipBlob(null); }}
                className="w-full text-left px-4 py-3 rounded-xl border transition-all"
                style={{
                  borderColor: selectedWorker?.id === w.id ? "#E93A8A" : "#D9D9D9",
                  background: selectedWorker?.id === w.id ? "#FCE4F0" : "white",
                }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#1F1A24" }}>{w.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{w.position}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full"
                    style={{
                      background: w.scheduleType === "SPLIT" ? "#FCE4F0" : "#EEE0F8",
                      color: w.scheduleType === "SPLIT" ? "#E93A8A" : "#7A3FA0",
                    }}>
                    {w.scheduleType === "SPLIT" ? "Partido" : "Continuo"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selector de año */}
        <div className="rounded-2xl p-6 shadow-sm" style={{ background: "white" }}>
          <h2 className="font-bold text-base mb-4" style={{ color: "#7A3FA0" }}>
            2. Selecciona el año
          </h2>
          <div className="flex flex-wrap gap-2">
            {YEARS.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => { setYear(y); setStatus("idle"); setZipBlob(null); }}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                style={{
                  background: year === y ? "#7A3FA0" : "#F5F5F5",
                  color: year === y ? "white" : "#6B7280",
                  border: `1px solid ${year === y ? "#7A3FA0" : "#D9D9D9"}`,
                }}>
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* Generar */}
        <div className="rounded-2xl p-6 shadow-sm" style={{ background: "white" }}>
          <h2 className="font-bold text-base mb-4" style={{ color: "#7A3FA0" }}>
            3. Generar hojas de horario
          </h2>

          {selectedWorker ? (
            <div className="mb-4 p-4 rounded-xl" style={{ background: "#F5F5F5" }}>
              <p className="text-sm font-medium" style={{ color: "#1F1A24" }}>
                📋 {selectedWorker.name} · {year}
              </p>
              <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
                Se generarán 12 PDFs mensuales en un archivo ZIP
              </p>
            </div>
          ) : (
            <p className="text-sm mb-4" style={{ color: "#9CA3AF" }}>
              Selecciona un trabajador/a primero
            </p>
          )}

          {status === "idle" && (
            <button
              onClick={handleGenerate}
              disabled={!selectedWorker}
              className="w-full py-4 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: selectedWorker ? "#E93A8A" : "#D9D9D9",
                color: "white",
                cursor: selectedWorker ? "pointer" : "not-allowed",
              }}>
              Generar hojas de horario
            </button>
          )}

          {status === "loading" && (
            <div className="text-center py-6">
              <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-3"
                style={{ borderColor: "#EEE0F8", borderTopColor: "#7A3FA0" }} />
              <p className="font-medium text-sm" style={{ color: "#7A3FA0" }}>
                Generando 12 PDFs...
              </p>
              <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>
                Esto puede tardar unos segundos
              </p>
            </div>
          )}

          {status === "ready" && (
            <div className="text-center py-4 animate-fade-in">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: "#D6EAF7" }}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#18A7E0" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-semibold text-sm mb-1" style={{ color: "#1F1A24" }}>
                ¡PDFs generados correctamente!
              </p>
              <p className="text-xs mb-4" style={{ color: "#6B7280" }}>
                12 hojas mensuales listas para descargar
              </p>
              <button
                onClick={handleDownload}
                className="w-full py-4 rounded-xl font-bold text-sm text-white transition-all"
                style={{ background: "#18A7E0" }}>
                ⬇️ Descargar ZIP ({zipFilename})
              </button>
              <button
                onClick={() => { setStatus("idle"); setZipBlob(null); }}
                className="w-full mt-2 py-2.5 rounded-xl text-sm"
                style={{ color: "#6B7280" }}>
                Generar otro
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-4">
              <p className="text-sm mb-3" style={{ color: "#DC2626" }}>{errorMsg}</p>
              <button
                onClick={() => setStatus("idle")}
                className="px-6 py-2.5 rounded-xl text-sm border"
                style={{ borderColor: "#D9D9D9" }}>
                Reintentar
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
