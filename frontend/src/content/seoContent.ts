export const pageMeta = {
  home: {
    title: "Presión Bajo Control | Señales cardiometabólicas",
    description:
      "Evaluación orientativa para ordenar señales cardiometabólicas compatibles con hipertensión. No reemplaza medición de presión arterial ni consulta médica.",
  },
  evaluation: {
    title: "Evaluar señales cardiometabólicas | Presión Bajo Control",
    description:
      "Formulario orientativo para estimar señales compatibles con hipertensión a partir de edad, mediciones corporales, laboratorio y hábitos.",
  },
  history: {
    title: "Historial local | Presión Bajo Control",
    description:
      "Seguimiento local de evaluaciones guardadas, registros manuales de presión arterial y acciones realizadas por el usuario.",
  },
  model: {
    title: "Sobre el modelo | Presión Bajo Control",
    description:
      "Conocé el dataset NHANES 2017-2018, variables, métricas, umbrales y limitaciones del modelo orientativo.",
  },
  education: {
    title: "Guía de presión arterial y señales cardiometabólicas",
    description:
      "Información educativa sobre presión arterial, medición correcta, IMC, cintura, colesterol, HDL, HbA1c y tabaquismo.",
  },
  resources: {
    title: "Recursos locales en Salta Capital | Presión Bajo Control",
    description:
      "Directorio orientativo de centros y laboratorios de Salta Capital para preparar controles de salud.",
  },
  faq: {
    title: "Preguntas frecuentes | Presión Bajo Control",
    description:
      "Respuestas claras sobre alcance, límites, datos solicitados y uso responsable de la evaluación orientativa.",
  },
  methodology: {
    title: "Metodología | Presión Bajo Control",
    description:
      "Cómo se construye la evaluación orientativa con NHANES 2017-2018, variables indirectas y control de fuga de información.",
  },
  privacy: {
    title: "Privacidad | Presión Bajo Control",
    description:
      "Qué datos se usan, cómo funciona el historial local y qué límites tiene la evaluación orientativa.",
  },
  notFound: {
    title: "Página no encontrada | Presión Bajo Control",
    description: "Ruta no encontrada dentro de Presión Bajo Control.",
  },
} as const;

export type PageMetaKey = keyof typeof pageMeta;
