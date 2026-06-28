import type { PredictionResponse, ShapExplanation } from "../api";

export const HISTORY_KEY = "cardio-screening-history-v1";
export const PRESSURE_RECORDS_KEY = "cardio-screening-pressure-records-v1";

export type HistoryActionId = "nutrition" | "exercise" | "measure";

export type SavedEvaluationMode = "complete" | "simple";

export type SavedInputValue = {
  label: string;
  value: string;
};

export type SavedEvaluation = {
  id: string;
  createdAt: string;
  probability: number;
  threshold: number;
  modelName: string;
  modelVersion?: string;
  riskLabel?: string;
  context?: string;
  mode?: SavedEvaluationMode;
  bmi?: string;
  values: SavedInputValue[];
  result?: PredictionResponse;
  shapExplanations?: ShapExplanation[];
  actions?: HistoryActionId[];
};

export type PressureRecord = {
  id: string;
  date: string;
  time: string;
  systolic: string;
  diastolic: string;
  pulse: string;
  arm: string;
  notes: string;
};

export const historyActionOptions = [
  { id: "nutrition", label: "Alimentación" },
  { id: "exercise", label: "Ejercicio" },
  { id: "measure", label: "Medición" },
] as const satisfies ReadonlyArray<{ id: HistoryActionId; label: string }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function numberOrFallback(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function stringOrFallback(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function isHistoryActionId(value: unknown): value is HistoryActionId {
  return value === "nutrition" || value === "exercise" || value === "measure";
}

function readArray(key: string): unknown[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeArray(key: string, values: unknown[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(values));
}

export function createLocalId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function toLocalDateKey(value: string | Date) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateOnly(value: string | Date) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatTimeOnly(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
  });
}

function normalizeValues(value: unknown): SavedInputValue[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((item) => ({
      label: stringOrFallback(item.label),
      value: stringOrFallback(item.value),
    }))
    .filter((item) => item.label && item.value);
}

function normalizeShapExplanations(value: unknown): ShapExplanation[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((item) => ({
    feature: stringOrFallback(item.feature),
    label: stringOrFallback(item.label),
    value: stringOrFallback(item.value),
    shap_value: numberOrFallback(item.shap_value, 0),
    impact: numberOrFallback(item.impact, 0),
    direction:
      item.direction === "raises_risk" || item.direction === "lowers_risk" || item.direction === "neutral"
        ? item.direction
        : "neutral",
    description: stringOrFallback(item.description),
  }));
}

function normalizePredictionResponse(value: unknown): PredictionResponse | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const probability = numberOrFallback(value.probability, Number.NaN);
  if (!Number.isFinite(probability)) {
    return undefined;
  }

  return {
    probability,
    threshold: numberOrFallback(value.threshold, 0.5),
    prediction: value.prediction === 1 ? 1 : 0,
    risk_label: stringOrFallback(value.risk_label, "Resultado orientativo guardado"),
    context: stringOrFallback(value.context, "Resultado orientativo guardado en este dispositivo."),
    model_name: stringOrFallback(value.model_name, "logistic_regression"),
    model_version: typeof value.model_version === "string" ? value.model_version : undefined,
    mode: value.mode === "simple" ? "simple" : value.mode === "complete" ? "complete" : undefined,
    shap_explanations: normalizeShapExplanations(value.shap_explanations),
    shap_base_value:
      typeof value.shap_base_value === "number" && Number.isFinite(value.shap_base_value)
        ? value.shap_base_value
        : null,
    shap_output_unit: typeof value.shap_output_unit === "string" ? value.shap_output_unit : "log_odds",
  };
}

function normalizeEvaluation(value: unknown, index: number): SavedEvaluation | null {
  if (!isRecord(value)) {
    return null;
  }

  const result = normalizePredictionResponse(value.result);
  const probability = numberOrFallback(value.probability, result?.probability ?? Number.NaN);
  if (!Number.isFinite(probability)) {
    return null;
  }

  const createdAt = stringOrFallback(value.createdAt, new Date(0).toISOString());
  const id = stringOrFallback(value.id, `legacy-${createdAt}-${index}`);
  const shapExplanations =
    result?.shap_explanations?.length ? result.shap_explanations : normalizeShapExplanations(value.shapExplanations);

  return {
    id,
    createdAt,
    probability,
    threshold: numberOrFallback(value.threshold, result?.threshold ?? 0.5),
    modelName: stringOrFallback(value.modelName, result?.model_name ?? "logistic_regression"),
    modelVersion: stringOrFallback(value.modelVersion, result?.model_version),
    riskLabel: stringOrFallback(value.riskLabel, result?.risk_label),
    context: stringOrFallback(value.context, result?.context),
    mode: value.mode === "simple" ? "simple" : value.mode === "complete" ? "complete" : result?.mode,
    bmi: typeof value.bmi === "string" ? value.bmi : undefined,
    values: normalizeValues(value.values),
    result,
    shapExplanations,
    actions: Array.isArray(value.actions) ? value.actions.filter(isHistoryActionId) : [],
  };
}

function normalizePressureRecord(value: unknown, index: number): PressureRecord | null {
  if (!isRecord(value)) {
    return null;
  }

  const date = stringOrFallback(value.date);
  const time = stringOrFallback(value.time);
  const systolic = stringOrFallback(value.systolic);
  const diastolic = stringOrFallback(value.diastolic);
  if (!date || !time || !systolic || !diastolic) {
    return null;
  }

  return {
    id: stringOrFallback(value.id, `pressure-${date}-${time}-${index}`),
    date,
    time,
    systolic,
    diastolic,
    pulse: stringOrFallback(value.pulse),
    arm: stringOrFallback(value.arm, "No informado"),
    notes: stringOrFallback(value.notes),
  };
}

export function readHistory() {
  return readArray(HISTORY_KEY)
    .map(normalizeEvaluation)
    .filter((item): item is SavedEvaluation => item !== null)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function writeHistory(history: SavedEvaluation[]) {
  writeArray(HISTORY_KEY, history);
}

export function readPressureRecords() {
  return readArray(PRESSURE_RECORDS_KEY)
    .map(normalizePressureRecord)
    .filter((item): item is PressureRecord => item !== null)
    .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));
}

export function writePressureRecords(records: PressureRecord[]) {
  writeArray(PRESSURE_RECORDS_KEY, records);
}

export function getPressureRecordsForDate(records: PressureRecord[], date: string) {
  return records.filter((record) => record.date === date).sort((a, b) => a.time.localeCompare(b.time));
}

export function clearAllHistoryData() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(HISTORY_KEY);
  window.localStorage.removeItem(PRESSURE_RECORDS_KEY);
}
