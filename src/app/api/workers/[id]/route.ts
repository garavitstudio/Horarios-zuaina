import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";


export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  try {
    const worker = await prisma.worker.findUnique({
      where: { id },
      include: { daySchedules: { orderBy: { dayOfWeek: "asc" } } },
    });
    if (!worker) return NextResponse.json({ error: "Trabajador no encontrado" }, { status: 404 });
    return NextResponse.json(worker);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener trabajador" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const { name, position, scheduleType, weeklyHours, startDate, active, notes, daySchedules } = body;

    // Actualizar datos del trabajador y reemplazar todos los horarios
    await prisma.daySchedule.deleteMany({ where: { workerId: id } });

    const worker = await prisma.worker.update({
      where: { id },
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

    return NextResponse.json(worker);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al actualizar trabajador" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  try {
    const { active } = await req.json();
    const worker = await prisma.worker.update({
      where: { id },
      data: { active },
    });
    return NextResponse.json(worker);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al actualizar estado" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.worker.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al eliminar trabajador" }, { status: 500 });
  }
}
