import consultationImage from "../assets/landing/cardio-consultation.png";
import routineImage from "../assets/landing/cardio-routine.png";
import vascularImage from "../assets/landing/vascular-signals.png";

export const assessmentRoute = "/evaluar";

export const navLinks = [
  { href: "#enfoque", label: "Enfoque" },
  { href: "#servicios", label: "Servicios" },
  { href: "#modelo", label: "Modelo" },
  { href: "#cuidado", label: "Cuidado" },
];

export const heroMetrics = [
  { value: "6", label: "variables numéricas" },
  { value: "3", label: "factores categóricos" },
  { value: "0", label: "diagnósticos automáticos" },
];

export const heroImages = [
  {
    className: "pin-card pin-tall",
    src: consultationImage,
    alt: "Profesional de salud revisando señales cardiometabólicas con un paciente",
    caption: "Consulta con datos",
  },
  {
    className: "pin-card pin-square",
    src: routineImage,
    alt: "Tensiómetro digital, cuaderno y hábitos saludables sobre una mesa clara",
    caption: "Medición en rutina",
  },
  {
    className: "pin-card pin-wide",
    src: vascularImage,
    alt: "Ilustración médica de arterias y señales de presión arterial",
    caption: "Señales vasculares",
  },
];

export const serviceCards = [
  {
    title: "Lectura preventiva",
    description:
      "Ordena factores cardiometabólicos antes de que la presión alta se vuelva un dato aislado.",
    icon: "Medir",
  },
  {
    title: "Chequeo regular",
    description:
      "Refuerza la medición periódica como referencia principal para confirmar o descartar hipertensión.",
    icon: "Registrar",
  },
  {
    title: "Conversación clínica",
    description:
      "Prepara una consulta con datos claros, límites del modelo y señales que conviene revisar.",
    icon: "Consultar",
  },
  {
    title: "Resultado orientativo",
    description:
      "Devuelve una probabilidad útil para priorizar próximos pasos, sin reemplazar diagnóstico médico.",
    icon: "Orientar",
  },
];

export const priorityRows = [
  {
    label: "Medición real de presión arterial",
    note: "Referencia principal",
    fill: "100%",
  },
  {
    label: "Contexto cardiometabólico",
    note: "Señales indirectas",
    fill: "78%",
  },
  {
    label: "Consulta profesional",
    note: "Decisión clínica",
    fill: "88%",
  },
];

export const standardsCards = [
  {
    image: routineImage,
    alt: "Elementos de una rutina saludable con tensiómetro y cuaderno de registro",
    title: "Medir y registrar",
    description: "Anotar valores, horarios y contexto evita depender de una única lectura.",
  },
  {
    image: consultationImage,
    alt: "Consulta profesional sobre señales cardiometabólicas",
    title: "Consultar a tiempo",
    description: "El resultado orientativo sirve para preparar preguntas, no para medicarse solo.",
  },
];

export const careMosaicItems = [
  {
    type: "image",
    className: "pin-card mosaic-large",
    image: vascularImage,
    alt: "Vista ilustrada de arterias y flujo sanguíneo",
    caption: "Presión sostenida",
  },
  {
    type: "panel",
    className: "mosaic-panel dark-panel",
    title: "Primero medir",
    description: "La presión arterial se confirma con mediciones reales y seguimiento profesional.",
  },
  {
    type: "panel",
    className: "mosaic-panel red-panel",
    title: "Después ordenar",
    description: "El modelo ayuda a priorizar señales cuando ya tenés datos básicos disponibles.",
  },
  {
    type: "image",
    className: "pin-card mosaic-wide",
    image: consultationImage,
    alt: "Profesional de salud y paciente revisando información de prevención",
    caption: "Conversación clínica",
  },
  {
    type: "panel",
    className: "mosaic-panel soft-panel",
    title: "Sin prometer diagnóstico",
    description: "La inferencia no reemplaza tensiómetro, laboratorio ni criterio médico.",
  },
  {
    type: "image",
    className: "pin-card mosaic-small",
    image: routineImage,
    alt: "Tensiómetro y elementos de hábitos saludables",
    caption: "Hábitos medibles",
  },
] as const;

export const modelSignals = [
  "Edad",
  "IMC",
  "Cintura",
  "Colesterol total",
  "HDL",
  "Hemoglobina glicosilada",
  "Sexo",
  "Etnicidad",
  "Tabaquismo actual",
];
