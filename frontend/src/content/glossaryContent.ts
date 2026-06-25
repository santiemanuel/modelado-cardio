export type GlossaryEntry = {
  term: string;
  definition: string;
  sourceIds?: string[];
};

export const glossaryEntries: GlossaryEntry[] = [
  {
    term: "Presión sistólica",
    definition: "Primer número de la presión arterial; representa la presión cuando el corazón late.",
    sourceIds: ["S3"],
  },
  {
    term: "Presión diastólica",
    definition: "Segundo número de la presión arterial; representa la presión entre latidos.",
    sourceIds: ["S3"],
  },
  {
    term: "Hipertensión",
    definition:
      "Presión arterial sostenida por encima de lo esperado. Se confirma con mediciones reales y evaluación profesional.",
    sourceIds: ["S1", "S3"],
  },
  {
    term: "IMC",
    definition:
      "Índice de masa corporal. Se calcula con peso y altura, y se interpreta junto con otros datos de salud.",
    sourceIds: ["S4"],
  },
  {
    term: "HDL",
    definition: "Tipo de colesterol conocido como colesterol bueno. Forma parte del perfil lipídico.",
    sourceIds: ["S5"],
  },
  {
    term: "Colesterol total",
    definition: "Cantidad total de colesterol en sangre dentro del perfil lipídico.",
    sourceIds: ["S5"],
  },
  {
    term: "HbA1c",
    definition: "Hemoglobina glicosilada; refleja el promedio de glucosa de los últimos meses.",
    sourceIds: ["S6"],
  },
  {
    term: "Evaluación orientativa",
    definition:
      "Lectura inicial para ordenar señales y decidir próximos pasos. No equivale a diagnóstico.",
  },
  {
    term: "Falso negativo",
    definition:
      "Situación en la que una herramienta indica baja prioridad aunque la condición esté presente.",
  },
  {
    term: "Falso positivo",
    definition:
      "Situación en la que una herramienta indica alta prioridad aunque la condición no esté presente.",
  },
  {
    term: "Fuga de información",
    definition:
      "Problema de modelado que ocurre cuando un dato de entrada revela directa o casi directamente lo que se intenta estimar.",
  },
];
