import type { PredictionPayload } from "../api";

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
  hint: string;
  validationName: string;
  min: number;
  max: number;
  step: string;
}> = [
  {
    key: "RIDAGEYR",
    label: "Edad",
    hint: "20 a 120 años",
    validationName: "la edad",
    min: 20,
    max: 120,
    step: "1",
  },
  {
    key: "BMXWT",
    label: "Peso",
    hint: "30 a 250 kg",
    validationName: "el peso",
    min: 30,
    max: 250,
    step: "0.1",
  },
  {
    key: "BMXHT",
    label: "Altura",
    hint: "120 a 230 cm",
    validationName: "la altura",
    min: 120,
    max: 230,
    step: "0.1",
  },
  {
    key: "BMXWAIST",
    label: "Cintura",
    hint: "40 a 220 cm",
    validationName: "la cintura",
    min: 40,
    max: 220,
    step: "0.1",
  },
  {
    key: "LBXTC",
    label: "Colesterol total",
    hint: "50 a 500 mg/dL",
    validationName: "el colesterol total",
    min: 50,
    max: 500,
    step: "0.1",
  },
  {
    key: "LBDHDD",
    label: "HDL",
    hint: "5 a 200 mg/dL",
    validationName: "el HDL",
    min: 5,
    max: 200,
    step: "0.1",
  },
  {
    key: "LBXGH",
    label: "Hemoglobina glicosilada",
    hint: "3 a 20 %",
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

export const labDirectoryCenters = [
  {
    name: "Hospital Público Materno Infantil",
    kind: "Público",
    address: "Av. Sarmiento 1301",
    evidence: "Unidad de laboratorio con determinaciones de rutina, baja y alta complejidad.",
    sourceLabel: "Gobierno de Salta",
    sourceUrl:
      "https://www.salta.gob.ar/prensa/noticias/en-el-ultimo-anio-el-laboratorio-del-materno-infantil-realizo-casi-un-millon-de-analisis-94645",
  },
  {
    name: "Hospital San Bernardo",
    kind: "Público",
    address: "José Tobías 69 / Mariano Boedo 51",
    evidence: "Carta de servicios con laboratorios bioquímicos, microbiología y hematología.",
    sourceLabel: "Boletín Oficial de Salta",
    sourceUrl:
      "https://boletinoficialsalta.gob.ar/instrumento.php?cXdlcnR5dGFibGE9UnwyMTFELzA2JmRhdGE9MTc0MTRxd2VydHk=",
  },
  {
    name: "Hospital Señor del Milagro",
    kind: "Público",
    address: "Av. Sarmiento 557",
    evidence: "Cuenta con laboratorio central y áreas de laboratorio especializadas.",
    sourceLabel: "Gobierno de Salta",
    sourceUrl:
      "https://www.salta.gob.ar/prensa/noticias/el-hospital-del-senior-del-milagro-cumple-130-anios-junto-a-los-saltenios-101089",
  },
  {
    name: "Hospital Dr. Arturo Oñativia",
    kind: "Público",
    address: "E. Paz Chain 30",
    evidence: "Laboratorio bioquímico con toma de muestras para pacientes externos.",
    sourceLabel: "Hospital Oñativia",
    sourceUrl: "https://www.hospitalonativia.gob.ar/?page_id=200",
  },
  {
    name: "Hospital Papa Francisco",
    kind: "Público",
    address: "B° Solidaridad",
    evidence: "Figura en registros oficiales con servicio de laboratorio.",
    sourceLabel: "Argentina.gob.ar",
    sourceUrl: "https://www.argentina.gob.ar/salud/celiaquia/servicios/salta",
  },
  {
    name: "CIACLAB",
    kind: "Privado",
    address: "Santiago del Estero 449",
    evidence: "Laboratorio de análisis clínicos en Salta Capital; incluye química clínica.",
    sourceLabel: "CIAC Salta",
    sourceUrl: "https://ciacsalta.com.ar/laboratorio/",
  },
  {
    name: "MAS Medicina Ambulatoria Salta",
    kind: "Privado",
    address: "Buenos Aires 196",
    evidence: "Laboratorio de alta complejidad con análisis clínicos y química clínica.",
    sourceLabel: "MAS Salta",
    sourceUrl: "https://massalta.com.ar/laboratorio/",
  },
  {
    name: "Clínica del Centro",
    kind: "Privado",
    address: "Gral. Alvarado 858",
    evidence: "Centro privado con laboratorio clínico de alta complejidad.",
    sourceLabel: "Clínica del Centro",
    sourceUrl: "https://clinicadelcentrosalta.com.ar/",
  },
];

export function calculateBmi(form: Pick<FormState, "BMXWT" | "BMXHT">): number | null {
  const weightKg = Number(form.BMXWT);
  const heightCm = Number(form.BMXHT);
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

export function validateNumericFields(form: FormState, fields: NumericFieldKey[]): string | null {
  for (const field of numericFields.filter((numericField) => fields.includes(numericField.key))) {
    const value = Number(form[field.key]);
    if (form[field.key] === "" || Number.isNaN(value)) {
      return `Ingresá un valor válido para ${field.validationName}.`;
    }
    if (value < field.min || value > field.max) {
      return `${field.label} debe estar entre ${field.min} y ${field.max}.`;
    }
  }

  if (fields.includes("BMXWT") || fields.includes("BMXHT")) {
    const bmi = calculateBmi(form);
    if (bmi === null) {
      return "Ingresá peso y altura para calcular el IMC.";
    }
    if (bmi < 10 || bmi > 80) {
      return "El IMC calculado debe estar entre 10 y 80 kg/m².";
    }
  }

  return null;
}

export function toPredictionPayload(form: FormState): PredictionPayload {
  const bmi = calculateBmi(form);
  return {
    RIDAGEYR: Number(form.RIDAGEYR),
    BMXBMI: bmi ?? Number.NaN,
    BMXWAIST: Number(form.BMXWAIST),
    LBXTC: Number(form.LBXTC),
    LBDHDD: Number(form.LBDHDD),
    LBXGH: Number(form.LBXGH),
    sex: form.sex,
    race_ethnicity: form.race_ethnicity,
    current_smoker: Number(form.current_smoker) as 0.0 | 1.0,
  };
}

export function validateForm(form: FormState): string | null {
  return validateNumericFields(
    form,
    numericFields.map((field) => field.key),
  );
}
