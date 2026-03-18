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

// ============================
// COLORES DE MARCA
// ============================
const COLOR = {
  purple: rgb(0.478, 0.247, 0.627),   // #7A3FA0
  yellow: rgb(0.949, 0.918, 0.0),     // #F2EA00
  blueBg: rgb(0.839, 0.918, 0.969),   // #D6EAF7
  blueAccent: rgb(0.094, 0.655, 0.878), // #18A7E0
  dark: rgb(0.122, 0.102, 0.141),     // #1F1A24
  gray: rgb(0.85, 0.85, 0.85),        // #D9D9D9
  white: rgb(1, 1, 1),
  lightGray: rgb(0.96, 0.96, 0.96),
  purpleLight: rgb(0.902, 0.847, 0.941),
};

const PAGE_W = 595.28;  // A4 ancho
const PAGE_H = 841.89;  // A4 alto
const MARGIN = 32;

// ============================
// HELPERS DE DIBUJO
// ============================
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
    // Truncar si excede el ancho disponible
    while (
      finalText.length > 0 &&
      font.widthOfTextAtSize(finalText, size) > maxWidth
    ) {
      finalText = finalText.slice(0, -1);
    }
    if (finalText.length < text.length) finalText = finalText.slice(0, -1) + "…";
  }
  page.drawText(finalText, { x, y, size, font, color });
}

function drawRect(
  page: PDFPage,
  x: number,
  y: number,
  w: number,
  h: number,
  fillColor: RGB,
  borderColor?: RGB
) {
  page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    color: fillColor,
    borderColor,
    borderWidth: borderColor ? 0.5 : undefined,
  });
}

// ============================
// CABECERA DEL PDF
// ============================
function drawHeader(
  page: PDFPage,
  boldFont: PDFFont,
  regularFont: PDFFont,
  workerName: string,
  position: string,
  year: number,
  month: number  // 1-12
) {
  const monthName = MONTH_NAMES_ES[month - 1];
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

  // Banda morada superior
  drawRect(page, 0, PAGE_H - 56, PAGE_W, 56, COLOR.purple);

  // Título
  drawText(page, "Registro de jornada laboral", MARGIN, PAGE_H - 22, boldFont, 13, COLOR.white);
  drawText(
    page,
    "Art. 34.9 del Estatuto de los Trabajadores (RDL 2/2015 de 23 de Octubre)",
    MARGIN,
    PAGE_H - 38,
    regularFont,
    7,
    COLOR.yellow
  );

  // Bloque datos empresa / año + mes (fondo claro)
  drawRect(page, 0, PAGE_H - 120, PAGE_W, 64, COLOR.lightGray);

  // Empresa y CIF
  drawText(page, "Empresa:", MARGIN, PAGE_H - 73, boldFont, 8, COLOR.purple);
  drawText(
    page,
    "Asociación La Vida es Zuaina",
    MARGIN + 42,
    PAGE_H - 73,
    regularFont,
    8,
    COLOR.dark
  );
  drawText(page, "CIF:", MARGIN, PAGE_H - 86, boldFont, 8, COLOR.purple);
  drawText(page, "G76242114", MARGIN + 18, PAGE_H - 86, regularFont, 8, COLOR.dark);

  // Trabajador y puesto
  drawText(page, "Trabajador/a:", MARGIN + 200, PAGE_H - 73, boldFont, 8, COLOR.purple);
  drawText(page, workerName, MARGIN + 250, PAGE_H - 73, regularFont, 8, COLOR.dark, 230);
  drawText(page, "Puesto:", MARGIN + 200, PAGE_H - 86, boldFont, 8, COLOR.purple);
  drawText(page, position, MARGIN + 233, PAGE_H - 86, regularFont, 8, COLOR.dark, 280);

  // Año y mes a la derecha
  drawRect(page, PAGE_W - 140, PAGE_H - 120, 140, 64, COLOR.purple);
  drawText(page, "Año:", PAGE_W - 130, PAGE_H - 73, boldFont, 8, COLOR.yellow);
  drawText(page, String(year), PAGE_W - 105, PAGE_H - 73, regularFont, 8, COLOR.white);
  drawText(page, "Mes:", PAGE_W - 130, PAGE_H - 86, boldFont, 8, COLOR.yellow);
  drawText(page, monthName, PAGE_W - 105, PAGE_H - 86, regularFont, 8, COLOR.white);

  // Período
  drawRect(page, MARGIN, PAGE_H - 140, PAGE_W - 2 * MARGIN, 18, COLOR.purpleLight);
  drawText(page, "Período:  Del", MARGIN + 4, PAGE_H - 134, boldFont, 8, COLOR.purple);
  drawText(page, fmt(firstDay), MARGIN + 54, PAGE_H - 134, regularFont, 8, COLOR.dark);
  drawText(page, "Al", MARGIN + 130, PAGE_H - 134, boldFont, 8, COLOR.purple);
  drawText(page, fmt(lastDay), MARGIN + 143, PAGE_H - 134, regularFont, 8, COLOR.dark);
}

// ============================
// TABLA CONTINUA
// ============================
const COL_CONTINUOUS = {
  fecha:   { x: MARGIN,       w: 65 },
  dia:     { x: MARGIN + 65,  w: 52 },
  entrada: { x: MARGIN + 117, w: 58 },
  salida:  { x: MARGIN + 175, w: 58 },
  firma:   { x: MARGIN + 233, w: 95 },
  extra:   { x: MARGIN + 328, w: 55 },
  total:   { x: MARGIN + 383, w: PAGE_W - 2 * MARGIN - 383 },
};

function drawTableHeaderContinuous(
  page: PDFPage,
  boldFont: PDFFont,
  y: number
) {
  const rowH = 18;
  const cols = COL_CONTINUOUS;

  // Fondo morado cabecera
  drawRect(page, MARGIN, y, PAGE_W - 2 * MARGIN, rowH, COLOR.purple);

  const headerColor = COLOR.white;
  const fs = 8.5;

  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.5, color: COLOR.gray });

  drawText(page, "Fecha", cols.fecha.x + 2, y + 6, boldFont, fs, headerColor);
  drawText(page, "Día", cols.dia.x + 2, y + 6, boldFont, fs, headerColor);
  drawText(page, "Hora entrada", cols.entrada.x + 2, y + 6, boldFont, fs, headerColor);
  drawText(page, "Hora salida", cols.salida.x + 2, y + 6, boldFont, fs, headerColor);
  drawText(page, "Firma", cols.firma.x + 2, y + 6, boldFont, fs, headerColor);
  drawText(page, "Horas extra", cols.extra.x + 2, y + 6, boldFont, fs, headerColor);
  drawText(page, "Total trabajado", cols.total.x + 2, y + 6, boldFont, fs, headerColor);
}

function drawRowContinuous(
  page: PDFPage,
  regularFont: PDFFont,
  boldFont: PDFFont,
  entry: DayEntry,
  y: number,
  rowH: number
) {
  const cols = COL_CONTINUOUS;
  const bg = entry.isBlue ? COLOR.blueBg : (entry.date.getDate() % 2 === 0 ? COLOR.white : COLOR.lightGray);

  // Fondo de fila
  drawRect(page, MARGIN, y, PAGE_W - 2 * MARGIN, rowH, bg);

  // Línea separadora
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.3, color: COLOR.gray });

  // Líneas verticales entre columnas
  const allCols = Object.values(cols);
  for (const col of allCols) {
    page.drawLine({ start: { x: col.x, y }, end: { x: col.x, y: y + rowH }, thickness: 0.3, color: COLOR.gray });
  }
  page.drawLine({ start: { x: PAGE_W - MARGIN, y }, end: { x: PAGE_W - MARGIN, y: y + rowH }, thickness: 0.3, color: COLOR.gray });

  const fs = 8;
  const dy = rowH / 2 - 3;
  const textColor = entry.isBlue ? COLOR.blueAccent : COLOR.dark;

  drawText(page, entry.dateStr, cols.fecha.x + 2, y + dy, regularFont, fs, textColor);
  drawText(page, entry.dayName, cols.dia.x + 2, y + dy, regularFont, fs, textColor);

  if (entry.works && entry.start1) {
    drawText(page, entry.start1, cols.entrada.x + 2, y + dy, regularFont, fs, COLOR.dark);
    drawText(page, entry.end1 ?? "", cols.salida.x + 2, y + dy, regularFont, fs, COLOR.dark);
    drawText(page, formatHours(entry.totalHours), cols.total.x + 2, y + dy, boldFont, fs, COLOR.dark);
  } else if (entry.isHoliday && entry.holidayName) {
    drawText(page, entry.holidayName, cols.entrada.x + 2, y + dy, regularFont, fs - 0.5, COLOR.blueAccent, cols.firma.w + cols.extra.w + 60);
  }
}

// ============================
// PIE DE PÁGINA
// ============================
function drawFooter(
  page: PDFPage,
  regularFont: PDFFont,
  boldFont: PDFFont,
  workerName: string,
  year: number,
  month: number,
  totalHours: number,
  yStart: number
) {
  const monthName = MONTH_NAMES_ES[month - 1].toLowerCase();

  // Total mensual
  drawRect(page, MARGIN, yStart - 4, PAGE_W - 2 * MARGIN, 20, COLOR.purpleLight);
  drawText(
    page,
    `Total de ${workerName}  ${formatHours(totalHours)}`,
    MARGIN + 4,
    yStart + 4,
    boldFont,
    9,
    COLOR.purple
  );

  // Lugar y fecha
  drawText(
    page,
    `En Lanzarote, a ${lastDayOfMonthES(year, month)}`,
    MARGIN,
    yStart - 24,
    regularFont,
    8,
    COLOR.dark
  );

  // Cajas de firma
  const boxW = (PAGE_W - 2 * MARGIN - 24) / 2;
  const boxH = 55;
  const boxY = yStart - 90;

  drawRect(page, MARGIN, boxY, boxW, boxH, COLOR.white, COLOR.gray);
  drawText(page, "El/la trabajador/a", MARGIN + 4, boxY + boxH - 12, regularFont, 7.5, COLOR.purple);

  drawRect(page, MARGIN + boxW + 24, boxY, boxW, boxH, COLOR.white, COLOR.gray);
  drawText(page, "El/la representante de la empresa", MARGIN + boxW + 28, boxY + boxH - 12, regularFont, 7.5, COLOR.purple);
}

// ============================
// FUNCIÓN PRINCIPAL CONTINUA
// ============================
export async function generateContinuousPdf(
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

  // Cabecera
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

  // Tabla
  const ROW_H = 16.5;
  const tableStart = PAGE_H - 160;
  drawTableHeaderContinuous(page, boldFont, tableStart);

  let yRow = tableStart - ROW_H;
  for (const entry of entries) {
    drawRowContinuous(page, regularFont, boldFont, entry, yRow, ROW_H);
    yRow -= ROW_H;
  }

  // Línea inferior de la tabla
  page.drawLine({ start: { x: MARGIN, y: yRow + ROW_H }, end: { x: PAGE_W - MARGIN, y: yRow + ROW_H }, thickness: 0.5, color: COLOR.gray });

  // Pie
  drawFooter(page, regularFont, boldFont, workerName, year, month, totalHours, yRow - 10);

  return doc.save();
}
