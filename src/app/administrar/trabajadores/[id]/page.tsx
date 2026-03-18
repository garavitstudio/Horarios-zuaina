"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DAY_NAMES_ES } from "@/types";

interface DayScheduleForm {
  dayOfWeek: number;
  works: boolean;
  start1: string;
  end1: string;
  start2: string;
  end2: string;
}

interface Worker {
  id: string;
  name: string;
  position: string;
  scheduleType: "CONTINUOUS" | "SPLIT";
  weeklyHours: number;
  startDate: string | null;
  active: boolean;
  notes: string | null;
  daySchedules: {
    dayOfWeek: number;
    works: boolean;
    start1: string | null;
    end1: string | null;
    start2: string | null;
    end2: string | null;
  }[];
}

export default function EditarTrabajadorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [scheduleType, setScheduleType] = useState<"CONTINUOUS" | "SPLIT">("CONTINUOUS");
  const [weeklyHours, setWeeklyHours] = useState("");
  const [startDate, setStartDate] = useState("");
  const [active, setActive] = useState(true);
  const [notes, setNotes] = useState("");
  const [daySchedules, setDaySchedules] = useState<DayScheduleForm[]>([]);

  useEffect(() => {
    fetch(`/api/workers/${id}`)
      .then((r) => r.json())
      .then((w: Worker) => {
        setName(w.name);
        setPosition(w.position);
        setScheduleType(w.scheduleType);
        setWeeklyHours(String(w.weeklyHours));
        setStartDate(w.startDate ? w.startDate.slice(0, 10) : "");
        setActive(w.active);
        setNotes(w.notes ?? "");

        // Construir horario semanal completo
        const schedules: DayScheduleForm[] = DAY_NAMES_ES.map((_, i) => {
          const ds = w.daySchedules.find((d) => d.dayOfWeek === i);
          return {
            dayOfWeek: i,
            works: ds?.works ?? false,
            start1: ds?.start1 ?? "",
            end1: ds?.end1 ?? "",
            start2: ds?.start2 ?? "",
            end2: ds?.end2 ?? "",
          };
        });
        setDaySchedules(schedules);
        setLoading(false);
      });
  }, [id]);

  function updateDay(i: number, field: keyof DayScheduleForm, value: string | boolean) {
    setDaySchedules((prev) =>
      prev.map((d, idx) => (idx === i ? { ...d, [field]: value } : d))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch(`/api/workers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, position, scheduleType, weeklyHours, startDate: startDate || null, active, notes, daySchedules }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Error al guardar");
      }

      setSuccess(true);
      setTimeout(() => router.push("/administrar/trabajadores"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5F5F5" }}>
        <div className="w-10 h-10 border-4 rounded-full animate-spin"
          style={{ borderColor: "#EEE0F8", borderTopColor: "#7A3FA0" }} />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5F5F5" }}>
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "#EEE0F8" }}>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#7A3FA0" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold" style={{ color: "#1F1A24" }}>¡Guardado correctamente!</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F5F5F5" }}>
      <header style={{ background: "#7A3FA0" }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/administrar/trabajadores"
            className="p-1.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-white">Editar trabajador/a</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl p-6 shadow-sm" style={{ background: "white" }}>
            <h2 className="font-bold text-base mb-5" style={{ color: "#7A3FA0" }}>📋 Datos del trabajador/a</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#1F1A24" }}>Nombre completo *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#D9D9D9", color: "#1F1A24" }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#1F1A24" }}>Puesto *</label>
                <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} required
                  className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#D9D9D9", color: "#1F1A24" }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#1F1A24" }}>Tipo de horario *</label>
                <select value={scheduleType} onChange={(e) => setScheduleType(e.target.value as "CONTINUOUS" | "SPLIT")}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#D9D9D9", color: "#1F1A24" }}>
                  <option value="CONTINUOUS">Continuo</option>
                  <option value="SPLIT">Partido</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#1F1A24" }}>Horas semanales *</label>
                <input type="number" value={weeklyHours} onChange={(e) => setWeeklyHours(e.target.value)} required min={1} max={40} step={0.5}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#D9D9D9", color: "#1F1A24" }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#1F1A24" }}>Fecha de alta</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#D9D9D9", color: "#1F1A24" }} />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative w-12 h-6 rounded-full transition-colors"
                    style={{ background: active ? "#7A3FA0" : "#D9D9D9" }}
                    onClick={() => setActive(!active)}>
                    <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform"
                      style={{ transform: active ? "translateX(26px)" : "translateX(2px)" }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: "#1F1A24" }}>{active ? "Activo/a" : "Inactivo/a"}</span>
                </label>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#1F1A24" }}>Observaciones</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none" style={{ borderColor: "#D9D9D9", color: "#1F1A24" }} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 shadow-sm" style={{ background: "white" }}>
            <h2 className="font-bold text-base mb-4" style={{ color: "#7A3FA0" }}>📅 Horario semanal</h2>
            <div className="space-y-3">
              {daySchedules.map((day, i) => (
                <div key={i} className="rounded-xl p-4 border transition-all"
                  style={{ borderColor: day.works ? "#7A3FA0" : "#D9D9D9", background: day.works ? "#FAFAFA" : "#F9F9F9" }}>
                  <div className="flex items-center gap-3 mb-3">
                    <button type="button" onClick={() => updateDay(i, "works", !day.works)}
                      className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
                      style={{ background: day.works ? "#7A3FA0" : "#D9D9D9" }}>
                      <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform"
                        style={{ transform: day.works ? "translateX(22px)" : "translateX(2px)" }} />
                    </button>
                    <span className="font-semibold text-sm" style={{ color: day.works ? "#7A3FA0" : "#9CA3AF", minWidth: "80px" }}>
                      {DAY_NAMES_ES[i]}
                    </span>
                    {!day.works && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#D6EAF7", color: "#18A7E0" }}>No laborable</span>}
                  </div>
                  {day.works && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pl-14">
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: "#6B7280" }}>
                          {scheduleType === "SPLIT" ? "Entrada mañana" : "Hora entrada"}
                        </label>
                        <input type="time" value={day.start1} onChange={(e) => updateDay(i, "start1", e.target.value)}
                          className="w-full px-2 py-2 rounded-lg border text-sm" style={{ borderColor: "#D9D9D9", color: "#1F1A24" }} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: "#6B7280" }}>
                          {scheduleType === "SPLIT" ? "Salida mañana" : "Hora salida"}
                        </label>
                        <input type="time" value={day.end1} onChange={(e) => updateDay(i, "end1", e.target.value)}
                          className="w-full px-2 py-2 rounded-lg border text-sm" style={{ borderColor: "#D9D9D9", color: "#1F1A24" }} />
                      </div>
                      {scheduleType === "SPLIT" && (
                        <>
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: "#E93A8A" }}>Entrada tarde</label>
                            <input type="time" value={day.start2} onChange={(e) => updateDay(i, "start2", e.target.value)}
                              className="w-full px-2 py-2 rounded-lg border text-sm" style={{ borderColor: "#E93A8A", color: "#1F1A24" }} />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: "#E93A8A" }}>Salida tarde</label>
                            <input type="time" value={day.end2} onChange={(e) => updateDay(i, "end2", e.target.value)}
                              className="w-full px-2 py-2 rounded-lg border text-sm" style={{ borderColor: "#E93A8A", color: "#1F1A24" }} />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "#FEE2E2", color: "#DC2626" }}>{error}</div>
          )}

          <div className="flex gap-3 pb-8">
            <Link href="/administrar/trabajadores"
              className="flex-1 py-3.5 rounded-xl font-medium text-sm text-center border"
              style={{ borderColor: "#D9D9D9", color: "#6B7280" }}>
              Cancelar
            </Link>
            <button type="submit" disabled={saving}
              className="flex-1 py-3.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
              style={{ background: saving ? "#D9D9D9" : "#7A3FA0" }}>
              {saving ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</>
              ) : "Guardar cambios"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
