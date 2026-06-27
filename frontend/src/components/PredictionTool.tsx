import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { requestPrediction, requestSimplePrediction } from "../api";
import type { PredictionResponse } from "../api";
import { buttonLabels } from "../content/evaluationContent";
import { downloadPdf } from "../utils/pdf";
import { PageMeta } from "./PageMeta";
import type { SavedEvaluation } from "./FollowUpPanels";
import { LandingHeader } from "./LandingHeader";
import { PredictionForm } from "./PredictionForm";
import { PredictionIntro } from "./PredictionIntro";
import { PredictionResultPanel } from "./PredictionResultPanel";
import {
  initialForm,
  calculateBmi,
  formatBmi,
  toPredictionPayload,
  toSimplePredictionPayload,
  validateForm,
} from "./predictionFormConfig";
import type { EvaluationMode, FormState } from "./predictionFormConfig";

const HISTORY_KEY = "cardio-screening-history-v1";

function formatModelName(modelName: string) {
  if (modelName === "logistic_regression" || modelName === "logistic_regression_no_indfmpir") {
    return "Regresión logística";
  }
  if (modelName === "logistic_regression_simple_no_lab") {
    return "Regresión logística simple";
  }

  return modelName;
}

function createLocalId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function PredictionTool() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [evaluationMode, setEvaluationMode] = useState<EvaluationMode>("complete");
  const [history, setHistory] = useState<SavedEvaluation[]>([]);

  const probabilityPercent = useMemo(() => {
    if (!result) {
      return null;
    }
    return `${Math.round(result.probability * 100)}%`;
  }, [result]);

  function updateFormField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  useEffect(() => {
    try {
      setHistory(JSON.parse(window.localStorage.getItem(HISTORY_KEY) ?? "[]"));
    } catch {
      setHistory([]);
    }
  }, []);

  function persistHistory(nextHistory: SavedEvaluation[]) {
    setHistory(nextHistory);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
  }

  function applyFormState(nextForm: FormState) {
    setForm(nextForm);
    setError(null);
    setResult(null);
  }

  function resetForm() {
    applyFormState(initialForm);
    setEvaluationMode("complete");
  }

  function confirmConsent() {
    if (!consentChecked) {
      return;
    }
    setConsentAccepted(true);
    setError(null);
  }

  function startNewTest() {
    resetForm();
    setResult(null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consentAccepted) {
      setError("Confirmá que entendés el alcance de la herramienta antes de enviar.");
      setResult(null);
      return;
    }

    const validationError = validateForm(form, evaluationMode);
    if (validationError) {
      setError(validationError);
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const prediction =
        evaluationMode === "simple"
          ? await requestSimplePrediction(toSimplePredictionPayload(form))
          : await requestPrediction(toPredictionPayload(form));
      setResult(prediction);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  function getBmiText() {
    return formatBmi(calculateBmi(form));
  }

  function saveCurrentEvaluation() {
    if (!result) {
      return;
    }
    const saved: SavedEvaluation = {
      id: createLocalId(),
      createdAt: new Date().toISOString(),
      probability: result.probability,
      threshold: result.threshold,
      modelName: result.model_name,
      bmi: getBmiText(),
      values: [
        { label: "Edad", value: `${form.RIDAGEYR} años` },
        { label: "Peso", value: `${form.BMXWT} kg` },
        { label: "Altura", value: `${form.BMXHT} cm` },
        { label: "Perímetro de cintura", value: `${form.BMXWAIST} cm` },
        ...(evaluationMode === "complete"
          ? [
              { label: "Colesterol total", value: `${form.LBXTC} mg/dL` },
              { label: "HDL", value: `${form.LBDHDD} mg/dL` },
              { label: "HbA1c", value: `${form.LBXGH}%` },
            ]
          : [{ label: "Laboratorio", value: "No incluido en modo simple" }]),
        { label: "Sexo reportado", value: form.sex },
        { label: "Grupo étnico reportado", value: form.race_ethnicity },
        {
          label: "Fumador actual",
          value: form.current_smoker === "1.0" ? "Sí" : "No",
        },
      ],
    };
    persistHistory([saved, ...history]);
  }

  function downloadSummary() {
    if (!result) {
      return;
    }
    const lines = [
      `Fecha y hora: ${new Date().toLocaleString("es-AR")}`,
      `Probabilidad estimada: ${Math.round(result.probability * 100)}% (${result.probability.toFixed(3)})`,
      `Umbral usado: ${Math.round(result.threshold * 100)}%`,
      `Modelo: ${formatModelName(result.model_name)}`,
      `Tipo de evaluación: ${evaluationMode === "simple" ? "Simple sin laboratorio" : "Completa"}`,
      `IMC calculado: ${getBmiText()} kg/m²`,
      `Edad: ${form.RIDAGEYR} años`,
      `Peso: ${form.BMXWT} kg`,
      `Altura: ${form.BMXHT} cm`,
      `Perímetro de cintura: ${form.BMXWAIST} cm`,
      ...(evaluationMode === "complete"
        ? [
            `Colesterol total: ${form.LBXTC} mg/dL`,
            `HDL: ${form.LBDHDD} mg/dL`,
            `HbA1c: ${form.LBXGH}%`,
          ]
        : [
            "Laboratorio: no incluido. La precisión puede disminuir porque el resultado usa menos datos.",
          ]),
      "Advertencia: este resumen no diagnostica hipertensión ni reemplaza una consulta médica.",
      "Preguntas para consulta: ¿conviene medir presión en casa?, ¿estos valores requieren seguimiento?, ¿con qué frecuencia repetir controles?",
      "Espacio para presión arterial: fecha, hora, sistólica, diastólica, pulso, brazo y observaciones.",
    ];
    downloadPdf("resumen-orientativo-cardio.pdf", "Resumen orientativo para consulta", lines);
  }

  return (
    <div className="prediction-page">
      <PageMeta page="evaluation" />
      <LandingHeader />

      <section
        className="prediction-section"
        id="evaluar-senales"
        aria-labelledby="prediction-title"
      >
        {!consentAccepted ? (
          <section className="consent-card consent-card-standalone" aria-labelledby="prediction-title">
            <div>
              <p className="section-kicker">Antes de continuar</p>
              <h1 id="prediction-title">Confirmá el alcance de la evaluación</h1>
              <ul className="plain-list">
                <li>Entiendo que esta herramienta no diagnostica hipertensión.</li>
                <li>Entiendo que el resultado es orientativo.</li>
                <li>Entiendo que la presión arterial debe confirmarse con mediciones reales.</li>
                <li>No voy a tomar decisiones de medicación con esta herramienta.</li>
                <li>Ante síntomas preocupantes, debo buscar atención médica urgente.</li>
              </ul>
            </div>
            <div className="consent-control-panel">
              <label className="consent-check">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(event) => setConsentChecked(event.target.checked)}
                />
                Entiendo y quiero continuar
              </label>
              <div className="consent-actions">
                <button
                  className="step-next"
                  type="button"
                  disabled={!consentChecked}
                  onClick={confirmConsent}
                >
                  Confirmar
                </button>
                <a className="secondary-link" href="/">
                  Volver al inicio
                </a>
              </div>
            </div>
          </section>
        ) : null}

        {consentAccepted && !result ? (
          <>
            <PredictionIntro />
            {error ? (
              <p className="workflow-message error" role="alert">
                {error}
              </p>
            ) : null}
            <div className="workspace workspace-single" aria-label="Formulario de predicción">
              <PredictionForm
                form={form}
                loading={loading}
                mode={evaluationMode}
                onApplyPreset={applyFormState}
                onFormChange={updateFormField}
                onModeChange={(mode) => {
                  setEvaluationMode(mode);
                  setError(null);
                  setResult(null);
                }}
                onReset={resetForm}
                onSubmit={handleSubmit}
              />
            </div>
          </>
        ) : null}

        {consentAccepted && result ? (
          <div className="summary-workspace" aria-label="Resumen orientativo">
            <PredictionResultPanel
              actions={
                <>
                  <button className="step-next" type="button" onClick={downloadSummary}>
                    {buttonLabels.downloadSummary}
                  </button>
                  <button className="form-reset" type="button" onClick={saveCurrentEvaluation}>
                    {buttonLabels.saveOnDevice}
                  </button>
                  <button className="step-next" type="button" onClick={startNewTest}>
                    Realizar un nuevo test
                  </button>
                  <a className="secondary-link" href="/">
                    Volver al inicio
                  </a>
                </>
              }
              error={error}
              loading={loading}
              probabilityPercent={probabilityPercent}
              result={result}
              variant="full"
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
