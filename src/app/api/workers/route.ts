import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";


export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const workers = await prisma.worker.findMany({
      include: { daySchedules: { orderBy: { dayOfWeek: "asc" } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(workers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener trabajadores" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, position, scheduleType, weeklyHours, startDate, active, notes, daySchedules } = body;

    if (!name || !position || !scheduleType || weeklyHours === undefined) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const worker = await prisma.worker.create({
      data: {
        name: name.trim(),
        position: position.trim(),
        scheduleType,
        weeklyHours: parseFloat(weeklyHours),
        startDate: startDate ? new Date(startDate) : null,
        active: active !== false,
        notes: notes?.trim() || null,
        daySchedules: {
          create: (daySchedules ?? []).map((ds: { dayOfWeek: number; works: boolean; start1?: string; end1?: string; start2?: string; end2?: string }) => ({
            dayOfWeek: ds.dayOfWeek,
            works: ds.works,
            start1: ds.start1 || null,
            end1: ds.end1 || null,
            start2: ds.start2 || null,
            end2: ds.end2 || null,
          })),
        },
      },
      include: { daySchedules: true },
    });

    return NextResponse.json(worker, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear trabajador" }, { status: 500 });
  }
}
