import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";


export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  try {
    const { date, name, year } = await req.json();
    const holiday = await prisma.holiday.update({
      where: { id },
      data: {
        date: new Date(date),
        name: name.trim(),
        year: parseInt(year),
      },
    });
    return NextResponse.json(holiday);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al actualizar festivo" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.holiday.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al eliminar festivo" }, { status: 500 });
  }
}
