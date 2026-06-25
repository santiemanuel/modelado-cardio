export const buttonLabels = {
  continue: "Continuar",
  previous: "Anterior",
  clearData: "Restablecer",
  evaluateSignals: "Evaluar señales",
  calculating: "Calculando...",
  viewDirectory: "Ver directorio",
  closeDirectory: "Cerrar directorio",
  downloadSummary: "Descargar resumen",
  saveOnDevice: "Guardar en este dispositivo",
  reviewData: "Revisar datos",
  clearAll: "Limpiar todo",
  savePressureRecord: "Guardar registro",
  deleteHistory: "Borrar historial",
  delete: "Borrar",
} as const;

export const stateCopy = {
  resultEmpty:
    "Completá el formulario para ver una probabilidad orientativa y próximos pasos claros.",
  resultLoading:
    "Calculando con los datos cargados. El resultado será una evaluación orientativa.",
  historyEmpty:
    "Todavía no guardaste evaluaciones en este dispositivo. Cuando guardes una, va a aparecer acá.",
  pressureEmpty:
    "Todavía no cargaste mediciones de presión arterial en este dispositivo.",
} as const;

export const presetSafetyCopy =
  "Los casos base sirven para probar la interfaz. No representan recomendaciones clínicas ni perfiles personales.";

export const measurementHelp = {
  bmi:
    "El IMC se calcula como peso dividido por altura al cuadrado. Es una señal orientativa y debe leerse junto con otros datos.",
  waist:
    "Para medir cintura, colocá la cinta de pie alrededor de la zona media, por encima de los huesos de la cadera, después de exhalar.",
  lab:
    "Antes de hacer laboratorio, confirmá si realizan colesterol total, HDL y HbA1c, y si necesitás pedido médico, turno u obra social.",
} as const;
