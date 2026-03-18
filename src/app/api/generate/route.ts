import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateMonthEntries } from "@/lib/schedule";
import { generateContinuousPdf } from "@/lib/pdf/generateContinuousPdf";
import { generateSplitPdf } from "@/lib/pdf/generateSplitPdf";
import { DayScheduleData, HolidayData } from "@/types";
import JSZip from "jszip";

export const dynamic = "force-dynamic";


function sanitizeFilename(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar tildes
    .replace(/[^a-zA-Z0-9_\- ]/g, "")
    .trim()
    .replace(/\s+/g, "_");
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { workerId, year } = await req.json();
    if (!workerId || !year) {
      return NextResponse.json({ error: "Faltan workerId o year" }, { status: 400 });
    }

    const yearNum = parseInt(String(year));

    // Obtener trabajador con su horario
    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
      include: { daySchedules: true },
    });

    if (!worker) {
      return NextResponse.json({ error: "Trabajador no encontrado" }, { status: 404 });
    }

    // Obtener festivos del año
    const rawHolidays = await prisma.holiday.findMany({
      where: { year: yearNum },
    });

    const holidayData: HolidayData[] = rawHolidays.map((h) => ({
      id: h.id,
      date: h.date,
      name: h.name,
      year: h.year,
    }));

    // Mapear daySchedules al tipo correcto DayScheduleData
    const dayScheduleData: DayScheduleData[] = worker.daySchedules.map((ds) => ({
      dayOfWeek: ds.dayOfWeek,
      works: ds.works,
      start1: ds.start1 ?? undefined,
      end1: ds.end1 ?? undefined,
      start2: ds.start2 ?? undefined,
      end2: ds.end2 ?? undefined,
    }));

    const zip = new JSZip();
    const workerFilename = sanitizeFilename(worker.name);

    // Generar los 12 PDFs
    for (let month = 1; month <= 12; month++) {
      const { entries, totalHours } = generateMonthEntries(
        yearNum,
        month,
        dayScheduleData,
        holidayData
      );

      let pdfBytes: Uint8Array;
      if (worker.scheduleType === "SPLIT") {
        pdfBytes = await generateSplitPdf(worker.name, worker.position, yearNum, month, entries, totalHours);
      } else {
        pdfBytes = await generateContinuousPdf(worker.name, worker.position, yearNum, month, entries, totalHours);
      }

      const monthStr = String(month).padStart(2, "0");
      const filename = `${yearNum}-${monthStr}_${workerFilename}.pdf`;
      zip.file(filename, Buffer.from(pdfBytes));
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    const zipFilename = `horarios_${yearNum}_${workerFilename}.zip`;

    return new NextResponse(zipBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFilename}"`,
        "Content-Length": String(zipBuffer.length),
      },
    });
  } catch (error) {
    console.error("Error generando ZIP:", error);
    return NextResponse.json({ error: "Error al generar los PDFs" }, { status: 500 });
  }
}
