import { describe, expect, it } from "vitest";

import { createSummaryPdf } from "./pdf";
import type { SummaryPdfData } from "./pdf";

const summaryFixture: SummaryPdfData = {
  issuedAt: "27/6/2026, 10:30:00",
  evaluationType: "Completa",
  probabilityPercent: "72%",
  probabilityValue: "0.720",
  thresholdPercent: "50%",
  modelName: "Regresión logística",
  communicationRange: "Prioridad alta (50-74%)",
  riskLabel: "señales compatibles con hipertensión",
  bmi: "31.7 kg/m²",
  inputRows: [
    { label: "Edad", value: "66 años" },
    { label: "Peso", value: "90.5 kg" },
    { label: "Altura", value: "169 cm" },
    { label: "Cintura", value: "101.8 cm" },
    { label: "IMC calculado", value: "31.7 kg/m²" },
    { label: "Colesterol total", value: "157 mg/dL" },
    { label: "HDL", value: "60 mg/dL" },
    { label: "HbA1c", value: "6.2%" },
    { label: "Sexo reportado", value: "Femenino reportado" },
    { label: "Grupo étnico (NHANES)", value: "Negro no hispano" },
  ],
  factors: [
    { label: "Edad", value: "66 años", direction: "raises_risk" },
    { label: "HDL", value: "60 mg/dL", direction: "lowers_risk" },
    { label: "Colesterol total", value: "157 mg/dL", direction: "raises_risk" },
  ],
  questions: [
    "¿Conviene medir presión en casa durante varios días?",
    "¿Estos valores requieren seguimiento?",
    "¿Con qué frecuencia repetir controles?",
  ],
  warning:
    "Advertencia: este resumen no diagnostica hipertensión ni reemplaza una consulta médica. La presión arterial debe confirmarse con mediciones reales y evaluación profesional.",
};

describe("createSummaryPdf", () => {
  it("creates a single-page PDF with the formal consultation structure", () => {
    const pdf = createSummaryPdf(summaryFixture);

    expect(pdf).toMatch(/^%PDF-1\.4/);
    expect(pdf).toContain("/Count 1");
    expect(pdf).toContain("/WinAnsiEncoding");
    expect(pdf).toContain("Resumen orientativo para consulta");
    expect(pdf).toContain("Presi\\363n Bajo Control");
    expect(pdf).toContain("IDENTIFICACI\\323N PARA CONSULTA");
    expect(pdf).toContain("Paciente");
    expect(pdf).toContain("DNI / HC");
    expect(pdf).toContain("Profesional");
    expect(pdf).toContain("Diagn\\363stico cl\\355nico");
    expect(pdf).toContain("Indicaciones / plan para paciente");
    expect(pdf).toContain("Pr\\363ximo control");
    expect(pdf).toContain("Firma y sello");
  });

  it("includes model estimates, loaded data, factors, and the no-diagnosis warning", () => {
    const pdf = createSummaryPdf(summaryFixture);

    expect(pdf).toContain("ESTIMACI\\323N DEL MODELO");
    expect(pdf).toContain("72%");
    expect(pdf).toContain("Umbral");
    expect(pdf).toContain("50%");
    expect(pdf).toContain("Edad:");
    expect(pdf).toContain("66 a\\361os");
    expect(pdf).toContain("Colesterol total");
    expect(pdf).toContain("FACTORES PRINCIPALES");
    expect(pdf).toContain("Sube la estimaci\\363n");
    expect(pdf).toContain("Baja la estimaci\\363n");
    expect(pdf).toContain("no diagnostica hipertensi\\363n");
  });
});
