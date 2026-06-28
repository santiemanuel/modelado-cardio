import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import { prohibitedInternalCopy } from "./content/editorialGuidelines";
import { HISTORY_KEY, PRESSURE_RECORDS_KEY } from "./utils/historyStorage";
import { getMotionSafeScrollBehavior } from "./utils/motion";
import { downloadSummaryPdf } from "./utils/pdf";

vi.mock("./utils/pdf", () => ({
  downloadSummaryPdf: vi.fn(),
}));

const validResponse = {
  probability: 0.72,
  threshold: 0.5,
  prediction: 1,
  risk_label: "señales compatibles con hipertensión",
  context:
    "Resultado orientativo basado en señales indirectas. No reemplaza una medición de presión arterial ni una consulta médica.",
  model_name: "logistic_regression",
  shap_explanations: [
    {
      feature: "RIDAGEYR",
      label: "Edad",
      value: "66 años",
      shap_value: 0.72,
      impact: 0.46,
      direction: "raises_risk",
      description: "Edad comparada con el punto base del modelo.",
    },
    {
      feature: "LBDHDD",
      label: "HDL",
      value: "60 mg/dL",
      shap_value: -0.32,
      impact: 0.2,
      direction: "lowers_risk",
      description: "HDL informado para esta evaluación.",
    },
    {
      feature: "LBXTC",
      label: "Colesterol total",
      value: "157 mg/dL",
      shap_value: 0.14,
      impact: 0.09,
      direction: "raises_risk",
      description: "Colesterol total informado para esta evaluación.",
    },
  ],
  shap_base_value: 0.11,
  shap_output_unit: "log_odds",
};

const simpleResponse = {
  ...validResponse,
  context:
    "Resultado orientativo basado en menos datos porque no incluye laboratorio. La precisión puede disminuir.",
  mode: "simple",
  model_name: "logistic_regression_simple_no_lab",
  model_version: "case1-logreg-simple-no-lab-v2",
  shap_explanations: validResponse.shap_explanations.filter(
    (item) => !["LBXTC", "LBDHDD", "LBXGH"].includes(item.feature),
  ),
};

const savedEvaluation = {
  id: "eval-1",
  createdAt: "2026-06-27T12:30:00",
  probability: validResponse.probability,
  threshold: validResponse.threshold,
  modelName: validResponse.model_name,
  modelVersion: "case1-logreg-no-indfmpir-v2",
  riskLabel: validResponse.risk_label,
  context: validResponse.context,
  mode: "complete",
  bmi: "31.7",
  result: {
    ...validResponse,
    mode: "complete",
    model_version: "case1-logreg-no-indfmpir-v2",
  },
  shapExplanations: validResponse.shap_explanations,
  actions: [],
  values: [
    { label: "Edad", value: "66 a\u00f1os" },
    { label: "Peso", value: "90.5 kg" },
    { label: "Altura", value: "169 cm" },
    { label: "Cintura", value: "101.8 cm" },
  ],
};

const savedPressureRecord = {
  id: "pressure-1",
  date: "2026-06-27",
  time: "08:10",
  systolic: "142",
  diastolic: "88",
  pulse: "72",
  arm: "Izquierdo",
  notes: "Reposo",
};

function seedHistory({
  history = [savedEvaluation],
  pressureRecords = [savedPressureRecord],
}: {
  history?: unknown[];
  pressureRecords?: unknown[];
} = {}) {
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  window.localStorage.setItem(PRESSURE_RECORDS_KEY, JSON.stringify(pressureRecords));
}

function renderAt(path: string) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

async function acceptConsent(user = userEvent.setup()) {
  await user.click(screen.getByLabelText("Entiendo y quiero continuar"));
  await user.click(screen.getByRole("button", { name: "Confirmar" }));
  return user;
}

async function fillValidForm() {
  const user = await reachLaboratoryStep();
  await user.type(screen.getByLabelText("Colesterol total"), "157");
  await user.type(screen.getByLabelText("HDL"), "60");
  await user.type(screen.getByLabelText("Hemoglobina glicosilada / HbA1c"), "6.2");

  await user.click(screen.getByRole("button", { name: "Continuar" }));
  await user.click(screen.getByRole("combobox", { name: "Grupo étnico reportado" }));
  await user.click(screen.getByRole("option", { name: "Negro no hispano" }));

  return user;
}

async function reachLaboratoryStep(user = userEvent.setup()) {
  await acceptConsent(user);
  await user.click(screen.getByRole("button", { name: /Con laboratorio reciente/ }));
  await user.type(screen.getByLabelText("Edad"), "66");
  await user.type(screen.getByLabelText("Peso"), "90.5");
  await user.type(screen.getByLabelText("Altura"), "169");
  await user.type(screen.getByLabelText("Perímetro de cintura"), "101.8");
  await user.click(screen.getByRole("button", { name: "Continuar" }));
  return user;
}

describe("App", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(downloadSummaryPdf).mockClear();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => validResponse,
      })),
    );
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    window.history.pushState({}, "", "/");
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders the redesigned educational landing without embedding the form", () => {
    renderAt("/");

    expect(
      screen.getByRole("heading", {
        name: "Que la presión alta no pase inadvertida",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "La presión alta no siempre se siente" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Tres pasos para ordenar tus señales" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Lectura responsable")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Flujo de lectura antes de evaluar" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Reunir mediciones" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Sumar laboratorio si existe" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Leer como prioridad" })).toBeInTheDocument();
    expect(screen.getAllByText(/Un resultado bajo no descarta presión alta/).length).toBeGreaterThan(
      0,
    );
    expect(screen.queryByRole("button", { name: "Evaluar" })).not.toBeInTheDocument();
  });

  it("links the hero and final CTAs to the prediction route", () => {
    renderAt("/");

    expect(screen.getByRole("link", { name: "Evaluar señales" })).toHaveAttribute(
      "href",
      "/evaluar",
    );
    expect(screen.getByRole("link", { name: "Empezar evaluación" })).toHaveAttribute(
      "href",
      "/evaluar",
    );
    expect(screen.queryByRole("link", { name: "Cómo funciona" })).not.toBeInTheDocument();
  });

  it("renders local resources with shared confirmation details", () => {
    renderAt("/recursos");

    expect(
      screen.getByRole("heading", { name: "Laboratorios y centros de salud en Salta Capital" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Servicios mencionados").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Preguntas para confirmar").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Colesterol total, HDL, HbA1c/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Fuente:/)).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Fuentes del directorio" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Ver sitio de/ })).toHaveLength(8);
    expect(screen.getByRole("link", { name: "Teléfono 0387 4311977" })).toHaveAttribute(
      "href",
      "tel:+543874311977",
    );
    expect(screen.getByRole("link", { name: "WhatsApp 387 5612004" })).toHaveAttribute(
      "href",
      "https://wa.me/5493875612004",
    );
    expect(screen.getByRole("link", { name: "WhatsApp 387 5863132" })).toHaveAttribute(
      "href",
      "https://wa.me/5493875863132",
    );
    const mapsLinks = screen.getAllByRole("link", { name: /Google Maps/ });
    expect(mapsLinks).toHaveLength(9);
    expect(mapsLinks.every((link) => link.getAttribute("href")?.startsWith("https://maps.google.com/?q="))).toBe(
      true,
    );
    expect(mapsLinks.some((link) => link.getAttribute("href")?.includes("Mariano%20Boedo%2051"))).toBe(
      true,
    );
  });

  it("renders FAQ and 404 routes", () => {
    renderAt("/faq");

    expect(
      screen.getByRole("heading", { name: "Respuestas rápidas antes de usar la evaluación" }),
    ).toBeInTheDocument();
    expect(screen.getByText("¿Esta herramienta diagnostica hipertensión?")).toBeInTheDocument();
    expect(screen.getByText("¿Puedo usarla si tengo menos de 20 años?")).toBeInTheDocument();

    cleanup();
    renderAt("/no-existe");

    expect(screen.getByRole("heading", { name: "No encontramos esa sección" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver al inicio" })).toHaveAttribute("href", "/");
  });

  it("renders an empty local history route without prototype chrome", () => {
    renderAt("/historial");

    expect(screen.getByRole("heading", { name: "Seguimiento" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Todavía no hay mediciones guardadas" })).toBeInTheDocument();
    expect(screen.queryByText(/V7/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Prob\. \+ PA/i })).not.toBeInTheDocument();
  });

  it("renders saved history with chart, table columns, pressure records and reading factors", () => {
    seedHistory();
    renderAt("/historial");

    expect(screen.getByRole("heading", { name: "Probabilidad y presión" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Estado" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Fecha" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Prob." })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Mis acciones" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Registros de presión" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Lectura" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Ver Más" })).toBeInTheDocument();
    expect(screen.getAllByText("72%").length).toBeGreaterThan(0);
    expect(screen.getAllByText("27/06/2026").length).toBeGreaterThan(0);
    expect(screen.getByText("12:30")).toBeInTheDocument();
    expect(screen.getAllByText("142/88").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Edad").length).toBeGreaterThan(0);
    expect(screen.getAllByText("66 años").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: /Ver Más/i })).toHaveAttribute("href", "/historial/eval-1");
    expect(document.body).not.toHaveTextContent(/tomas del día/i);
    expect(document.body).not.toHaveTextContent("Prob. + PA");
  });

  it("persists user actions per saved measurement", async () => {
    seedHistory();
    const user = userEvent.setup();
    renderAt("/historial");

    const nutrition = screen.getByRole("button", { name: /Alimentaci.n/i });
    expect(nutrition).toHaveAttribute("aria-pressed", "false");

    await user.click(nutrition);

    expect(nutrition).toHaveAttribute("aria-pressed", "true");
    const storedHistory = JSON.parse(window.localStorage.getItem(HISTORY_KEY) ?? "[]");
    expect(storedHistory[0].actions).toContain("nutrition");
  });

  it("adds a pressure record from the history modal and associates it by date", async () => {
    seedHistory({ pressureRecords: [] });
    const user = userEvent.setup();
    renderAt("/historial");

    await user.click(screen.getAllByRole("button", { name: /Agregar presión/i })[0]);
    await user.clear(screen.getByLabelText("Fecha"));
    await user.type(screen.getByLabelText("Fecha"), "2026-06-27");
    await user.clear(screen.getByLabelText("Sistólica"));
    await user.type(screen.getByLabelText("Sistólica"), "130");
    await user.clear(screen.getByLabelText("Diastólica"));
    await user.type(screen.getByLabelText("Diastólica"), "80");
    await user.type(screen.getByLabelText("Pulso"), "70");
    await user.click(screen.getByRole("button", { name: "Guardar presión" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getAllByText("130/80").length).toBeGreaterThan(0);
    const storedPressure = JSON.parse(window.localStorage.getItem(PRESSURE_RECORDS_KEY) ?? "[]");
    expect(storedPressure[0]).toMatchObject({
      date: "2026-06-27",
      systolic: "130",
      diastolic: "80",
    });
  });

  it("clears history and pressure records after confirmation", async () => {
    seedHistory();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    renderAt("/historial");

    await user.click(screen.getByRole("button", { name: /Eliminar todos los datos/i }));

    expect(confirmSpy).toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Todavía no hay mediciones guardadas" })).toBeInTheDocument();
    expect(window.localStorage.getItem(HISTORY_KEY)).toBeNull();
    expect(window.localStorage.getItem(PRESSURE_RECORDS_KEY)).toBeNull();
  });

  it("renders saved measurement detail with result explanation and pressure records for that day", () => {
    seedHistory();
    renderAt("/historial/eval-1");

    expect(screen.getByRole("heading", { name: "Resultado guardado" })).toBeInTheDocument();
    expect(screen.getByText("señales compatibles con hipertensión")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mediciones del día" })).toBeInTheDocument();
    expect(screen.getAllByText("142/88 mmHg").length).toBeGreaterThan(0);
    expect(screen.getByText("Reposo")).toBeInTheDocument();
    expect(screen.getByText("Edad comparada con el punto base del modelo.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Acciones realizadas" })).toBeInTheDocument();
  });

  it("renders education, methodology, and model detail sections", () => {
    renderAt("/educacion");

    expect(screen.getByRole("heading", { name: "Guía para entender tus datos" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Términos clave" })).toBeInTheDocument();
    expect(screen.getByText("Fuga de información")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Fuentes educativas" })).toBeInTheDocument();

    cleanup();
    renderAt("/metodologia");

    expect(screen.getByRole("heading", { name: "Fuga de información" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pesos muestrales" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Antes de uso clínico real" })).toBeInTheDocument();

    cleanup();
    renderAt("/modelo");

    expect(
      screen.getByRole("heading", { name: "Qué faltaría antes de uso clínico real" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Métricas por modo de evaluación" })).toBeInTheDocument();
    expect(screen.getByText("Simple sin laboratorio")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Fuentes principales" })).toBeInTheDocument();
  });

  it("renders the consent card before the paginated prediction form", async () => {
    const user = userEvent.setup();
    renderAt("/evaluar");

    expect(
      screen.getByRole("heading", { name: "Confirmá el alcance de la evaluación" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Recursos" })).toHaveAttribute("href", "/recursos");
    expect(screen.getByText("Volver al inicio").closest("a")).toHaveAttribute("href", "/");
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeDisabled();
    expect(screen.queryByText("Elegí el modo de evaluación")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("Entiendo y quiero continuar"));
    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(
      screen.getByRole("heading", { name: "Evaluar señales cardiometabólicas" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Elegí el modo de evaluación")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Con laboratorio reciente/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sin laboratorio reciente/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Casos de ejemplo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Control habitual/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Más señales/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tabaquismo actual/ })).toBeInTheDocument();
    expect(screen.getByText(/Los casos base sirven para probar la interfaz/)).toBeInTheDocument();
    expect(screen.getByText(/Para adultos de 20 años o más/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Edad")).not.toBeInTheDocument();
  });

  it("keeps visible Spanish copy with accents and without mojibake", () => {
    renderAt("/");

    expect(document.body).toHaveTextContent("hipertensión");
    expect(document.body).toHaveTextContent("señales");
    expect(document.body).toHaveTextContent(/predicción/i);
    expect(document.body.textContent).not.toMatch(/Ãƒ|Ã‚/);
  });

  it("keeps public pages free of internal implementation notes", () => {
    for (const path of ["/", "/historial", "/modelo", "/privacidad", "/educacion", "/recursos", "/faq", "/metodologia", "/404"]) {
      cleanup();
      renderAt(path);
      const visibleText = document.body.textContent?.toLowerCase() ?? "";
      for (const term of prohibitedInternalCopy) {
        expect(visibleText).not.toContain(term.toLowerCase());
      }
    }
  });

  it("keeps programmatic scroll instant for reduced-motion users", () => {
    const createMatchMedia = (matches: boolean) =>
      vi.fn((query: string) => ({
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(() => false),
      }));

    vi.stubGlobal("matchMedia", createMatchMedia(true));
    expect(getMotionSafeScrollBehavior()).toBe("auto");

    vi.stubGlobal("matchMedia", createMatchMedia(false));
    expect(getMotionSafeScrollBehavior()).toBe("smooth");
  });

  it("validates required step fields before calling the API", async () => {
    const user = userEvent.setup();
    renderAt("/evaluar");

    await acceptConsent(user);
    await user.click(screen.getByRole("button", { name: /Con laboratorio reciente/ }));
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.getAllByRole("alert")[0]).toHaveTextContent(
      "Ingresá un valor válido para la edad.",
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("flags body measurements that are individually valid but incompatible together", async () => {
    let user = userEvent.setup();
    renderAt("/evaluar");

    await acceptConsent(user);
    await user.click(screen.getByRole("button", { name: /Con laboratorio reciente/ }));
    await user.type(screen.getByLabelText("Edad"), "45");
    await user.type(screen.getByLabelText("Peso"), "125");
    await user.type(screen.getByLabelText("Altura"), "169");
    await user.type(screen.getByLabelText("Perímetro de cintura"), "60");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Los datos cargados no parecen compatibles entre sí",
    );
    expect(screen.getByLabelText("Peso")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Altura")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Perímetro de cintura")).toHaveAttribute("aria-invalid", "true");
    expect(fetch).not.toHaveBeenCalled();

    cleanup();
    user = userEvent.setup();
    renderAt("/evaluar");

    await acceptConsent(user);
    await user.click(screen.getByRole("button", { name: /Con laboratorio reciente/ }));
    await user.type(screen.getByLabelText("Edad"), "45");
    await user.type(screen.getByLabelText("Peso"), "62");
    await user.type(screen.getByLabelText("Altura"), "169");
    await user.type(screen.getByLabelText("Perímetro de cintura"), "150");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Los datos cargados no parecen compatibles entre sí",
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("debounces the displayed BMI after typing the missing measurement", async () => {
    const user = userEvent.setup();
    renderAt("/evaluar");

    await acceptConsent(user);
    await user.click(screen.getByRole("button", { name: /Con laboratorio reciente/ }));

    expect(screen.getByText("-")).toBeInTheDocument();
    expect(
      screen.queryByText("El IMC se calcula con peso y altura; no hace falta ingresarlo a mano."),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Pendiente/i)).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Peso"), "90.5");
    await user.type(screen.getByLabelText("Altura"), "16");

    expect(screen.getByText("-")).toBeInTheDocument();
    expect(screen.queryByText(/\d+\.\d kg\/m²/)).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Altura"), "9");

    expect(screen.getByText("-")).toBeInTheDocument();
    expect(screen.queryByText("31.7 kg/m²")).not.toBeInTheDocument();
    expect(screen.getByText(/peso dividido por altura al cuadrado/)).toBeInTheDocument();
    expect(screen.getByText(/Cómo medir cintura/)).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText("31.7 kg/m²")).toBeInTheDocument(), {
      timeout: 1000,
    });
  });

  it("flags incompatible laboratory values before moving to context", async () => {
    let user = userEvent.setup();
    renderAt("/evaluar");

    await reachLaboratoryStep(user);
    await user.type(screen.getByLabelText("Colesterol total"), "120");
    await user.type(screen.getByLabelText("HDL"), "140");
    await user.type(screen.getByLabelText("Hemoglobina glicosilada / HbA1c"), "5.8");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "El HDL no debería superar el colesterol total",
    );
    expect(screen.getByLabelText("Colesterol total")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("HDL")).toHaveAttribute("aria-invalid", "true");
    expect(fetch).not.toHaveBeenCalled();

    cleanup();
    user = userEvent.setup();
    renderAt("/evaluar");

    await reachLaboratoryStep(user);
    await user.type(screen.getByLabelText("Colesterol total"), "100");
    await user.type(screen.getByLabelText("HDL"), "85");
    await user.type(screen.getByLabelText("Hemoglobina glicosilada / HbA1c"), "5.8");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "la diferencia entre ambos es inusualmente baja",
    );

    cleanup();
    user = userEvent.setup();
    renderAt("/evaluar");

    await reachLaboratoryStep(user);
    await user.type(screen.getByLabelText("Colesterol total"), "400");
    await user.type(screen.getByLabelText("HDL"), "23");
    await user.type(screen.getByLabelText("Hemoglobina glicosilada / HbA1c"), "5.8");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "La relación entre colesterol total y HDL es poco habitual",
    );
  });

  it("accepts decimal commas before sending numeric payloads", async () => {
    const user = userEvent.setup();
    renderAt("/evaluar");

    await acceptConsent(user);
    await user.click(screen.getByRole("button", { name: /Con laboratorio reciente/ }));
    await user.type(screen.getByLabelText("Edad"), "66");
    await user.type(screen.getByLabelText("Peso"), "90,5");
    await user.type(screen.getByLabelText("Altura"), "169");
    await user.type(screen.getByLabelText("Perímetro de cintura"), "101,8");
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await user.type(screen.getByLabelText("Colesterol total"), "157");
    await user.type(screen.getByLabelText("HDL"), "60");
    await user.type(screen.getByLabelText("Hemoglobina glicosilada / HbA1c"), "6,2");
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await user.click(screen.getByRole("button", { name: "Evaluar señales" }));

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const requestBody = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body));
    expect(requestBody).toMatchObject({
      BMXBMI: 31.7,
      BMXWAIST: 101.8,
      LBXGH: 6.2,
    });
  });

  it("loads a test profile into the paginated form", async () => {
    const user = userEvent.setup();
    renderAt("/evaluar");

    await acceptConsent(user);
    await user.click(screen.getByRole("button", { name: /Más señales/ }));

    expect(screen.getByLabelText("Edad")).toHaveValue("66");
    expect(screen.getByLabelText("Peso")).toHaveValue("90.5");
    expect(screen.getByLabelText("Altura")).toHaveValue("169");
    expect(screen.getByLabelText("Perímetro de cintura")).toHaveValue("101.8");
    await waitFor(() => expect(screen.getByText("31.7 kg/m²")).toBeInTheDocument(), {
      timeout: 1000,
    });

    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    const raceDropdown = screen.getByRole("combobox", { name: "Grupo étnico reportado" });
    expect(raceDropdown).toHaveTextContent("Negro no hispano");
    expect(screen.getByText(/no describe identidad de género de forma amplia/i)).toBeInTheDocument();
    expect(screen.getByText(/se deriva de preguntas sobre consumo de cigarrillos/i)).toBeInTheDocument();

    await user.click(raceDropdown);
    expect(screen.getByRole("option", { name: "Negro no hispano" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("opens a local lab directory from the laboratory step", async () => {
    const user = userEvent.setup();
    renderAt("/evaluar");

    await acceptConsent(user);
    await user.click(screen.getByRole("button", { name: /Más señales/ }));
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await user.click(screen.getByRole("button", { name: "Ver directorio" }));

    expect(
      screen.getByRole("dialog", {
        name: "Centros para análisis de rutina en Salta Capital",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Hospital San Bernardo")).toBeInTheDocument();
    expect(screen.getByText("CIACLAB")).toBeInTheDocument();
    expect(screen.getAllByText("Preguntas para confirmar").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Pedido médico/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Fuente:/)).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Ver sitio de/ })).toHaveLength(8);
    expect(screen.getByRole("link", { name: "WhatsApp 387 5 125 955" })).toHaveAttribute(
      "href",
      "https://wa.me/5493875125955",
    );

    await user.click(screen.getByRole("button", { name: "Cerrar directorio" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("submits the form and shows the API result", async () => {
    renderAt("/evaluar");
    const user = await fillValidForm();
    const smokerSwitch = screen.getByRole("switch", { name: "Fumador actual" });

    expect(smokerSwitch).not.toBeChecked();
    await user.click(smokerSwitch);
    expect(smokerSwitch).toBeChecked();

    await user.click(screen.getByRole("button", { name: "Evaluar señales" }));

    await waitFor(() => expect(screen.getByText("72%")).toBeInTheDocument());
    expect(screen.getByText("señales compatibles con hipertensión")).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: "Semáforo de probabilidad" })).toHaveAttribute(
      "aria-valuenow",
      "72",
    );
    expect(screen.queryByText("Rojo de riesgo alto")).not.toBeInTheDocument();
    expect(screen.getByText("50-74%")).toBeInTheDocument();
    expect(screen.getByText("Tramo comunicacional")).toBeInTheDocument();
    expect(screen.getByText(/Estimación del modelo, no diagnóstico individual/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Qué hacer ahora" })).toBeInTheDocument();
    expect(screen.getByText(/No tomes decisiones de medicación/)).toBeInTheDocument();
    expect(screen.getByText(/Priorizá una medición correcta/)).toBeInTheDocument();
    expect(screen.getByText("Regresión logística")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Qué influyó en este resultado" })).toBeInTheDocument();
    expect(screen.getByText(/SHAP compara los datos cargados/)).toBeInTheDocument();
    expect(screen.getAllByLabelText("Sube la estimación").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Baja la estimación")).toBeInTheDocument();
    expect(screen.getByText("66 años")).toBeInTheDocument();
    expect(screen.getByText("Edad comparada con el punto base del modelo.")).toBeInTheDocument();
    expect(screen.getByText("Colesterol total")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Realizar un nuevo test" })).toBeInTheDocument();
    expect(screen.getByText("Volver al inicio").closest("a")).toHaveAttribute("href", "/");
    expect(fetch).toHaveBeenCalledWith(
      "/api/predict",
      expect.objectContaining({ method: "POST" }),
    );
    const requestBody = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body));
    expect(requestBody).toMatchObject({
      RIDAGEYR: 66,
      BMXBMI: 31.7,
      BMXWAIST: 101.8,
      current_smoker: 1,
    });
    expect(requestBody).not.toHaveProperty("BMXWT");
    expect(requestBody).not.toHaveProperty("BMXHT");

    await user.click(screen.getByRole("button", { name: "Realizar un nuevo test" }));
    expect(screen.getByText("Elegí el modo de evaluación")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Casos de ejemplo" })).toBeInTheDocument();
    expect(screen.queryByText("72%")).not.toBeInTheDocument();
  });

  it("downloads a structured consultation PDF summary", async () => {
    renderAt("/evaluar");
    const user = await fillValidForm();

    await user.click(screen.getByRole("button", { name: /Evaluar se.al/ }));
    await waitFor(() => expect(screen.getByText("72%")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Descargar resumen" }));

    expect(downloadSummaryPdf).toHaveBeenCalledTimes(1);
    expect(downloadSummaryPdf).toHaveBeenCalledWith(
      "resumen-orientativo-cardio.pdf",
      expect.objectContaining({
        evaluationType: "Completa",
        probabilityPercent: "72%",
        probabilityValue: "0.720",
        thresholdPercent: "50%",
        communicationRange: "Prioridad alta (50-74%)",
        warning: expect.stringContaining("no diagnostica hipertensi\u00f3n"),
      }),
      expect.objectContaining({
        logoUrl: expect.stringContaining("logo"),
      }),
    );

    const summaryData = vi.mocked(downloadSummaryPdf).mock.calls[0][1];
    expect(summaryData.inputRows).toEqual(
      expect.arrayContaining([
        { label: "Edad", value: "66 a\u00f1os" },
        { label: "Peso", value: "90.5 kg" },
        { label: "Altura", value: "169 cm" },
        { label: "Cintura", value: "101.8 cm" },
        { label: "IMC calculado", value: "31.7 kg/m\u00b2" },
        { label: "Colesterol total", value: "157 mg/dL" },
        { label: "HDL", value: "60 mg/dL" },
        { label: "HbA1c", value: "6.2%" },
        { label: "Grupo \u00e9tnico (NHANES)", value: "Negro no hispano" },
      ]),
    );
    expect(summaryData.factors).toHaveLength(3);
    expect(summaryData.questions).toEqual(
      expect.arrayContaining([
        "\u00bfConviene medir presi\u00f3n en casa durante varios d\u00edas?",
        "\u00bfEstos valores requieren seguimiento?",
      ]),
    );
  });

  it("submits simple mode without laboratory fields", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => simpleResponse,
      })),
    );
    const user = userEvent.setup();
    renderAt("/evaluar");

    await acceptConsent(user);
    await user.click(screen.getByRole("button", { name: /Sin laboratorio reciente/ }));
    await user.type(screen.getByLabelText("Edad"), "66");
    await user.type(screen.getByLabelText("Peso"), "90,5");
    await user.type(screen.getByLabelText("Altura"), "169");
    await user.type(screen.getByLabelText("Perímetro de cintura"), "101,8");
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(
      screen.getByRole("heading", { name: "Evaluación sin laboratorio reciente" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Colesterol total")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("HDL")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Hemoglobina glicosilada / HbA1c")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await user.click(screen.getByRole("button", { name: "Evaluar señales" }));

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(fetch).toHaveBeenCalledWith(
      "/api/predict-simple",
      expect.objectContaining({ method: "POST" }),
    );
    const requestBody = JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body));
    expect(requestBody).toMatchObject({
      RIDAGEYR: 66,
      BMXBMI: 31.7,
      BMXWAIST: 101.8,
    });
    expect(requestBody).not.toHaveProperty("LBXTC");
    expect(requestBody).not.toHaveProperty("LBDHDD");
    expect(requestBody).not.toHaveProperty("LBXGH");
    expect(screen.getAllByText(/precisión puede disminuir/i).length).toBeGreaterThan(0);
  });

  it("renders an API error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 500,
      })),
    );
    renderAt("/evaluar");
    const user = await fillValidForm();

    await user.click(screen.getByRole("button", { name: "Evaluar señales" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("No se pudo obtener la predicción"),
    );
  });

  it("shows a connection error without internal wording", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("network down"))));
    renderAt("/evaluar");
    const user = await fillValidForm();

    await user.click(screen.getByRole("button", { name: "Evaluar señales" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "No se pudo conectar con el servicio de evaluación",
      ),
    );
    expect(screen.getByRole("alert")).not.toHaveTextContent("backend");
  });

  it("shows actionable messages for validation and rate-limit API errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 422,
      })),
    );
    renderAt("/evaluar");
    let user = await fillValidForm();

    await user.click(screen.getByRole("button", { name: "Evaluar señales" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Hay datos que el servidor no pudo validar",
      ),
    );

    cleanup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 429,
      })),
    );
    renderAt("/evaluar");
    user = await fillValidForm();

    await user.click(screen.getByRole("button", { name: "Evaluar señales" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("demasiadas solicitudes"),
    );
  });

  it("does not expose the hidden socioeconomic feature in the UI", () => {
    renderAt("/evaluar");

    expect(document.body).not.toHaveTextContent("INDFMPIR");
  });
});
