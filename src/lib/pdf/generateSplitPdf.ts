import {
  PDFDocument,
  PDFPage,
  rgb,
  StandardFonts,
  PDFFont,
  RGB,
} from "pdf-lib";
import { DayEntry, formatHours, lastDayOfMonthES } from "@/lib/schedule";
import { MONTH_NAMES_ES } from "@/types";
import fs from "fs";
import path from "path";

const COLOR = {
  purple:      rgb(0.478, 0.247, 0.627),
  yellow:      rgb(0.949, 0.918, 0.0),
  blueBg:      rgb(0.839, 0.918, 0.969),
  blueAccent:  rgb(0.094, 0.655, 0.878),
  dark:        rgb(0.122, 0.102, 0.141),
  gray:        rgb(0.85, 0.85, 0.85),
  white:       rgb(1, 1, 1),
  lightGray:   rgb(0.96, 0.96, 0.96),
  purpleLight: rgb(0.902, 0.847, 0.941),
};

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 28;

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  color: RGB = COLOR.dark,
  maxWidth?: number
) {
  let finalText = text;
  if (maxWidth) {
    while (finalText.length > 0 && font.widthOfTextAtSize(finalText, size) > maxWidth) {
      finalText = finalText.slice(0, -1);
    }
    if (finalText.length < text.length) finalText = finalText.slice(0, -1) + "…";
  }
  page.drawText(finalText, { x, y, size, font, color });
}

function drawRect(
  page: PDFPage, x: number, y: number, w: number, h: number,
  fillColor: RGB, borderColor?: RGB
) {
  page.drawRectangle({
    x, y, width: w, height: h, color: fillColor,
    borderColor, borderWidth: borderColor ? 0.5 : undefined,
  });
}

function drawHeader(
  page: PDFPage, boldFont: PDFFont, regularFont: PDFFont,
  workerName: string, position: string, year: number, month: number
) {
  const monthName = MONTH_NAMES_ES[month - 1];
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;

  drawRect(page, 0, PAGE_H - 56, PAGE_W, 56, COLOR.purple);
  drawText(page, "Registro de jornada laboral", MARGIN, PAGE_H - 22, boldFont, 13, COLOR.white);
  drawText(page, "Art. 34.9 del Estatuto de los Trabajadores (RDL 2/2015 de 23 de Octubre)", MARGIN, PAGE_H - 38, regularFont, 7, COLOR.yellow);

  drawRect(page, 0, PAGE_H - 120, PAGE_W, 64, COLOR.lightGray);
  drawText(page, "Empresa:", MARGIN, PAGE_H - 73, boldFont, 8, COLOR.purple);
  drawText(page, "Asociación La Vida es Zuaina", MARGIN + 42, PAGE_H - 73, regularFont, 8, COLOR.dark);
  drawText(page, "CIF:", MARGIN, PAGE_H - 86, boldFont, 8, COLOR.purple);
  drawText(page, "G76242114", MARGIN + 18, PAGE_H - 86, regularFont, 8, COLOR.dark);
  drawText(page, "Trabajador/a:", MARGIN + 200, PAGE_H - 73, boldFont, 8, COLOR.purple);
  drawText(page, workerName, MARGIN + 252, PAGE_H - 73, regularFont, 8, COLOR.dark, 230);
  drawText(page, "Puesto:", MARGIN + 200, PAGE_H - 86, boldFont, 8, COLOR.purple);
  drawText(page, position, MARGIN + 235, PAGE_H - 86, regularFont, 8, COLOR.dark, 260);

  drawRect(page, PAGE_W - 140, PAGE_H - 120, 140, 64, COLOR.purple);
  drawText(page, "Año:", PAGE_W - 130, PAGE_H - 73, boldFont, 8, COLOR.yellow);
  drawText(page, String(year), PAGE_W - 105, PAGE_H - 73, regularFont, 8, COLOR.white);
  drawText(page, "Mes:", PAGE_W - 130, PAGE_H - 86, boldFont, 8, COLOR.yellow);
  drawText(page, monthName, PAGE_W - 105, PAGE_H - 86, regularFont, 8, COLOR.white);

  drawRect(page, MARGIN, PAGE_H - 140, PAGE_W - 2 * MARGIN, 18, COLOR.purpleLight);
  drawText(page, "Período:  Del", MARGIN + 4, PAGE_H - 134, boldFont, 8, COLOR.purple);
  drawText(page, fmt(firstDay), MARGIN + 54, PAGE_H - 134, regularFont, 8, COLOR.dark);
  drawText(page, "Al", MARGIN + 130, PAGE_H - 134, boldFont, 8, COLOR.purple);
  drawText(page, fmt(lastDay), MARGIN + 143, PAGE_H - 134, regularFont, 8, COLOR.dark);
  drawText(page, "(*Jornada Partida)", PAGE_W - MARGIN - 100, PAGE_H - 134, regularFont, 7, COLOR.purple);
}

// Columnas para jornada partida (más comprimidas)
const COL = {
  fecha:    { x: MARGIN,       w: 56 },
  dia:      { x: MARGIN + 56,  w: 46 },
  ent1:     { x: MARGIN + 102, w: 46 },
  sal1:     { x: MARGIN + 148, w: 46 },
  firma1:   { x: MARGIN + 194, w: 50 },
  ent2:     { x: MARGIN + 244, w: 46 },
  sal2:     { x: MARGIN + 290, w: 46 },
  firma2:   { x: MARGIN + 336, w: 50 },
  extra:    { x: MARGIN + 386, w: 46 },
  total:    { x: MARGIN + 432, w: PAGE_W - 2 * MARGIN - 432 },
};

function drawTableHeaderSplit(page: PDFPage, boldFont: PDFFont, y: number) {
  const rowH = 22;
  drawRect(page, MARGIN, y, PAGE_W - 2 * MARGIN, rowH, COLOR.purple);

  const fs = 6.5;
  const c = COLOR.white;

  const allCols = Object.values(COL);
  for (const col of allCols) {
    page.drawLine({ start: { x: col.x, y }, end: { x: col.x, y: y + rowH }, thickness: 0.3, color: COLOR.gray });
  }
  page.drawLine({ start: { x: PAGE_W - MARGIN, y }, end: { x: PAGE_W - MARGIN, y: y + rowH }, thickness: 0.3, color: COLOR.gray });

  // Fila 1 de cabecera
  drawText(page, "Fecha",           COL.fecha.x + 2,  y + 13, boldFont, fs, c);
  drawText(page, "Día",             COL.dia.x + 2,    y + 13, boldFont, fs, c);
  drawText(page, "Entrada",         COL.ent1.x + 2,   y + 13, boldFont, fs, c);
  drawText(page, "Salida",          COL.sal1.x + 2,   y + 13, boldFont, fs, c);
  drawText(page, "Firma",           COL.firma1.x + 2, y + 13, boldFont, fs, c);
  drawText(page, "Entrada",         COL.ent2.x + 2,   y + 13, boldFont, fs, c);
  drawText(page, "Salida",          COL.sal2.x + 2,   y + 13, boldFont, fs, c);
  drawText(page, "Firma",           COL.firma2.x + 2, y + 13, boldFont, fs, c);
  drawText(page, "H.Extra",         COL.extra.x + 2,  y + 13, boldFont, fs, c);
  drawText(page, "Total",           COL.total.x + 2,  y + 13, boldFont, fs, c);
  // Fila 2 de cabecera
  drawText(page, "mañana",          COL.ent1.x + 2,   y + 4,  boldFont, fs - 0.5, COLOR.yellow);
  drawText(page, "mañana",          COL.sal1.x + 2,   y + 4,  boldFont, fs - 0.5, COLOR.yellow);
  drawText(page, "tarde",           COL.ent2.x + 2,   y + 4,  boldFont, fs - 0.5, COLOR.yellow);
  drawText(page, "tarde",           COL.sal2.x + 2,   y + 4,  boldFont, fs - 0.5, COLOR.yellow);
  drawText(page, "trabajado",       COL.total.x + 2,  y + 4,  boldFont, fs - 0.5, COLOR.yellow);
}

function drawRowSplit(
  page: PDFPage, regularFont: PDFFont, boldFont: PDFFont,
  entry: DayEntry, y: number, rowH: number
) {
  const bg = entry.isBlue
    ? COLOR.blueBg
    : entry.date.getDate() % 2 === 0 ? COLOR.white : COLOR.lightGray;

  drawRect(page, MARGIN, y, PAGE_W - 2 * MARGIN, rowH, bg);
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.3, color: COLOR.gray });

  const allCols = Object.values(COL);
  for (const col of allCols) {
    page.drawLine({ start: { x: col.x, y }, end: { x: col.x, y: y + rowH }, thickness: 0.3, color: COLOR.gray });
  }
  page.drawLine({ start: { x: PAGE_W - MARGIN, y }, end: { x: PAGE_W - MARGIN, y: y + rowH }, thickness: 0.3, color: COLOR.gray });

  const fs = 6.5;
  const dy = rowH / 2 - 2.5;
  const tColor = entry.isBlue ? COLOR.blueAccent : COLOR.dark;

  drawText(page, entry.dateStr, COL.fecha.x + 2, y + dy, regularFont, fs, tColor);
  drawText(page, entry.dayName, COL.dia.x + 2,   y + dy, regularFont, fs, tColor);

  if (entry.works) {
    // Turno mañana
    if (entry.start1) {
      drawText(page, entry.start1,  COL.ent1.x + 2, y + dy, regularFont, fs, COLOR.dark);
      drawText(page, entry.end1 ?? "", COL.sal1.x + 2, y + dy, regularFont, fs, COLOR.dark);
    }
    // Turno tarde
    if (entry.start2) {
      drawText(page, entry.start2,  COL.ent2.x + 2, y + dy, regularFont, fs, COLOR.dark);
      drawText(page, entry.end2 ?? "", COL.sal2.x + 2, y + dy, regularFont, fs, COLOR.dark);
    }
    if (entry.totalHours > 0) {
      drawText(page, formatHours(entry.totalHours), COL.total.x + 2, y + dy, boldFont, fs, COLOR.dark);
    }
  } else if (entry.isHoliday && entry.holidayName) {
    drawText(page, entry.holidayName, COL.ent1.x + 2, y + dy, regularFont, fs - 0.5, COLOR.blueAccent, 160);
  }
}

function drawFooter(
  page: PDFPage, regularFont: PDFFont, boldFont: PDFFont,
  workerName: string, year: number, month: number, totalHours: number, yStart: number
) {
  drawRect(page, MARGIN, yStart - 4, PAGE_W - 2 * MARGIN, 20, COLOR.purpleLight);
  drawText(page, `Total de ${workerName}  ${formatHours(totalHours)}`, MARGIN + 4, yStart + 4, boldFont, 9, COLOR.purple);
  drawText(page, `En Lanzarote, a ${lastDayOfMonthES(year, month)}`, MARGIN, yStart - 24, regularFont, 8, COLOR.dark);

  const boxW = (PAGE_W - 2 * MARGIN - 24) / 2;
  const boxH = 55;
  const boxY = yStart - 90;

  drawRect(page, MARGIN, boxY, boxW, boxH, COLOR.white, COLOR.gray);
  drawText(page, "El/la trabajador/a", MARGIN + 4, boxY + boxH - 12, regularFont, 7.5, COLOR.purple);
  drawRect(page, MARGIN + boxW + 24, boxY, boxW, boxH, COLOR.white, COLOR.gray);
  drawText(page, "El/la representante de la empresa", MARGIN + boxW + 28, boxY + boxH - 12, regularFont, 7.5, COLOR.purple);
}

export async function generateSplitPdf(
  workerName: string,
  position: string,
  year: number,
  month: number,
  entries: DayEntry[],
  totalHours: number
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([PAGE_W, PAGE_H]);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await doc.embedFont(StandardFonts.Helvetica);

  drawHeader(page, boldFont, regularFont, workerName, position, year, month);

  // Intentar cargar logo para esquina superior derecha
  try {
    const logoPaths = [
      path.join(process.cwd(), "public", "logo.png"),
      path.join(process.cwd(), "public", "logo.jpg"),
    ];
    
    let logoBytes = null;
    let isPng = true;
    for (const lp of logoPaths) {
      if (fs.existsSync(lp)) {
        logoBytes = fs.readFileSync(lp);
        isPng = lp.endsWith(".png");
        break;
      }
    }

    if (logoBytes) {
      const logoImage = isPng ? await doc.embedPng(logoBytes) : await doc.embedJpg(logoBytes);
      const targetHeight = 44; // El header mide 56 de alto, dejamos márgenes
      const targetWidth = (logoImage.width / logoImage.height) * targetHeight;
      
      page.drawImage(logoImage, {
        x: PAGE_W - targetWidth - MARGIN,
        y: PAGE_H - 56 + (56 - targetHeight) / 2,
        width: targetWidth,
        height: targetHeight,
      });
    }
  } catch (error) {
    console.log("No se pudo incrustar el logo:", error);
  }

  const ROW_H = 12;
  const tableStart = PAGE_H - 162;
  drawTableHeaderSplit(page, boldFont, tableStart);

  let yRow = tableStart - ROW_H;
  for (const entry of entries) {
    drawRowSplit(page, regularFont, boldFont, entry, yRow, ROW_H);
    yRow -= ROW_H;
  }

  page.drawLine({ start: { x: MARGIN, y: yRow + ROW_H }, end: { x: PAGE_W - MARGIN, y: yRow + ROW_H }, thickness: 0.5, color: COLOR.gray });

  drawFooter(page, regularFont, boldFont, workerName, year, month, totalHours, yRow - 10);

  return doc.save();
}
