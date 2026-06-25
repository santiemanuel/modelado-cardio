import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";
import { prohibitedInternalCopy } from "./content/editorialGuidelines";

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
  const user = userEvent.setup();

  await acceptConsent(user);
  await user.click(screen.getByRole("button", { name: "Continuar" }));
  await user.type(screen.getByLabelText("Edad"), "66");
  await user.type(screen.getByLabelText("Peso"), "90.5");
  await user.type(screen.getByLabelText("Altura"), "169");
  await user.type(screen.getByLabelText("Perímetro de cintura"), "101.8");

  await user.click(screen.getByRole("button", { name: "Continuar" }));
  await user.type(screen.getByLabelText("Colesterol total"), "157");
  await user.type(screen.getByLabelText("HDL"), "60");
  await user.type(screen.getByLabelText("Hemoglobina glicosilada / HbA1c"), "6.2");

  await user.click(screen.getByRole("button", { name: "Continuar" }));
  await user.click(screen.getByRole("combobox", { name: "Grupo étnico reportado" }));
  await user.click(screen.getByRole("option", { name: "Negro no hispano" }));

  return user;
}

describe("App", () => {
  beforeEach(() => {
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
      screen.getByRole("heading", { name: "Tres pasos para ordenar tus señales" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Una lectura preventiva, no un diagnóstico" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Qué datos usa la inferencia" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Qué datos conviene tener a mano" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Laboratorio reciente")).toBeInTheDocument();
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
    expect(screen.getByRole("link", { name: "Ir al formulario" })).toHaveAttribute(
      "href",
      "/evaluar",
    );
    expect(screen.getByRole("link", { name: "Cómo funciona" })).toHaveAttribute(
      "href",
      "#como-funciona",
    );
  });

  it("renders local resources with shared confirmation details", () => {
    renderAt("/recursos");

    expect(
      screen.getByRole("heading", { name: "Laboratorios y centros de salud en Salta Capital" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Servicios mencionados").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Preguntas para confirmar").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Colesterol total, HDL, HbA1c/).length).toBeGreaterThan(0);
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
    expect(screen.getByRole("link", { name: "Volver al sitio" })).toHaveAttribute("href", "/");
    expect(screen.getByText("Volver al inicio").closest("a")).toHaveAttribute("href", "/");
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeDisabled();
    expect(screen.queryByText("Elegí un punto de partida")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("Entiendo y quiero continuar"));
    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(
      screen.getByRole("heading", { name: "Evaluar señales cardiometabólicas" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Elegí un punto de partida")).toBeInTheDocument();
    expect(screen.getByText(/Los casos base sirven para probar la interfaz/)).toBeInTheDocument();
    expect(screen.getByText(/Para adultos de 20 años o más/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar" })).toBeInTheDocument();
  });

  it("keeps visible Spanish copy with accents and without mojibake", () => {
    renderAt("/");

    expect(document.body).toHaveTextContent("hipertensión");
    expect(document.body).toHaveTextContent("señales");
    expect(document.body).toHaveTextContent("predicción");
    expect(document.body.textContent).not.toMatch(/Ãƒ|Ã‚/);
  });

  it("keeps public pages free of internal implementation notes", () => {
    for (const path of ["/", "/modelo", "/privacidad", "/educacion", "/recursos", "/faq", "/metodologia", "/404"]) {
      cleanup();
      renderAt(path);
      const visibleText = document.body.textContent?.toLowerCase() ?? "";
      for (const term of prohibitedInternalCopy) {
        expect(visibleText).not.toContain(term.toLowerCase());
      }
    }
  });

  it("validates required step fields before calling the API", async () => {
    const user = userEvent.setup();
    renderAt("/evaluar");

    await acceptConsent(user);
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.getAllByRole("alert")[0]).toHaveTextContent(
      "Ingresá un valor válido para la edad.",
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("debounces the displayed BMI after typing the missing measurement", async () => {
    const user = userEvent.setup();
    renderAt("/evaluar");

    await acceptConsent(user);
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.getByText("-")).toBeInTheDocument();
    expect(screen.queryByText(/Pendiente/i)).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Peso"), "90.5");
    await user.type(screen.getByLabelText("Altura"), "169");

    expect(screen.getByText("-")).toBeInTheDocument();
    expect(screen.queryByText("31.7 kg/m²")).not.toBeInTheDocument();
    expect(screen.getByText(/peso dividido por altura al cuadrado/)).toBeInTheDocument();
    expect(screen.getByText(/Cómo medir cintura/)).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText("31.7 kg/m²")).toBeInTheDocument(), {
      timeout: 1000,
    });
  });

  it("accepts decimal commas before sending numeric payloads", async () => {
    const user = userEvent.setup();
    renderAt("/evaluar");

    await acceptConsent(user);
    await user.click(screen.getByRole("button", { name: "Continuar" }));
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
    expect(screen.getByText("31.7 kg/m²")).toBeInTheDocument();

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
    expect(screen.getAllByRole("link", { name: /Fuente:/ })).toHaveLength(8);

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
    expect(screen.getAllByLabelText("Sube la estimacion").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Baja la estimacion")).toBeInTheDocument();
    expect(screen.getByText("66 años")).toBeInTheDocument();
    expect(screen.getByText("Edad comparada con el punto base del modelo.")).toBeInTheDocument();
    expect(screen.getByText("Colesterol total")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Realizar un nuevo test" })).toBeInTheDocument();
    expect(screen.getByText("Volver al inicio").closest("a")).toHaveAttribute("href", "/");
    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/predict",
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
    expect(screen.getByText("Elegí un punto de partida")).toBeInTheDocument();
    expect(screen.queryByText("72%")).not.toBeInTheDocument();
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
    await user.click(screen.getByRole("button", { name: /No tengo laboratorio reciente/ }));
    await user.click(screen.getByRole("button", { name: "Continuar" }));
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
      "http://127.0.0.1:8000/predict-simple",
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
