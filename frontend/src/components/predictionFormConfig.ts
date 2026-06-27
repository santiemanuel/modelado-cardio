import type { PredictionPayload, SimplePredictionPayload } from "../api";
import { localResources } from "../content/siteContent";

export type FormState = {
  RIDAGEYR: string;
  BMXWT: string;
  BMXHT: string;
  BMXWAIST: string;
  LBXTC: string;
  LBDHDD: string;
  LBXGH: string;
  sex: PredictionPayload["sex"];
  race_ethnicity: PredictionPayload["race_ethnicity"];
  current_smoker: "0.0" | "1.0";
};

export type EvaluationMode = "complete" | "simple";

export type NumericFieldKey = keyof Pick<
  FormState,
  "RIDAGEYR" | "BMXWT" | "BMXHT" | "BMXWAIST" | "LBXTC" | "LBDHDD" | "LBXGH"
>;

export const initialForm: FormState = {
  RIDAGEYR: "",
  BMXWT: "",
  BMXHT: "",
  BMXWAIST: "",
  LBXTC: "",
  LBDHDD: "",
  LBXGH: "",
  sex: "Female",
  race_ethnicity: "Non-Hispanic White",
  current_smoker: "0.0",
};

export const raceOptions: Array<{
  value: PredictionPayload["race_ethnicity"];
  label: string;
}> = [
  { value: "Mexican American", label: "Mexicano estadounidense" },
  { value: "Non-Hispanic Asian", label: "Asiático no hispano" },
  { value: "Non-Hispanic Black", label: "Negro no hispano" },
  { value: "Non-Hispanic White", label: "Blanco no hispano" },
  { value: "Other Hispanic", label: "Otro origen hispano" },
  { value: "Other Race / Multi-Racial", label: "Otra raza o multirracial" },
];

export const numericFields: Array<{
  key: NumericFieldKey;
  label: string;
  unit: string;
  hint: string;
  validationName: string;
  min: number;
  max: number;
  step: string;
}> = [
  {
    key: "RIDAGEYR",
    label: "Edad",
    unit: "años",
    hint: "Ingresá tu edad en años cumplidos.",
    validationName: "la edad",
    min: 20,
    max: 120,
    step: "1",
  },
  {
    key: "BMXWT",
    label: "Peso",
    unit: "kg",
    hint: "Usá una medición reciente.",
    validationName: "el peso",
    min: 30,
    max: 250,
    step: "0.1",
  },
  {
    key: "BMXHT",
    label: "Altura",
    unit: "cm",
    hint: "Ingresá altura en centímetros.",
    validationName: "la altura",
    min: 120,
    max: 230,
    step: "0.1",
  },
  {
    key: "BMXWAIST",
    label: "Perímetro de cintura",
    unit: "cm",
    hint: "Medición alrededor del abdomen.",
    validationName: "la cintura",
    min: 40,
    max: 220,
    step: "0.1",
  },
  {
    key: "LBXTC",
    label: "Colesterol total",
    unit: "mg/dL",
    hint: "Dato del perfil lipídico.",
    validationName: "el colesterol total",
    min: 50,
    max: 500,
    step: "0.1",
  },
  {
    key: "LBDHDD",
    label: "HDL",
    unit: "mg/dL",
    hint: "Conocido como colesterol bueno.",
    validationName: "el HDL",
    min: 5,
    max: 200,
    step: "0.1",
  },
  {
    key: "LBXGH",
    label: "Hemoglobina glicosilada / HbA1c",
    unit: "%",
    hint: "Refleja el promedio de glucosa de los últimos meses.",
    validationName: "la hemoglobina glicosilada",
    min: 3,
    max: 20,
    step: "0.1",
  },
];

export const fieldGroups: Array<{
  title: string;
  description: string;
  fields: NumericFieldKey[];
}> = [
  {
    title: "Mediciones corporales",
    description: "El IMC se calcula con peso y altura; no hace falta ingresarlo a mano.",
    fields: ["RIDAGEYR", "BMXWT", "BMXHT", "BMXWAIST"],
  },
  {
    title: "Laboratorio",
    description: "Marcadores metabólicos usados como señales indirectas.",
    fields: ["LBXTC", "LBDHDD", "LBXGH"],
  },
];

export const testProfiles: Array<{
  id: string;
  label: string;
  description: string;
  values: FormState;
}> = [
  {
    id: "routine",
    label: "Control habitual",
    description: "Valores completos para probar una lectura preventiva.",
    values: {
      RIDAGEYR: "42",
      BMXWT: "67.5",
      BMXHT: "165",
      BMXWAIST: "84",
      LBXTC: "178",
      LBDHDD: "52",
      LBXGH: "5.4",
      sex: "Female",
      race_ethnicity: "Non-Hispanic White",
      current_smoker: "0.0",
    },
  },
  {
    id: "signals",
    label: "Más señales",
    description: "Caso útil para revisar cómo responde el modelo ante más factores.",
    values: {
      RIDAGEYR: "66",
      BMXWT: "90.5",
      BMXHT: "169",
      BMXWAIST: "101.8",
      LBXTC: "157",
      LBDHDD: "60",
      LBXGH: "6.2",
      sex: "Female",
      race_ethnicity: "Non-Hispanic Black",
      current_smoker: "0.0",
    },
  },
  {
    id: "smoking",
    label: "Tabaquismo actual",
    description: "Perfil completo para ensayar el factor de tabaquismo.",
    values: {
      RIDAGEYR: "58",
      BMXWT: "88",
      BMXHT: "176",
      BMXWAIST: "96",
      LBXTC: "220",
      LBDHDD: "38",
      LBXGH: "5.9",
      sex: "Male",
      race_ethnicity: "Other Hispanic",
      current_smoker: "1.0",
    },
  },
];

export const labDirectoryCenters = localResources;

export function parseNumericValue(value: string): number {
  return Number(value.trim().replace(",", "."));
}

function hasThreeWholeCentimeterDigits(value: string): boolean {
  const wholeCentimeters = value.trim().split(/[,.]/)[0] ?? "";
  return wholeCentimeters.replace(/\D/g, "").length >= 3;
}

export function calculateBmi(form: Pick<FormState, "BMXWT" | "BMXHT">): number | null {
  const weightKg = parseNumericValue(form.BMXWT);
  const heightCm = parseNumericValue(form.BMXHT);
  if (form.BMXWT === "" || form.BMXHT === "" || Number.isNaN(weightKg) || Number.isNaN(heightCm)) {
    return null;
  }
  if (!hasThreeWholeCentimeterDigits(form.BMXHT)) {
    return null;
  }

  const heightMeters = heightCm / 100;
  if (heightMeters <= 0) {
    return null;
  }

  return Math.round((weightKg / heightMeters ** 2) * 10) / 10;
}

export function formatBmi(value: number | null): string {
  return value === null ? "-" : value.toFixed(1);
}

const bodyCompatibilityFields: NumericFieldKey[] = ["BMXWT", "BMXHT", "BMXWAIST"];
const bodyCompatibilityMessage =
  "Los datos cargados no parecen compatibles entre sí. Revisá especialmente peso, altura y perímetro de cintura.";
const lipidCompatibilityFields: NumericFieldKey[] = ["LBXTC", "LBDHDD"];

const waistByBmiRanges: Array<{
  minBmi: number;
  maxBmi: number;
  minWaist: number;
  maxWaist: number;
}> = [
  { minBmi: 0, maxBmi: 18.5, minWaist: 55, maxWaist: 90 },
  { minBmi: 18.5, maxBmi: 25, minWaist: 60, maxWaist: 110 },
  { minBmi: 25, maxBmi: 30, minWaist: 72, maxWaist: 125 },
  { minBmi: 30, maxBmi: 35, minWaist: 82, maxWaist: 138 },
  { minBmi: 35, maxBmi: 40, minWaist: 90, maxWaist: 150 },
  { minBmi: 40, maxBmi: 50, minWaist: 98, maxWaist: 166 },
  { minBmi: 50, maxBmi: 80, minWaist: 110, maxWaist: 185 },
];

function getWaistRangeForBmi(bmi: number) {
  return waistByBmiRanges.find((range) => bmi >= range.minBmi && bmi < range.maxBmi) ?? null;
}

function getBodyCompatibilityError(
  form: FormState,
  existingErrors: Partial<Record<NumericFieldKey, string>>,
): string | null {
  if (bodyCompatibilityFields.some((field) => existingErrors[field])) {
    return null;
  }

  const bmi = calculateBmi(form);
  const waist = parseNumericValue(form.BMXWAIST);
  if (bmi === null || Number.isNaN(waist)) {
    return null;
  }

  const expectedWaistRange = getWaistRangeForBmi(bmi);
  if (!expectedWaistRange) {
    return null;
  }

  if (waist < expectedWaistRange.minWaist || waist > expectedWaistRange.maxWaist) {
    return bodyCompatibilityMessage;
  }

  return null;
}

function getLipidCompatibilityError(
  form: FormState,
  existingErrors: Partial<Record<NumericFieldKey, string>>,
): string | null {
  if (lipidCompatibilityFields.some((field) => existingErrors[field])) {
    return null;
  }

  const totalCholesterol = parseNumericValue(form.LBXTC);
  const hdl = parseNumericValue(form.LBDHDD);
  if (Number.isNaN(totalCholesterol) || Number.isNaN(hdl) || totalCholesterol <= 0) {
    return null;
  }

  if (hdl > totalCholesterol) {
    return "Los datos de laboratorio no parecen compatibles entre sí. El HDL no debería superar el colesterol total.";
  }

  const nonHdl = totalCholesterol - hdl;
  if (nonHdl < 20) {
    return "Revisá colesterol total y HDL: la diferencia entre ambos es inusualmente baja.";
  }

  const hdlTotalRatio = hdl / totalCholesterol;
  if (hdlTotalRatio < 0.06 || hdlTotalRatio > 0.75) {
    return "La relación entre colesterol total y HDL es poco habitual. Revisá si ambos valores están en mg/dL.";
  }

  return null;
}

export function validateNumericFieldMap(
  form: FormState,
  fields: NumericFieldKey[],
): Partial<Record<NumericFieldKey, string>> {
  const errors: Partial<Record<NumericFieldKey, string>> = {};

  for (const field of numericFields.filter((numericField) => fields.includes(numericField.key))) {
    const value = parseNumericValue(form[field.key]);
    if (form[field.key] === "" || Number.isNaN(value)) {
      errors[field.key] = `Ingresá un valor válido para ${field.validationName}.`;
      continue;
    }
    if (value < field.min || value > field.max) {
      errors[field.key] = `${field.label} debe estar entre ${field.min} y ${field.max} ${field.unit}.`;
    }
  }

  if (fields.includes("BMXWT") || fields.includes("BMXHT")) {
    const bmi = calculateBmi(form);
    if (bmi === null) {
      if (!errors.BMXWT) {
        errors.BMXWT = "Ingresá peso para calcular el IMC.";
      }
      if (!errors.BMXHT) {
        errors.BMXHT = "Ingresá altura para calcular el IMC.";
      }
    }
    if (bmi !== null && (bmi < 10 || bmi > 80)) {
      if (!errors.BMXWT) {
        errors.BMXWT = "El IMC calculado debe estar entre 10 y 80 kg/m². Revisá peso y altura.";
      }
      if (!errors.BMXHT) {
        errors.BMXHT = "El IMC calculado debe estar entre 10 y 80 kg/m². Revisá peso y altura.";
      }
    }
  }

  if (bodyCompatibilityFields.every((field) => fields.includes(field))) {
    const compatibilityError = getBodyCompatibilityError(form, errors);
    if (compatibilityError) {
      for (const field of bodyCompatibilityFields) {
        errors[field] = compatibilityError;
      }
    }
  }

  if (lipidCompatibilityFields.every((field) => fields.includes(field))) {
    const compatibilityError = getLipidCompatibilityError(form, errors);
    if (compatibilityError) {
      for (const field of lipidCompatibilityFields) {
        errors[field] = compatibilityError;
      }
    }
  }

  return errors;
}

export function validateNumericFields(form: FormState, fields: NumericFieldKey[]): string | null {
  const errors = validateNumericFieldMap(form, fields);
  const firstError = fields.map((field) => errors[field]).find(Boolean);
  if (firstError) {
    return firstError;
  }
  return null;
}

export function toPredictionPayload(form: FormState): PredictionPayload {
  const bmi = calculateBmi(form);
  return {
    RIDAGEYR: parseNumericValue(form.RIDAGEYR),
    BMXBMI: bmi ?? Number.NaN,
    BMXWAIST: parseNumericValue(form.BMXWAIST),
    LBXTC: parseNumericValue(form.LBXTC),
    LBDHDD: parseNumericValue(form.LBDHDD),
    LBXGH: parseNumericValue(form.LBXGH),
    sex: form.sex,
    race_ethnicity: form.race_ethnicity,
    current_smoker: Number(form.current_smoker) as 0.0 | 1.0,
  };
}

export function toSimplePredictionPayload(form: FormState): SimplePredictionPayload {
  const bmi = calculateBmi(form);
  return {
    RIDAGEYR: parseNumericValue(form.RIDAGEYR),
    BMXBMI: bmi ?? Number.NaN,
    BMXWAIST: parseNumericValue(form.BMXWAIST),
    sex: form.sex,
    race_ethnicity: form.race_ethnicity,
    current_smoker: Number(form.current_smoker) as 0.0 | 1.0,
  };
}

export function validateForm(form: FormState, mode: EvaluationMode = "complete"): string | null {
  const fields =
    mode === "simple"
      ? fieldGroups[0].fields
      : numericFields.map((field) => field.key);
  return validateNumericFields(form, fields);
}
