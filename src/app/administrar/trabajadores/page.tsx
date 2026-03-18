"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SCHEDULE_TYPE_LABELS } from "@/types";

interface Worker {
  id: string;
  name: string;
  position: string;
  scheduleType: "CONTINUOUS" | "SPLIT";
  weeklyHours: number;
  active: boolean;
  notes?: string;
}

export default function AdministrarTrabajadoresPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchWorkers();
  }, []);

  async function fetchWorkers() {
    setLoading(true);
    const res = await fetch("/api/workers");
    const data = await res.json();
    setWorkers(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function toggleActive(w: Worker) {
    setTogglingId(w.id);
    await fetch(`/api/workers/${w.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !w.active }),
    });
    await fetchWorkers();
    setTogglingId(null);
  }

  const filtered = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.position.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen" style={{ background: "#F5F5F5" }}>
      <header style={{ background: "#7A3FA0" }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/administrar"
            className="p-1.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-white">Trabajadores</h1>
          <div className="ml-auto">
            <Link href="/trabajadores/nuevo"
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors"
              style={{ background: "#F2EA00", color: "#1F1A24" }}>
              + Añadir
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar trabajador..."
          className="w-full px-4 py-3 rounded-xl border text-sm mb-5"
          style={{ borderColor: "#D9D9D9", background: "white", color: "#1F1A24" }}
        />

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 rounded-2xl" style={{ background: "white" }}>
            <p style={{ color: "#9CA3AF" }}>No hay trabajadores registrados</p>
            <Link href="/trabajadores/nuevo"
              className="inline-block mt-4 px-5 py-2.5 rounded-xl font-semibold text-sm text-white"
              style={{ background: "#7A3FA0" }}>
              Añadir el primero
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((w) => (
              <div key={w.id}
                className="rounded-2xl p-5 shadow-sm border animate-fade-in"
                style={{
                  background: "white",
                  borderColor: w.active ? "#D9D9D9" : "#F5F5F5",
                  opacity: w.active ? 1 : 0.7,
                }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm" style={{ color: "#1F1A24" }}>
                        {w.name}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: w.active ? "#DCFCE7" : "#F5F5F5",
                          color: w.active ? "#16A34A" : "#9CA3AF",
                        }}>
                        {w.active ? "Activo/a" : "Inactivo/a"}
                      </span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                      {w.position} · {SCHEDULE_TYPE_LABELS[w.scheduleType]} · {w.weeklyHours}h/semana
                    </p>
                    {w.notes && (
                      <p className="text-xs mt-1 italic" style={{ color: "#9CA3AF" }}>{w.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Toggle activo */}
                    <button
                      onClick={() => toggleActive(w)}
                      disabled={togglingId === w.id}
                      className="relative w-10 h-5 rounded-full transition-colors"
                      style={{ background: w.active ? "#7A3FA0" : "#D9D9D9" }}
                      title={w.active ? "Desactivar" : "Activar"}>
                      <div
                        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform"
                        style={{ transform: w.active ? "translateX(22px)" : "translateX(2px)" }}
                      />
                    </button>

                    {/* Editar */}
                    <Link
                      href={`/administrar/trabajadores/${w.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                      style={{ borderColor: "#D9D9D9", color: "#6B7280" }}>
                      Editar
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
