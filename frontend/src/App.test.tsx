import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";

const validResponse = {
  probability: 0.72,
  threshold: 0.5,
  prediction: 1,
  risk_label: "señales compatibles con hipertensión",
  context:
    "Resultado orientativo basado en señales indirectas. No reemplaza una medición de presión arterial ni una consulta médica.",
  model_name: "logistic_regression",
};

function renderAt(path: string) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

async function fillValidForm() {
  const user = userEvent.setup();

  await user.click(screen.getByRole("button", { name: "Continuar" }));
  await user.type(screen.getByLabelText("Edad"), "66");
  await user.type(screen.getByLabelText("Peso"), "90.5");
  await user.type(screen.getByLabelText("Altura"), "169");
  await user.type(screen.getByLabelText("Cintura"), "101.8");

  await user.click(screen.getByRole("button", { name: "Continuar" }));
  await user.type(screen.getByLabelText("Colesterol total"), "157");
  await user.type(screen.getByLabelText("HDL"), "60");
  await user.type(screen.getByLabelText("Hemoglobina glicosilada"), "6.2");

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
    expect(screen.getByRole("heading", { name: "Qué datos usa la inferencia" })).toBeInTheDocument();
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
  });

  it("renders the paginated prediction form on its own route", () => {
    renderAt("/evaluar");

    expect(
      screen.getByRole("heading", { name: "Evaluar señales cardiometabólicas" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver al sitio" })).toHaveAttribute("href", "/");
    expect(screen.getByText("Elegí un punto de partida")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar" })).toBeInTheDocument();
  });

  it("keeps visible Spanish copy with accents and without mojibake", () => {
    renderAt("/");

    expect(document.body).toHaveTextContent("hipertensión");
    expect(document.body).toHaveTextContent("señales");
    expect(document.body).toHaveTextContent("predicción");
    expect(document.body.textContent).not.toMatch(/Ãƒ|Ã‚/);
  });

  it("validates required step fields before calling the API", async () => {
    const user = userEvent.setup();
    renderAt("/evaluar");

    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Ingresá un valor válido para la edad.");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("debounces the displayed BMI after typing the missing measurement", async () => {
    const user = userEvent.setup();
    renderAt("/evaluar");

    await user.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.getByText("-")).toBeInTheDocument();
    expect(screen.queryByText(/Pendiente/i)).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Peso"), "90.5");
    await user.type(screen.getByLabelText("Altura"), "169");

    expect(screen.getByText("-")).toBeInTheDocument();
    expect(screen.queryByText("31.7 kg/m²")).not.toBeInTheDocument();

    await waitFor(() => expect(screen.getByText("31.7 kg/m²")).toBeInTheDocument(), {
      timeout: 1000,
    });
  });

  it("loads a test profile into the paginated form", async () => {
    const user = userEvent.setup();
    renderAt("/evaluar");

    await user.click(screen.getByRole("button", { name: /Más señales/ }));

    expect(screen.getByLabelText("Edad")).toHaveValue(66);
    expect(screen.getByLabelText("Peso")).toHaveValue(90.5);
    expect(screen.getByLabelText("Altura")).toHaveValue(169);
    expect(screen.getByLabelText("Cintura")).toHaveValue(101.8);
    expect(screen.getByText("31.7 kg/m²")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    const raceDropdown = screen.getByRole("combobox", { name: "Grupo étnico reportado" });
    expect(raceDropdown).toHaveTextContent("Negro no hispano");

    await user.click(raceDropdown);
    expect(screen.getByRole("option", { name: "Negro no hispano" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("opens a local lab directory from the laboratory step", async () => {
    const user = userEvent.setup();
    renderAt("/evaluar");

    await user.click(screen.getByRole("button", { name: /Más señales/ }));
    await user.click(screen.getByRole("button", { name: "Continuar" }));
    await user.click(screen.getByRole("button", { name: "Directorio" }));

    expect(
      screen.getByRole("dialog", {
        name: "Centros para análisis de rutina en Salta Capital",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Hospital San Bernardo")).toBeInTheDocument();
    expect(screen.getByText("CIACLAB")).toBeInTheDocument();
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
    expect(screen.getByText(/Priorizá una consulta médica/)).toBeInTheDocument();
    expect(screen.getByText("Regresión logística")).toBeInTheDocument();
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

  it("does not expose the hidden socioeconomic feature in the UI", () => {
    renderAt("/evaluar");

    expect(document.body).not.toHaveTextContent("INDFMPIR");
  });
});
