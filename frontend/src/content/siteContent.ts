import type { PredictionPayload } from "../api";

export const routes = [
  { path: "/", label: "Inicio" },
  { path: "/evaluar", label: "Evaluar señales" },
  { path: "/historial", label: "Historial" },
  { path: "/modelo", label: "Modelo" },
  { path: "/educacion", label: "Educación" },
  { path: "/recursos", label: "Recursos" },
  { path: "/faq", label: "FAQ" },
  { path: "/metodologia", label: "Metodología" },
  { path: "/privacidad", label: "Privacidad" },
  { path: "/404", label: "Página no encontrada" },
] as const;

export const disclaimers = {
  short: "Resultado orientativo. No reemplaza medición de presión arterial ni consulta médica.",
  long:
    "Esta estimación se basa en señales indirectas. No confirma ni descarta hipertensión. Para interpretar tu situación necesitás mediciones reales de presión arterial, contexto clínico y evaluación profesional.",
  emergency:
    "Si tenés síntomas preocupantes o una medición de presión extremadamente elevada, buscá atención médica urgente por los canales locales.",
};

export const resultRanges = [
  {
    min: 0,
    max: 24,
    label: "Prioridad baja",
    tone: "green",
    interpretation:
      "Las señales cargadas no sugieren prioridad alta, pero siguen siendo una lectura orientativa.",
    nextStep: "Mantené controles habituales y medí tu presión cuando corresponda.",
    nextSteps: [
      "Mantené controles habituales.",
      "Medí tu presión en una oportunidad adecuada.",
      "Llevá tus datos a la próxima consulta si tenés dudas o antecedentes.",
    ],
    disclaimer: "Un resultado bajo no descarta hipertensión.",
  },
  {
    min: 25,
    max: 49,
    label: "Prioridad moderada",
    tone: "yellow",
    interpretation:
      "Hay señales que conviene revisar con más atención, especialmente si tenés mediciones previas elevadas.",
    nextStep:
      "Agendá una consulta de control o repetí mediciones de presión si ya tenés registros.",
    nextSteps: [
      "Repetí mediciones de presión en condiciones de reposo.",
      "Organizá los datos de laboratorio y mediciones corporales.",
      "Consultá si aparecen registros elevados o síntomas.",
    ],
    disclaimer: "La prioridad moderada no confirma ni descarta hipertensión.",
  },
  {
    min: 50,
    max: 74,
    label: "Prioridad alta",
    tone: "red",
    interpretation:
      "El modelo detecta una combinación de señales que amerita priorizar una revisión clínica.",
    nextStep:
      "Priorizá una medición correcta de presión arterial y conversá con un profesional.",
    nextSteps: [
      "Medí presión arterial con técnica correcta.",
      "Priorizá una consulta de control con tus registros.",
      "No tomes decisiones de medicación solo con esta evaluación.",
    ],
    disclaimer: "Un resultado alto no confirma hipertensión.",
  },
  {
    min: 75,
    max: 100,
    label: "Prioridad muy alta",
    tone: "red",
    interpretation:
      "La probabilidad orientativa es muy alta y no debería manejarse solo con esta herramienta.",
    nextStep:
      "Buscá evaluación médica pronta; si hay síntomas o presión medida muy elevada, usá los canales de urgencia locales.",
    nextSteps: [
      "Buscá evaluación médica pronta.",
      "Si hay síntomas preocupantes o presión muy elevada medida, usá canales de urgencia.",
      "Compartí mediciones reales y datos cargados con el equipo de salud.",
    ],
    disclaimer: "Un resultado muy alto no reemplaza confirmación profesional.",
  },
] as const;

export type ResultRange = (typeof resultRanges)[number];

export function getResultRange(probability: number): ResultRange {
  const percent = Math.round(probability * 100);
  return (
    resultRanges.find((range) => percent >= range.min && percent <= range.max) ??
    resultRanges[resultRanges.length - 1]
  );
}

export const modelVisibleFields = [
  { label: "Edad", code: "RIDAGEYR", detail: "Años cumplidos; población adulta de 20 años o más." },
  { label: "IMC", code: "BMXBMI", detail: "Calculado desde peso y altura." },
  { label: "Cintura", code: "BMXWAIST", detail: "Perímetro de cintura en centímetros." },
  { label: "Colesterol total", code: "LBXTC", detail: "Marcador de laboratorio en mg/dL." },
  { label: "HDL", code: "LBDHDD", detail: "Colesterol HDL en mg/dL." },
  { label: "HbA1c", code: "LBXGH", detail: "Hemoglobina glicosilada en porcentaje." },
  { label: "Sexo reportado", code: "sex", detail: "Categoría usada por la encuesta NHANES." },
  {
    label: "Grupo étnico reportado",
    code: "race_ethnicity",
    detail: "Categorías de la encuesta NHANES 2017-2018 de Estados Unidos.",
  },
  {
    label: "Fumador actual",
    code: "current_smoker",
    detail: "Respuesta declarada sobre tabaquismo actual.",
  },
] as const;

export const neededDataGroups = [
  {
    title: "Mediciones corporales",
    items: [
      { label: "Edad", detail: "años cumplidos" },
      { label: "Peso", detail: "kg" },
      { label: "Altura", detail: "cm" },
      { label: "Cintura", detail: "cm" },
    ],
  },
  {
    title: "Laboratorio reciente",
    items: [
      { label: "Colesterol total", detail: "mg/dL" },
      { label: "HDL", detail: "mg/dL" },
      { label: "HbA1c", detail: "%" },
    ],
  },
  {
    title: "Contexto declarado",
    items: [
      { label: "Sexo reportado", detail: "categoría NHANES" },
      { label: "Grupo étnico reportado", detail: "categoría NHANES" },
      { label: "Tabaquismo actual", detail: "sí o no" },
    ],
  },
] as const;

export const resultFactorGroups = {
  complete: [
    "edad",
    "IMC calculado",
    "perímetro de cintura",
    "colesterol total",
    "HDL",
    "HbA1c",
    "sexo reportado",
    "grupo étnico reportado",
    "tabaquismo actual",
  ],
  simple: [
    "edad",
    "IMC calculado",
    "perímetro de cintura",
    "sexo reportado",
    "grupo étnico reportado",
    "tabaquismo actual",
  ],
} as const;

export const methodologyTopics = [
  {
    title: "Dataset",
    body:
      "El modelo se entrenó con NHANES 2017-2018, una encuesta de salud y nutrición de Estados Unidos. Por eso el uso fuera de esa población debe interpretarse con cautela.",
    sourceIds: ["S8", "S9"],
  },
  {
    title: "Etiqueta de referencia",
    body:
      "La etiqueta combina señales de presión arterial y respuestas de la encuesta. Esas señales ayudan a construir el objetivo, pero no se piden como entradas del modelo.",
    sourceIds: ["S11", "S12"],
  },
  {
    title: "Datos de entrada",
    body:
      "La evaluación usa edad, IMC, cintura, laboratorio cuando está disponible, sexo reportado, grupo étnico reportado y tabaquismo actual.",
    sourceIds: ["S9", "S10", "S13", "S14", "S15", "S16"],
  },
  {
    title: "Fuga de información",
    body:
      "Se excluyen mediciones directas de presión arterial, diagnóstico previo y medicación antihipertensiva para evitar que el resultado dependa de datos que ya revelan la condición.",
    sourceIds: ["S11", "S12"],
  },
  {
    title: "Pesos muestrales",
    body:
      "Las métricas usan WTMEC2YR para respetar mejor el diseño poblacional del ciclo. Esto no reemplaza una validación clínica externa ni prospectiva.",
    sourceIds: ["S9"],
  },
] as const;

export const clinicalReadinessItems = [
  "Validación externa en población local antes de uso clínico real.",
  "Revisión clínica, ética y legal del flujo completo.",
  "Monitoreo de desempeño y sesgos con datos representativos.",
  "Proceso documentado para cambios de modelo, umbrales y copy visible.",
  "Privacidad, consentimiento y trazabilidad adecuados al contexto de uso.",
] as const;

export const forbiddenFeatures = [
  "BPXSY1",
  "BPXSY2",
  "BPXSY3",
  "BPXSY4",
  "BPXDI1",
  "BPXDI2",
  "BPXDI3",
  "BPXDI4",
  "sbp_mean",
  "dbp_mean",
  "BPQ020",
  "BPQ050A",
  "hbp_med_current",
];

export const localResources = [
  {
    name: "Hospital Público Materno Infantil",
    kind: "Público",
    address: "Av. Sarmiento 1301",
    evidence: "Unidad de laboratorio con determinaciones de rutina, baja y alta complejidad.",
    servicesMentioned: ["Laboratorio", "Determinaciones de rutina"],
    questionsToConfirm: ["Colesterol total", "HDL", "HbA1c", "Pedido médico", "Turno"],
    scheduleNote: "Confirmar horarios y requisitos antes de concurrir.",
    contact: {
      phones: [
        { label: "0800-555-7755", href: "tel:08005557755" },
        { label: "0387 4325000", href: "tel:+543874325000" },
      ],
      whatsapps: [{ label: "387 5863132", href: "https://wa.me/5493875863132" }],
    },
    sourceLabel: "Gobierno de Salta",
    sourceUrl:
      "https://www.salta.gob.ar/prensa/noticias/en-el-ultimo-anio-el-laboratorio-del-materno-infantil-realizo-casi-un-millon-de-analisis-94645",
  },
  {
    name: "Hospital San Bernardo",
    kind: "Público",
    address: "José Tobías 69 / Mariano Boedo 51",
    evidence: "Carta de servicios con laboratorios bioquímicos, microbiología y hematología.",
    servicesMentioned: ["Bioquímica", "Microbiología", "Hematología"],
    questionsToConfirm: ["Colesterol total", "HDL", "HbA1c", "Pedido médico", "Turno"],
    scheduleNote: "Confirmar sede, horarios y requisitos administrativos.",
    contact: {
      phones: [
        { label: "148", href: "tel:148" },
        { label: "0387 4320300", href: "tel:+543874320300" },
      ],
      whatsapps: [
        { label: "387 3022001", href: "https://wa.me/5493873022001" },
        { label: "387 3013672", href: "https://wa.me/5493873013672" },
      ],
    },
    sourceLabel: "Boletín Oficial de Salta",
    sourceUrl:
      "https://boletinoficialsalta.gob.ar/instrumento.php?cXdlcnR5dGFibGE9UnwyMTFELzA2JmRhdGE9MTc0MTRxd2VydHk=",
  },
  {
    name: "Hospital Señor del Milagro",
    kind: "Público",
    address: "Av. Sarmiento 557",
    evidence: "Cuenta con laboratorio central y áreas de laboratorio especializadas.",
    servicesMentioned: ["Laboratorio central", "Áreas especializadas"],
    questionsToConfirm: ["Colesterol total", "HDL", "HbA1c", "Pedido médico", "Turno"],
    scheduleNote: "Confirmar prestaciones disponibles para pacientes externos.",
    contact: {
      phones: [
        { label: "148", href: "tel:148" },
        { label: "0800-777-6452", href: "tel:08007776452" },
      ],
      whatsapps: [{ label: "387 4583032", href: "https://wa.me/5493874583032" }],
    },
    sourceLabel: "Gobierno de Salta",
    sourceUrl:
      "https://www.salta.gob.ar/prensa/noticias/el-hospital-del-senior-del-milagro-cumple-130-anios-junto-a-los-saltenios-101089",
  },
  {
    name: "Hospital Dr. Arturo Oñativia",
    kind: "Público",
    address: "E. Paz Chain 30",
    evidence: "Laboratorio bioquímico con toma de muestras para pacientes externos.",
    servicesMentioned: ["Laboratorio bioquímico", "Toma de muestras"],
    questionsToConfirm: ["Colesterol total", "HDL", "HbA1c", "Pedido médico", "Turno"],
    scheduleNote: "Confirmar atención para pacientes externos.",
    contact: {
      phones: [
        { label: "148", href: "tel:148" },
        { label: "0387 4315042", href: "tel:+543874315042" },
      ],
      whatsapps: [{ label: "387 4145225", href: "https://wa.me/5493874145225" }],
    },
    sourceLabel: "Hospital Oñativia",
    sourceUrl: "https://www.hospitalonativia.gob.ar/?page_id=200",
  },
  {
    name: "Hospital Papa Francisco",
    kind: "Público",
    address: "B° Solidaridad",
    evidence: "Figura en registros oficiales con servicio de laboratorio.",
    servicesMentioned: ["Laboratorio"],
    questionsToConfirm: ["Colesterol total", "HDL", "HbA1c", "Pedido médico", "Turno"],
    scheduleNote: "Confirmar prestaciones y requisitos antes de concurrir.",
    contact: {
      phones: [{ label: "0387 4385616", href: "tel:+543874385616" }],
    },
    sourceLabel: "Argentina.gob.ar",
    sourceUrl: "https://www.argentina.gob.ar/salud/celiaquia/servicios/salta",
  },
  {
    name: "CIACLAB",
    kind: "Privado",
    address: "Santiago del Estero 449",
    evidence: "Laboratorio de análisis clínicos en Salta Capital; incluye química clínica.",
    servicesMentioned: ["Análisis clínicos", "Química clínica"],
    questionsToConfirm: ["Colesterol total", "HDL", "HbA1c", "Ayuno", "Obra social"],
    scheduleNote: "Confirmar horarios, ayuno y cobertura.",
    contact: {
      phones: [{ label: "387 5 125 955", href: "tel:+543875125955" }],
      whatsapps: [{ label: "387 5 125 955", href: "https://wa.me/5493875125955" }],
    },
    sourceLabel: "CIAC Salta",
    sourceUrl: "https://ciacsalta.com.ar/laboratorio/",
  },
  {
    name: "MAS Medicina Ambulatoria Salta",
    kind: "Privado",
    address: "Buenos Aires 196",
    evidence: "Laboratorio de alta complejidad con análisis clínicos y química clínica.",
    servicesMentioned: ["Alta complejidad", "Análisis clínicos", "Química clínica"],
    questionsToConfirm: ["Colesterol total", "HDL", "HbA1c", "Ayuno", "Obra social"],
    scheduleNote: "Confirmar horarios, ayuno y cobertura.",
    contact: {
      phones: [{ label: "0387 4311977", href: "tel:+543874311977" }],
      whatsapps: [{ label: "387 5612004", href: "https://wa.me/5493875612004" }],
    },
    sourceLabel: "MAS Salta",
    sourceUrl: "https://massalta.com.ar/laboratorio/",
  },
  {
    name: "Clínica del Centro",
    kind: "Privado",
    address: "Gral. Alvarado 858",
    evidence: "Centro privado con laboratorio clínico de alta complejidad.",
    servicesMentioned: ["Laboratorio clínico", "Alta complejidad"],
    questionsToConfirm: ["Colesterol total", "HDL", "HbA1c", "Ayuno", "Obra social"],
    scheduleNote: "Confirmar horarios, ayuno y cobertura.",
    contact: {
      phones: [
        { label: "0387 4219212", href: "tel:+543874219212" },
        { label: "0387 4219222", href: "tel:+543874219222" },
        { label: "Laboratorio 387 5572887", href: "tel:+543875572887" },
      ],
      whatsapps: [{ label: "387 2219202", href: "https://wa.me/5493872219202" }],
    },
    sourceLabel: "Clínica del Centro",
    sourceUrl: "https://clinicadelcentrosalta.com.ar/",
  },
] as const;

export type LocalResourceKind = "Todos" | (typeof localResources)[number]["kind"];

export const educationSections = [
  {
    title: "Presión arterial",
    body:
      "La presión arterial se expresa con dos números: sistólica y diastólica. La presión alta puede no dar síntomas, por eso la medición real sigue siendo la referencia principal.",
  },
  {
    title: "Cómo medir presión correctamente",
    body:
      "Conviene medir en reposo, con el brazo apoyado y registrar más de una lectura. Revisá la interpretación con un equipo de salud.",
  },
  {
    title: "IMC",
    body:
      "El índice de masa corporal se calcula con peso y altura. Es una medida de orientación y conviene interpretarla junto con otros datos.",
  },
  {
    title: "Cintura",
    body:
      "El perímetro de cintura aporta contexto cardiometabólico. Si la medición es aproximada, conviene confirmarla en un control de salud.",
  },
  {
    title: "Colesterol total y HDL",
    body:
      "El colesterol total y el HDL forman parte del perfil lipídico. En esta herramienta funcionan como señales indirectas, no como diagnóstico aislado.",
  },
  {
    title: "Hemoglobina glicosilada / HbA1c",
    body:
      "La HbA1c refleja el promedio de glucosa de los últimos meses. En el modelo se usa como señal metabólica indirecta.",
  },
  {
    title: "Tabaquismo actual",
    body:
      "El tabaquismo actual se representa como una señal del contexto declarado. No resume por sí solo la historia clínica de una persona.",
  },
] as const;

export const faqItems = [
  {
    question: "¿Esta herramienta diagnostica hipertensión?",
    answer:
      "No. El resultado es una evaluación orientativa basada en señales indirectas. La hipertensión se confirma con mediciones reales de presión arterial y evaluación profesional.",
  },
  {
    question: "¿Un resultado bajo descarta presión alta?",
    answer:
      "No. Un resultado bajo solo indica menor prioridad según los datos cargados. Si tenés mediciones elevadas, síntomas o dudas, priorizá la consulta.",
  },
  {
    question: "¿Qué significa un resultado alto?",
    answer:
      "Significa que el modelo encontró una combinación de señales que conviene revisar con más atención. No confirma hipertensión por sí solo.",
  },
  {
    question: "¿Por qué se piden colesterol total, HDL y HbA1c?",
    answer:
      "Son marcadores metabólicos que ayudan a contextualizar el riesgo cardiometabólico. También existe un modo simple para usar la herramienta sin laboratorio reciente, con la aclaración de que la precisión puede disminuir.",
  },
  {
    question: "¿Qué pasa si no tengo laboratorio reciente?",
    answer:
      "Podés usar el modo simple sin colesterol total, HDL ni HbA1c. Ese modo trabaja con menos información y debe interpretarse con más cautela.",
  },
  {
    question: "¿Puedo usarla si tengo menos de 20 años?",
    answer:
      "No debería usarse en menores de 20 años en esta versión. La población analítica del proyecto está definida para adultos de 20 años o más.",
  },
  {
    question: "¿Puedo usarla durante embarazo?",
    answer:
      "No debería usarse como guía clínica durante embarazo. La presión alta durante embarazo requiere evaluación específica con un equipo de salud.",
  },
  {
    question: "¿Por qué se pregunta grupo étnico reportado?",
    answer:
      "El modelo fue entrenado con categorías disponibles en NHANES 2017-2018, una encuesta de Estados Unidos. La categoría puede no representar perfectamente identidades locales.",
  },
  {
    question: "¿Sirve para personas en Argentina?",
    answer:
      "Puede servir como orientación educativa, pero el modelo no cuenta con validación clínica externa en población argentina. Por eso el resultado debe tomarse con cautela.",
  },
  {
    question: "¿Se guardan mis datos?",
    answer:
      "La evaluación no requiere cuenta. Si elegís guardar un resultado, queda en este dispositivo y podés borrarlo desde la interfaz.",
  },
  {
    question: "¿Puedo usarla si estoy embarazada o tengo una condición particular?",
    answer:
      "La herramienta no reemplaza criterio clínico. En embarazo, síntomas, tratamientos actuales o condiciones particulares, consultá con un equipo de salud.",
  },
] as const;

export const editorialGuidelines = {
  preferredTerms: [
    "evaluación orientativa",
    "señales compatibles",
    "prioridad de revisión",
    "próximos pasos",
  ],
  avoidVisibleClaims: [
    "diagnostica hipertensión",
    "descarta hipertensión",
    "indica medicación",
    "reemplaza consulta médica",
  ],
  tone:
    "Hablarle a la persona que usa la herramienta o quiere entender el modelo, sin notas para desarrollo ni promesas clínicas absolutas.",
} as const;

export type PredictionSummaryInput = {
  probability: number;
  threshold: number;
  modelName: string;
  form: Record<string, string | PredictionPayload[keyof PredictionPayload]>;
  bmi: string;
};
