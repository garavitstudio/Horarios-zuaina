import { PrismaClient, ScheduleType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // =====================
  // TRABAJADORA 1: Inmaculada (Continua)
  // =====================
  const inmaculada = await prisma.worker.upsert({
    where: { id: "worker-inmaculada" },
    update: {},
    create: {
      id: "worker-inmaculada",
      name: "Inmaculada Pencomena",
      position: "Monitora",
      scheduleType: ScheduleType.CONTINUOUS,
      weeklyHours: 8,
      active: true,
      notes: "Trabajadora a tiempo parcial",
      daySchedules: {
        create: [
          // Lunes (0) - no trabaja
          { dayOfWeek: 0, works: false },
          // Martes (1) - 09:00-14:00
          { dayOfWeek: 1, works: true, start1: "09:00", end1: "14:00" },
          // Miércoles (2) - no trabaja
          { dayOfWeek: 2, works: false },
          // Jueves (3) - no trabaja
          { dayOfWeek: 3, works: false },
          // Viernes (4) - 17:00-20:00
          { dayOfWeek: 4, works: true, start1: "17:00", end1: "20:00" },
          // Sábado (5) - no trabaja
          { dayOfWeek: 5, works: false },
          // Domingo (6) - no trabaja
          { dayOfWeek: 6, works: false },
        ],
      },
    },
  });

  console.log(`✅ Trabajadora creada: ${inmaculada.name}`);

  // =====================
  // TRABAJADOR 2: Carlos (Partido)
  // =====================
  const carlos = await prisma.worker.upsert({
    where: { id: "worker-carlos" },
    update: {},
    create: {
      id: "worker-carlos",
      name: "Carlos Rodríguez Pérez",
      position: "Coordinador",
      scheduleType: ScheduleType.SPLIT,
      weeklyHours: 35,
      active: true,
      notes: "Jornada partida mañana-tarde",
      daySchedules: {
        create: [
          // Lunes (0) - 09:00-13:00 / 16:00-18:00
          { dayOfWeek: 0, works: true, start1: "09:00", end1: "13:00", start2: "16:00", end2: "18:00" },
          // Martes (1) - 09:00-13:00 / 16:00-18:00
          { dayOfWeek: 1, works: true, start1: "09:00", end1: "13:00", start2: "16:00", end2: "18:00" },
          // Miércoles (2) - 09:00-13:00 / 16:00-18:00
          { dayOfWeek: 2, works: true, start1: "09:00", end1: "13:00", start2: "16:00", end2: "18:00" },
          // Jueves (3) - 09:00-13:00 / 16:00-18:00
          { dayOfWeek: 3, works: true, start1: "09:00", end1: "13:00", start2: "16:00", end2: "18:00" },
          // Viernes (4) - 09:00-13:00 / 16:00-18:00
          { dayOfWeek: 4, works: true, start1: "09:00", end1: "13:00", start2: "16:00", end2: "18:00" },
          // Sábado (5) - no trabaja
          { dayOfWeek: 5, works: false },
          // Domingo (6) - no trabaja
          { dayOfWeek: 6, works: false },
        ],
      },
    },
  });

  console.log(`✅ Trabajador creado: ${carlos.name}`);

  // =====================
  // FESTIVOS LANZAROTE 2025
  // =====================
  const festivos2025 = [
    { date: new Date("2025-01-01"), name: "Año Nuevo", year: 2025 },
    { date: new Date("2025-01-06"), name: "Reyes Magos", year: 2025 },
    { date: new Date("2025-02-28"), name: "Día de Canarias (trasladado)", year: 2025 },
    { date: new Date("2025-04-17"), name: "Jueves Santo", year: 2025 },
    { date: new Date("2025-04-18"), name: "Viernes Santo", year: 2025 },
    { date: new Date("2025-05-01"), name: "Día del Trabajo", year: 2025 },
    { date: new Date("2025-05-30"), name: "Día de Canarias", year: 2025 },
    { date: new Date("2025-08-15"), name: "Asunción de la Virgen", year: 2025 },
    { date: new Date("2025-09-08"), name: "Nuestra Señora de los Volcanes (Lanzarote)", year: 2025 },
    { date: new Date("2025-10-12"), name: "Día de la Hispanidad", year: 2025 },
    { date: new Date("2025-11-01"), name: "Todos los Santos", year: 2025 },
    { date: new Date("2025-12-06"), name: "Día de la Constitución", year: 2025 },
    { date: new Date("2025-12-08"), name: "Inmaculada Concepción", year: 2025 },
    { date: new Date("2025-12-25"), name: "Navidad", year: 2025 },
  ];

  // FESTIVOS LANZAROTE 2026
  const festivos2026 = [
    { date: new Date("2026-01-01"), name: "Año Nuevo", year: 2026 },
    { date: new Date("2026-01-06"), name: "Reyes Magos", year: 2026 },
    { date: new Date("2026-04-02"), name: "Jueves Santo", year: 2026 },
    { date: new Date("2026-04-03"), name: "Viernes Santo", year: 2026 },
    { date: new Date("2026-05-01"), name: "Día del Trabajo", year: 2026 },
    { date: new Date("2026-05-30"), name: "Día de Canarias", year: 2026 },
    { date: new Date("2026-08-15"), name: "Asunción de la Virgen", year: 2026 },
    { date: new Date("2026-09-08"), name: "Nuestra Señora de los Volcanes (Lanzarote)", year: 2026 },
    { date: new Date("2026-10-12"), name: "Día de la Hispanidad", year: 2026 },
    { date: new Date("2026-11-01"), name: "Todos los Santos", year: 2026 },
    { date: new Date("2026-12-06"), name: "Día de la Constitución", year: 2026 },
    { date: new Date("2026-12-08"), name: "Inmaculada Concepción", year: 2026 },
    { date: new Date("2026-12-25"), name: "Navidad", year: 2026 },
  ];

  // FESTIVOS LANZAROTE 2027
  const festivos2027 = [
    { date: new Date("2027-01-01"), name: "Año Nuevo", year: 2027 },
    { date: new Date("2027-01-06"), name: "Reyes Magos", year: 2027 },
    { date: new Date("2027-03-25"), name: "Jueves Santo", year: 2027 },
    { date: new Date("2027-03-26"), name: "Viernes Santo", year: 2027 },
    { date: new Date("2027-05-01"), name: "Día del Trabajo", year: 2027 },
    { date: new Date("2027-05-30"), name: "Día de Canarias", year: 2027 },
    { date: new Date("2027-08-15"), name: "Asunción de la Virgen", year: 2027 },
    { date: new Date("2027-09-08"), name: "Nuestra Señora de los Volcanes (Lanzarote)", year: 2027 },
    { date: new Date("2027-10-12"), name: "Día de la Hispanidad", year: 2027 },
    { date: new Date("2027-11-01"), name: "Todos los Santos", year: 2027 },
    { date: new Date("2027-12-06"), name: "Día de la Constitución", year: 2027 },
    { date: new Date("2027-12-08"), name: "Inmaculada Concepción", year: 2027 },
    { date: new Date("2027-12-25"), name: "Navidad", year: 2027 },
  ];

  const allFestivos = [...festivos2025, ...festivos2026, ...festivos2027];

  for (const festivo of allFestivos) {
    await prisma.holiday.upsert({
      where: { date_year: { date: festivo.date, year: festivo.year } },
      update: { name: festivo.name },
      create: festivo,
    });
  }

  console.log(`✅ ${allFestivos.length} festivos creados (2025, 2026, 2027)`);
  console.log("🎉 Seed completado.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
