import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";


export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const yearStr = searchParams.get("year");
  const year = yearStr ? parseInt(yearStr) : new Date().getFullYear();

  try {
    const holidays = await prisma.holiday.findMany({
      where: { year },
      orderBy: { date: "asc" },
    });
    return NextResponse.json(holidays);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener festivos" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { date, name, year } = await req.json();
    if (!date || !name || !year) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const holiday = await prisma.holiday.create({
      data: {
        date: new Date(date),
        name: name.trim(),
        year: parseInt(year),
      },
    });

    return NextResponse.json(holiday, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al crear festivo" }, { status: 500 });
  }
}
