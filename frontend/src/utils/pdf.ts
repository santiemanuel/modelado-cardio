export type SummaryPdfRow = {
  label: string;
  value: string;
};

export type SummaryPdfFactor = {
  label: string;
  value: string;
  direction: "raises_risk" | "lowers_risk" | "neutral";
};

export type SummaryPdfLogo = {
  width: number;
  height: number;
  rgbHex: string;
  alphaHex?: string;
};

export type SummaryPdfData = {
  issuedAt: string;
  evaluationType: string;
  probabilityPercent: string;
  probabilityValue: string;
  thresholdPercent: string;
  modelName: string;
  communicationRange: string;
  riskLabel: string;
  bmi: string;
  inputRows: SummaryPdfRow[];
  factors: SummaryPdfFactor[];
  questions: string[];
  warning: string;
  logo?: SummaryPdfLogo;
};

type FontName = "F1" | "F2";
type RgbColor = [number, number, number];

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN_X = 36;

const COLORS = {
  ink: [0.09, 0.13, 0.15] as RgbColor,
  muted: [0.36, 0.42, 0.45] as RgbColor,
  line: [0.76, 0.81, 0.83] as RgbColor,
  soft: [0.96, 0.98, 0.98] as RgbColor,
  white: [1, 1, 1] as RgbColor,
  accent: [0.02, 0.38, 0.42] as RgbColor,
  brand: [0.84, 0.0, 0.08] as RgbColor,
  accentSoft: [0.9, 0.96, 0.96] as RgbColor,
  warningSoft: [0.99, 0.96, 0.88] as RgbColor,
};

const TEXT_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\u00c3\u00a1/g, "á"],
  [/\u00c3\u00a9/g, "é"],
  [/\u00c3\u00ad/g, "í"],
  [/\u00c3\u00b3/g, "ó"],
  [/\u00c3\u00ba/g, "ú"],
  [/\u00c3\u00b1/g, "ñ"],
  [/\u00c3\u00bc/g, "ü"],
  [/\u00c3\u0081/g, "Á"],
  [/\u00c3\u0089/g, "É"],
  [/\u00c3\u008d/g, "Í"],
  [/\u00c3\u0093/g, "Ó"],
  [/\u00c3\u009a/g, "Ú"],
  [/\u00c3\u0091/g, "Ñ"],
  [/\u00c2\u00bf/g, "¿"],
  [/\u00c2\u00a1/g, "¡"],
  [/\u00c2\u00b0/g, "°"],
  [/\u00c2\u00b2/g, "²"],
  [/\u00a0/g, " "],
  [/\u2010|\u2011|\u2012|\u2013|\u2014|\u2212/g, "-"],
];

function normalizePdfText(text: string) {
  let normalized = text;
  for (const [pattern, replacement] of TEXT_REPLACEMENTS) {
    normalized = normalized.replace(pattern, replacement);
  }

  return normalized
    .replace(/\s+/g, " ")
    .trim();
}

function escapePdfText(text: string) {
  return [...normalizePdfText(text)]
    .map((char) => {
      const code = char.charCodeAt(0);
      if (char === "\\" || char === "(" || char === ")") {
        return `\\${char}`;
      }
      if (code >= 32 && code <= 126) {
        return char;
      }
      if (code >= 160 && code <= 255) {
        return `\\${code.toString(8).padStart(3, "0")}`;
      }
      return "?";
    })
    .join("");
}

function colorOperator(color: RgbColor, operator: "rg" | "RG") {
  return `${color.map((channel) => channel.toFixed(3)).join(" ")} ${operator}`;
}

function bytesToHex(bytes: number[]) {
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function drawLogoImage(
  commands: string[],
  logo: SummaryPdfLogo,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  commands.push(
    "q",
    `${width.toFixed(1)} 0 0 ${height.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)} cm`,
    "/Logo Do",
    "Q",
  );
}

function drawText(
  commands: string[],
  text: string,
  x: number,
  y: number,
  options: {
    size?: number;
    font?: FontName;
    color?: RgbColor;
  } = {},
) {
  const size = options.size ?? 8;
  const font = options.font ?? "F1";
  const color = options.color ?? COLORS.ink;

  commands.push(
    "BT",
    `/${font} ${size} Tf`,
    colorOperator(color, "rg"),
    `1 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)} Tm`,
    `(${escapePdfText(text)}) Tj`,
    "ET",
  );
}

function wrapText(text: string, maxChars: number) {
  const words = normalizePdfText(text).split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function truncateText(text: string, maxChars: number) {
  const normalized = normalizePdfText(text);
  if (normalized.length <= maxChars) {
    return normalized;
  }
  return `${normalized.slice(0, Math.max(0, maxChars - 3)).trimEnd()}...`;
}

function drawWrappedText(
  commands: string[],
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  options: {
    size?: number;
    font?: FontName;
    color?: RgbColor;
    lineHeight?: number;
    maxLines?: number;
  } = {},
) {
  const size = options.size ?? 8;
  const lineHeight = options.lineHeight ?? size + 2;
  const maxChars = Math.max(8, Math.floor(maxWidth / (size * 0.48)));
  const maxLines = options.maxLines ?? 3;
  const lines = wrapText(text, maxChars);
  const visibleLines = lines.slice(0, maxLines);

  if (lines.length > maxLines && visibleLines.length > 0) {
    visibleLines[visibleLines.length - 1] = truncateText(
      visibleLines[visibleLines.length - 1],
      maxChars,
    );
  }

  visibleLines.forEach((line, index) => {
    drawText(commands, line, x, y - index * lineHeight, options);
  });

  return y - visibleLines.length * lineHeight;
}

function drawBox(
  commands: string[],
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    fill?: RgbColor;
    stroke?: RgbColor;
    lineWidth?: number;
  } = {},
) {
  commands.push(
    "q",
    colorOperator(options.fill ?? COLORS.white, "rg"),
    colorOperator(options.stroke ?? COLORS.line, "RG"),
    `${(options.lineWidth ?? 0.8).toFixed(2)} w`,
    `${x.toFixed(1)} ${y.toFixed(1)} ${width.toFixed(1)} ${height.toFixed(1)} re B`,
    "Q",
  );
}

function drawLine(
  commands: string[],
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  options: {
    color?: RgbColor;
    width?: number;
  } = {},
) {
  commands.push(
    "q",
    colorOperator(options.color ?? COLORS.line, "RG"),
    `${(options.width ?? 0.7).toFixed(2)} w`,
    `${x1.toFixed(1)} ${y1.toFixed(1)} m`,
    `${x2.toFixed(1)} ${y2.toFixed(1)} l`,
    "S",
    "Q",
  );
}

function drawSectionTitle(commands: string[], title: string, x: number, y: number) {
  drawText(commands, title.toUpperCase(), x, y, {
    color: COLORS.accent,
    font: "F2",
    size: 8,
  });
}

function drawField(commands: string[], label: string, x: number, y: number, width: number) {
  drawText(commands, label, x, y + 3, { color: COLORS.muted, size: 7 });
  drawLine(commands, x + 54, y + 1, x + width, y + 1, { color: COLORS.line });
}

function drawBrandFallback(commands: string[], x: number, y: number) {
  drawLine(commands, x, y + 10, x + 13, y + 10, { color: COLORS.brand, width: 2.8 });
  drawLine(commands, x + 13, y + 10, x + 19, y + 19, { color: COLORS.brand, width: 2.8 });
  drawLine(commands, x + 19, y + 19, x + 27, y + 1, { color: COLORS.brand, width: 2.8 });
  drawLine(commands, x + 27, y + 1, x + 35, y + 12, { color: COLORS.brand, width: 2.8 });
  drawLine(commands, x + 35, y + 12, x + 48, y + 12, { color: COLORS.brand, width: 2.8 });
  drawText(commands, "Presión Bajo Control", x + 60, y + 3, {
    color: COLORS.brand,
    font: "F2",
    size: 16,
  });
}

function drawLabelValue(
  commands: string[],
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
) {
  const labelWidth = label.length * 4.1;
  const valueX = Math.min(x + 128, Math.max(x + 92, x + labelWidth + 14));
  const maxChars = Math.floor((x + width - valueX) / 4.2);
  drawText(commands, `${label}:`, x, y, { color: COLORS.muted, font: "F2", size: 7.4 });
  drawText(commands, truncateText(value, Math.max(8, maxChars)), valueX, y, {
    color: COLORS.ink,
    size: 7.4,
  });
}

function directionLabel(direction: SummaryPdfFactor["direction"]) {
  if (direction === "raises_risk") {
    return "Sube la estimación";
  }
  if (direction === "lowers_risk") {
    return "Baja la estimación";
  }
  return "Neutro";
}

function drawHeader(commands: string[], data: SummaryPdfData) {
  if (data.logo) {
    drawLogoImage(commands, data.logo, MARGIN_X, 805, 190, 26);
  } else {
    drawBrandFallback(commands, MARGIN_X, 808);
  }

  drawText(commands, "Resumen orientativo para consulta", MARGIN_X, 789, {
    color: COLORS.ink,
    font: "F2",
    size: 15,
  });
  drawWrappedText(
    commands,
    "Documento para consultar con un profesional de salud. No reemplaza mediciones ni evaluación clínica.",
    MARGIN_X,
    772,
    350,
    { color: COLORS.muted, size: 8.5, maxLines: 2, lineHeight: 10 },
  );
  drawText(commands, "Fecha de emisión", 434, 806, { color: COLORS.muted, size: 7 });
  drawText(commands, data.issuedAt, 434, 794, { color: COLORS.ink, font: "F2", size: 8 });
  drawLine(commands, MARGIN_X, 752, PAGE_WIDTH - MARGIN_X, 752, { color: COLORS.accent });
}

function drawIdentityBox(commands: string[]) {
  drawBox(commands, MARGIN_X, 706, 523, 36, { fill: COLORS.soft });
  drawSectionTitle(commands, "Identificación para consulta", 48, 729);
  drawField(commands, "Paciente", 48, 713, 205);
  drawField(commands, "DNI / HC", 270, 713, 118);
  drawField(commands, "Profesional", 404, 713, 143);
}

function drawResultBox(commands: string[], data: SummaryPdfData) {
  drawBox(commands, MARGIN_X, 610, 252, 92, { fill: COLORS.accentSoft });
  drawSectionTitle(commands, "Estimación del modelo", 48, 684);
  drawText(commands, data.probabilityPercent, 48, 650, {
    color: COLORS.accent,
    font: "F2",
    size: 30,
  });
  drawWrappedText(commands, data.communicationRange, 126, 655, 142, {
    color: COLORS.ink,
    font: "F2",
    size: 9,
    lineHeight: 11,
    maxLines: 2,
  });
  drawWrappedText(commands, data.riskLabel, 48, 628, 222, {
    color: COLORS.muted,
    size: 8,
    lineHeight: 10,
    maxLines: 2,
  });
}

function drawModelBox(commands: string[], data: SummaryPdfData) {
  drawBox(commands, 306, 610, 253, 92, { fill: COLORS.white });
  drawSectionTitle(commands, "Detalle técnico", 318, 684);
  drawLabelValue(commands, "Tipo", data.evaluationType, 318, 663, 220);
  drawLabelValue(commands, "Modelo", data.modelName, 318, 649, 220);
  drawLabelValue(commands, "Umbral", data.thresholdPercent, 318, 635, 220);
  drawLabelValue(commands, "Valor tecnico", data.probabilityValue, 318, 621, 220);
}

function drawInputRows(commands: string[], data: SummaryPdfData) {
  drawBox(commands, MARGIN_X, 484, 523, 112, { fill: COLORS.white });
  drawSectionTitle(commands, "Datos cargados", 48, 578);
  drawWrappedText(commands, "Valores declarados o calculados por la herramienta.", 330, 578, 210, {
    color: COLORS.muted,
    size: 6.7,
    lineHeight: 8,
    maxLines: 1,
  });

  const rows = data.inputRows.slice(0, 12);
  const midpoint = Math.ceil(rows.length / 2);
  const rowGap = rows.length > 10 ? 13 : 15;
  const columns = [
    { x: 48, rows: rows.slice(0, midpoint), width: 228 },
    { x: 306, rows: rows.slice(midpoint), width: 228 },
  ];

  columns.forEach((column) => {
    column.rows.forEach((row, index) => {
      drawLabelValue(commands, row.label, row.value, column.x, 558 - index * rowGap, column.width);
    });
  });
}

function drawFactors(commands: string[], data: SummaryPdfData) {
  drawBox(commands, MARGIN_X, 410, 523, 62, { fill: COLORS.white });
  drawSectionTitle(commands, "Factores principales", 48, 454);

  const factors = data.factors.slice(0, 3);
  if (factors.length === 0) {
    drawText(commands, "No disponible en esta respuesta del modelo.", 48, 433, {
      color: COLORS.muted,
      size: 8,
    });
    return;
  }

  factors.forEach((factor, index) => {
    const x = 48 + index * 168;
    drawWrappedText(
      commands,
      `${factor.label} (${factor.value})`,
      x,
      435,
      150,
      { color: COLORS.ink, font: "F2", size: 7.7, lineHeight: 9, maxLines: 2 },
    );
    drawText(commands, directionLabel(factor.direction), x, 416, {
      color: COLORS.muted,
      size: 7.2,
    });
  });
}

function drawQuestions(commands: string[], data: SummaryPdfData) {
  drawBox(commands, MARGIN_X, 342, 523, 54, { fill: COLORS.warningSoft });
  drawSectionTitle(commands, "Preguntas sugeridas", 48, 378);

  data.questions.slice(0, 3).forEach((question, index) => {
    drawWrappedText(commands, `${index + 1}. ${question}`, 48 + index * 170, 361, 154, {
      color: COLORS.ink,
      size: 7.4,
      lineHeight: 9,
      maxLines: 2,
    });
  });
}

function drawPressureTable(commands: string[]) {
  drawBox(commands, MARGIN_X, 240, 523, 88, { fill: COLORS.white });
  drawSectionTitle(commands, "Registro de presión arterial", 48, 310);

  const x = 48;
  const top = 298;
  const rowHeight = 11;
  const widths = [58, 40, 48, 48, 42, 48, 225];
  const headers = ["Fecha", "Hora", "Sistólica", "Diastólica", "Pulso", "Brazo", "Observaciones"];
  const tableWidth = widths.reduce((sum, width) => sum + width, 0);

  drawBox(commands, x, top - rowHeight, tableWidth, rowHeight, {
    fill: COLORS.soft,
    stroke: COLORS.line,
    lineWidth: 0.6,
  });

  let currentX = x;
  headers.forEach((header, index) => {
    drawText(commands, header, currentX + 4, top - 10, {
      color: COLORS.muted,
      font: "F2",
      size: 6.4,
    });
    currentX += widths[index];
    drawLine(commands, currentX, top - rowHeight, currentX, top - rowHeight * 4, {
      color: COLORS.line,
      width: 0.5,
    });
  });

  for (let row = 0; row <= 3; row += 1) {
    const y = top - rowHeight * (row + 1);
    drawLine(commands, x, y, x + tableWidth, y, { color: COLORS.line, width: 0.5 });
  }
  drawLine(commands, x, top - rowHeight, x, top - rowHeight * 4, { color: COLORS.line, width: 0.5 });
}

function drawClinicalBox(commands: string[]) {
  drawBox(commands, MARGIN_X, 76, 523, 150, { fill: COLORS.white });
  drawSectionTitle(commands, "Completar por profesional de salud", 48, 208);

  drawText(commands, "Diagnóstico clínico", 48, 186, { color: COLORS.muted, font: "F2", size: 7.5 });
  drawLine(commands, 150, 188, 545, 188, { color: COLORS.line });
  drawLine(commands, 48, 169, 545, 169, { color: COLORS.line });

  drawText(commands, "Indicaciones / plan para paciente", 48, 148, {
    color: COLORS.muted,
    font: "F2",
    size: 7.5,
  });
  drawLine(commands, 190, 150, 545, 150, { color: COLORS.line });
  drawLine(commands, 48, 132, 545, 132, { color: COLORS.line });
  drawLine(commands, 48, 114, 545, 114, { color: COLORS.line });

  drawText(commands, "Próximo control", 48, 92, { color: COLORS.muted, font: "F2", size: 7.5 });
  drawLine(commands, 124, 94, 290, 94, { color: COLORS.line });
  drawText(commands, "Firma y sello", 340, 92, { color: COLORS.muted, font: "F2", size: 7.5 });
  drawLine(commands, 408, 94, 545, 94, { color: COLORS.line });
}

function drawFooter(commands: string[], data: SummaryPdfData) {
  drawWrappedText(commands, data.warning, MARGIN_X, 56, 523, {
    color: COLORS.muted,
    size: 7.2,
    lineHeight: 9,
    maxLines: 2,
  });
}

function createContentStream(data: SummaryPdfData) {
  const commands: string[] = [];

  drawHeader(commands, data);
  drawIdentityBox(commands);
  drawResultBox(commands, data);
  drawModelBox(commands, data);
  drawInputRows(commands, data);
  drawFactors(commands, data);
  drawQuestions(commands, data);
  drawPressureTable(commands);
  drawClinicalBox(commands);
  drawFooter(commands, data);

  return commands.join("\n");
}

function buildPdf(objects: string[]) {
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

export function createSummaryPdf(data: SummaryPdfData) {
  const stream = createContentStream(data);
  const hasLogo = Boolean(data.logo);
  const contentObjectNumber = hasLogo ? 8 : 6;
  const xObjectResources = hasLogo ? " /XObject << /Logo 6 0 R >>" : "";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >>${xObjectResources} >> /Contents ${contentObjectNumber} 0 R >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
  ];

  if (data.logo) {
    objects.push(
      `<< /Type /XObject /Subtype /Image /Width ${data.logo.width} /Height ${data.logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /ASCIIHexDecode /Length ${
        data.logo.rgbHex.length + 1
      } /SMask 7 0 R >>\nstream\n${data.logo.rgbHex}>\nendstream`,
      `<< /Type /XObject /Subtype /Image /Width ${data.logo.width} /Height ${data.logo.height} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /ASCIIHexDecode /Length ${
        (data.logo.alphaHex ?? "").length + 1
      } >>\nstream\n${data.logo.alphaHex ?? ""}>\nendstream`,
    );
  }

  objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);

  return buildPdf(objects);
}

async function loadLogoFromUrl(logoUrl: string): Promise<SummaryPdfLogo | undefined> {
  try {
    const image = new Image();
    image.decoding = "async";

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("No se pudo cargar el logo."));
      image.src = logoUrl;
    });

    const targetWidth = 420;
    const targetHeight = Math.max(1, Math.round((image.naturalHeight / image.naturalWidth) * targetWidth));
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      return undefined;
    }
    context.clearRect(0, 0, targetWidth, targetHeight);
    context.drawImage(image, 0, 0, targetWidth, targetHeight);
    const pixels = context.getImageData(0, 0, targetWidth, targetHeight).data;
    const rgb: number[] = [];
    const alpha: number[] = [];

    for (let index = 0; index < pixels.length; index += 4) {
      rgb.push(pixels[index], pixels[index + 1], pixels[index + 2]);
      alpha.push(pixels[index + 3]);
    }

    return {
      width: targetWidth,
      height: targetHeight,
      rgbHex: bytesToHex(rgb),
      alphaHex: bytesToHex(alpha),
    };
  } catch {
    return undefined;
  }
}

export async function downloadSummaryPdf(
  filename: string,
  data: SummaryPdfData,
  options: { logoUrl?: string } = {},
) {
  const logo = options.logoUrl ? await loadLogoFromUrl(options.logoUrl) : undefined;
  const blob = new Blob([createSummaryPdf({ ...data, logo: logo ?? data.logo })], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
