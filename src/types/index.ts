import { ScheduleType } from "@prisma/client";

export type { ScheduleType };

export interface DayScheduleData {
  dayOfWeek: number; // 0=Lunes...6=Domingo
  works: boolean;
  start1?: string;
  end1?: string;
  start2?: string;
  end2?: string;
}

export interface WorkerWithSchedule {
  id: string;
  name: string;
  position: string;
  scheduleType: ScheduleType;
  weeklyHours: number;
  startDate?: Date | null;
  active: boolean;
  notes?: string | null;
  daySchedules: DayScheduleData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HolidayData {
  id: string;
  date: Date;
  name: string;
  year: number;
}

export const DAY_NAMES_ES = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export const MONTH_NAMES_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const SCHEDULE_TYPE_LABELS: Record<ScheduleType, string> = {
  CONTINUOUS: "Continuo",
  SPLIT: "Partido",
};
