import consultationImage from "../assets/landing/cardio-consultation.png";
import routineImage from "../assets/landing/cardio-routine.png";
import clinicalReviewImage from "../assets/landing/clinical-review.png";
import habitLogImage from "../assets/landing/habit-log.png";
import bloodPressureImage from "../assets/landing/hero-blood-pressure.png";
import preventionRoutineImage from "../assets/landing/prevention-routine.png";
import vascularPressureImage from "../assets/landing/vascular-pressure-abstract.png";
import vascularImage from "../assets/landing/vascular-signals.png";
import { routes } from "../content/siteContent";

export const assessmentRoute = "/evaluar";

export const navLinks = routes
  .filter((route) =>
    ["/", "/modelo", "/educacion", "/recursos", "/faq", "/privacidad"].includes(
      route.path,
    ),
  )
  .map((route) => ({ href: route.path, label: route.label }));

export const heroMetrics = [
  { value: "6", label: "variables numéricas" },
  { value: "3", label: "factores categóricos" },
  { value: "2", label: "modos de evaluación" },
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
    title: "No diagnóstico",
    description: "No reemplaza consulta médica ni medición de presión arterial.",
    icon: "Alcance",
  },
  {
    title: "Datos habituales",
    description: "Usa edad, mediciones corporales, laboratorio y hábitos.",
    icon: "Datos",
  },
  {
    title: "Modelo documentado",
    description: "Basado en NHANES 2017-2018 y métricas trazables.",
    icon: "Modelo",
  },
  {
    title: "Enfoque preventivo",
    description: "Ayuda a ordenar señales para conversar mejor con un profesional.",
    icon: "Cuidado",
  },
];

export const priorityRows = [
  {
    label: "Medí la presión",
    note: "Es el dato que permite confirmar si los valores están elevados.",
  },
  {
    label: "Anotá el contexto",
    note: "Horario, reposo, mediciones previas y antecedentes ayudan a interpretar mejor.",
  },
  {
    label: "Llevá los datos a consulta",
    note: "La decisión clínica se toma con mediciones reales y tu situación completa.",
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
