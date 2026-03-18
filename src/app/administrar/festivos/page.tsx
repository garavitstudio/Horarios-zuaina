"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Holiday {
  id: string;
  date: string;
  name: string;
  year: number;
}

const currentYear = new Date().getFullYear();

export default function AdministrarFestivosPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [year, setYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);

  // Modal estado
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formDate, setFormDate] = useState("");
  const [formName, setFormName] = useState("");
  const [formYear, setFormYear] = useState(currentYear);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchHolidays();
  }, [year]);

  async function fetchHolidays() {
    setLoading(true);
    const res = await fetch(`/api/holidays?year=${year}`);
    const data = await res.json();
    setHolidays(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function openNew() {
    setEditingId(null);
    setFormDate("");
    setFormName("");
    setFormYear(year);
    setErrorMsg("");
    setModalOpen(true);
  }

  function openEdit(h: Holiday) {
    setEditingId(h.id);
    setFormDate(h.date.slice(0, 10));
    setFormName(h.name);
    setFormYear(h.year);
    setErrorMsg("");
    setModalOpen(true);
  }

  async function handleSave() {
    if (!formDate || !formName) {
      setErrorMsg("Fecha y nombre son obligatorios");
      return;
    }
    setSaving(true);
    setErrorMsg("");
    try {
      if (editingId) {
        const res = await fetch(`/api/holidays/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: formDate, name: formName, year: formYear }),
        });
        if (!res.ok) throw new Error("Error al actualizar");
      } else {
        const res = await fetch("/api/holidays", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: formDate, name: formName, year: formYear }),
        });
        if (!res.ok) throw new Error("Error al crear");
      }
      setModalOpen(false);
      fetchHolidays();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este festivo?")) return;
    await fetch(`/api/holidays/${id}`, { method: "DELETE" });
    fetchHolidays();
  }

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);

  return (
    <div className="min-h-screen" style={{ background: "#F5F5F5" }}>
      <header style={{ background: "#18A7E0" }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/administrar"
            className="p-1.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-white">Festivos</h1>
          <div className="ml-auto">
            <button onClick={openNew}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm"
              style={{ background: "#F2EA00", color: "#1F1A24" }}>
              + Añadir festivo
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Selector de año */}
        <div className="flex flex-wrap gap-2 mb-6">
          {years.map((y) => (
            <button key={y} onClick={() => setYear(y)}
              className="px-4 py-2 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: year === y ? "#18A7E0" : "white",
                color: year === y ? "white" : "#6B7280",
                border: `1px solid ${year === y ? "#18A7E0" : "#D9D9D9"}`,
              }}>
              {y}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 rounded-full animate-spin mx-auto"
              style={{ borderColor: "#D6EAF7", borderTopColor: "#18A7E0" }} />
          </div>
        ) : holidays.length === 0 ? (
          <div className="text-center py-12 rounded-2xl" style={{ background: "white" }}>
            <p className="text-sm mb-4" style={{ color: "#9CA3AF" }}>
              No hay festivos configurados para {year}
            </p>
            <button onClick={openNew}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white"
              style={{ background: "#18A7E0" }}>
              Añadir el primero
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {holidays.map((h) => {
              const d = new Date(h.date + "T12:00:00");
              const dateStr = d.toLocaleDateString("es-ES", { day: "2-digit", month: "long" });
              const dayName = d.toLocaleDateString("es-ES", { weekday: "long" });
              return (
                <div key={h.id}
                  className="flex items-center justify-between px-4 py-3.5 rounded-xl border bg-white animate-fade-in"
                  style={{ borderColor: "#D9D9D9" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "#D6EAF7" }}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#18A7E0" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "#1F1A24" }}>{h.name}</p>
                      <p className="text-xs capitalize mt-0.5" style={{ color: "#6B7280" }}>
                        {dayName}, {dateStr} de {year}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(h)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border"
                      style={{ borderColor: "#D9D9D9", color: "#6B7280" }}>
                      Editar
                    </button>
                    <button onClick={() => handleDelete(h.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{ background: "#FEE2E2", color: "#DC2626" }}>
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ background: "rgba(0,0,0,0.4)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-xl animate-fade-in" style={{ background: "white" }}>
            <h3 className="font-bold text-lg mb-5" style={{ color: "#7A3FA0" }}>
              {editingId ? "Editar festivo" : "Nuevo festivo"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#1F1A24" }}>Fecha *</label>
                <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#D9D9D9", color: "#1F1A24" }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#1F1A24" }}>Nombre del festivo *</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: Día de Canarias"
                  className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#D9D9D9", color: "#1F1A24" }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#1F1A24" }}>Año</label>
                <select value={formYear} onChange={(e) => setFormYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#D9D9D9", color: "#1F1A24" }}>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              {errorMsg && (
                <div className="px-3 py-2 rounded-lg text-xs" style={{ background: "#FEE2E2", color: "#DC2626" }}>{errorMsg}</div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border text-sm font-medium"
                style={{ borderColor: "#D9D9D9", color: "#6B7280" }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: saving ? "#D9D9D9" : "#18A7E0" }}>
                {saving ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</>
                ) : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
