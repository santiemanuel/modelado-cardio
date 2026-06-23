import consultationImage from "../assets/landing/cardio-consultation.png";
import routineImage from "../assets/landing/cardio-routine.png";
import clinicalReviewImage from "../assets/landing/clinical-review.png";
import habitLogImage from "../assets/landing/habit-log.png";
import bloodPressureImage from "../assets/landing/hero-blood-pressure.png";
import preventionRoutineImage from "../assets/landing/prevention-routine.png";
import vascularPressureImage from "../assets/landing/vascular-pressure-abstract.png";
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
    src: bloodPressureImage,
    alt: "Persona midiendo su presión arterial en casa con un tensiómetro digital",
    caption: "Medición domiciliaria",
  },
  {
    className: "pin-card pin-square",
    src: consultationImage,
    alt: "Profesional de salud revisando señales cardiometabólicas con un paciente",
    caption: "Consulta con datos",
  },
  {
    className: "pin-card pin-wide",
    src: vascularPressureImage,
    alt: "Ilustración médica de flujo arterial y presión vascular",
    caption: "Flujo vascular",
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
    image: preventionRoutineImage,
    alt: "Tensiómetro, frutas, agua y calzado deportivo como parte de una rutina preventiva",
    title: "Sostener hábitos",
    description: "Movimiento, descanso y alimentación ayudan a que el registro tenga contexto.",
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
    image: clinicalReviewImage,
    alt: "Profesional de salud y paciente revisando tendencias de presión arterial en una tablet",
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
    image: habitLogImage,
    alt: "Tensiómetro, libreta de registro, agua y calzado para una rutina saludable",
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
