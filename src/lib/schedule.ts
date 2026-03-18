import { DayScheduleData, HolidayData, MONTH_NAMES_ES } from "@/types";

/**
 * Convierte "HH:MM" a número de horas decimales.
 * Ej: "09:30" → 9.5
 */
export function timeToHours(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h + m / 60;
}

/**
 * Calcula las horas trabajadas en un tramo (end - start).
 */
function tramo(start?: string, end?: string): number {
  if (!start || !end) return 0;
  const s = timeToHours(start);
  const e = timeToHours(end);
  return Math.max(0, e - s);
}

/**
 * Formato de horas al estilo de la hoja: "5,00 h"
 */
export function formatHours(h: number): string {
  const hStr = h.toFixed(2).replace(".", ",");
  return `${hStr} h`;
}

/**
 * Formatea una fecha como "dd/MM/yyyy" en español.
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Devuelve el nombre del día de la semana en español (Lunes, Martes...).
 * JS: 0=Domingo, 1=Lunes...  
 * Nuestra convención: 0=Lunes, 1=Martes..., 6=Domingo
 */
export function getDayNameES(date: Date): string {
  const names = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  return names[date.getDay()];
}

/**
 * Convierte el día JS (0=Domingo, 1=Lunes...) a nuestra convención (0=Lunes..., 6=Domingo).
 */
export function jsWeekdayToOur(jsDay: number): number {
  // JS: 0=Dom, 1=Lun, 2=Mar, 3=Mie, 4=Jue, 5=Vie, 6=Sab
  // Our: 0=Lun, 1=Mar, 2=Mie, 3=Jue, 4=Vie, 5=Sab, 6=Dom
  return jsDay === 0 ? 6 : jsDay - 1;
}

export interface DayEntry {
  date: Date;
  dateStr: string;    // dd/MM/YYYY
  dayName: string;    // "Lunes"
  isHoliday: boolean;
  holidayName?: string;
  isWeekend: boolean;
  works: boolean;     // según horario del trabajador
  start1?: string;
  end1?: string;
  start2?: string;
  end2?: string;
  totalHours: number;
  isBlue: boolean;    // festivo, fin de semana no laborable, o no trabajado
}

/**
 * Genera todas las entradas del mes para un trabajador.
 * @param year - Año
 * @param month - Mes (1-12)
 * @param daySchedules - Horario semanal del trabajador
 * @param holidays - Festivos del año
 */
export function generateMonthEntries(
  year: number,
  month: number,
  daySchedules: DayScheduleData[],
  holidays: HolidayData[]
): { entries: DayEntry[]; totalHours: number } {
  // Crear un Set de fechas festivas para este mes (en formato YYYY-MM-DD)
  const holidaySet = new Set<string>();
  const holidayMap = new Map<string, string>();

  for (const h of holidays) {
    const d = new Date(h.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    holidaySet.add(key);
    holidayMap.set(key, h.name);
  }

  // Crear un mapa de horario por día de semana
  const scheduleMap = new Map<number, DayScheduleData>();
  for (const ds of daySchedules) {
    scheduleMap.set(ds.dayOfWeek, ds);
  }

  const entries: DayEntry[] = [];
  let totalHours = 0;

  // Iterar cada día del mes
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const jsWeekday = date.getDay(); // 0=Dom, 1=Lun...
    const ourWeekday = jsWeekdayToOur(jsWeekday);
    const isWeekend = jsWeekday === 0 || jsWeekday === 6;
    const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const isHoliday = holidaySet.has(dateKey);
    const holidayName = holidayMap.get(dateKey);
    const schedule = scheduleMap.get(ourWeekday);
    const worksDay = schedule?.works === true;

    let start1: string | undefined;
    let end1: string | undefined;
    let start2: string | undefined;
    let end2: string | undefined;
    let dayHours = 0;

    if (worksDay && !isHoliday) {
      start1 = schedule?.start1 ?? undefined;
      end1 = schedule?.end1 ?? undefined;
      start2 = schedule?.start2 ?? undefined;
      end2 = schedule?.end2 ?? undefined;
      dayHours = tramo(start1, end1) + tramo(start2, end2);
      totalHours += dayHours;
    }

    // Es azul si: es festivo, fin de semana no trabajado, o día no laborable para ese trabajador
    const isBlue = isHoliday || !worksDay || (isWeekend && !worksDay);

    entries.push({
      date,
      dateStr: formatDate(date),
      dayName: getDayNameES(date),
      isHoliday,
      holidayName,
      isWeekend,
      works: worksDay && !isHoliday,
      start1,
      end1,
      start2,
      end2,
      totalHours: dayHours,
      isBlue,
    });
  }

  return { entries, totalHours };
}

/**
 * Último día del mes formateado en español para el pie del PDF.
 * Ej: "31 de enero de 2027"
 */
export function lastDayOfMonthES(year: number, month: number): string {
  const daysInMonth = new Date(year, month, 0).getDate();
  return `${daysInMonth} de ${MONTH_NAMES_ES[month - 1].toLowerCase()} de ${year}`;
}
