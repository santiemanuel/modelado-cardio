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

export function calculateBmi(form: Pick<FormState, "BMXWT" | "BMXHT">): number | null {
  const weightKg = parseNumericValue(form.BMXWT);
  const heightCm = parseNumericValue(form.BMXHT);
  if (form.BMXWT === "" || form.BMXHT === "" || Number.isNaN(weightKg) || Number.isNaN(heightCm)) {
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
      errors.BMXWT = "El IMC calculado debe estar entre 10 y 80 kg/m². Revisá peso y altura.";
      errors.BMXHT = "El IMC calculado debe estar entre 10 y 80 kg/m². Revisá peso y altura.";
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
