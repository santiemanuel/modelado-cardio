import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { requestPrediction, requestSimplePrediction } from "../api";
import type { PredictionResponse } from "../api";
import { buttonLabels, presetSafetyCopy } from "../content/evaluationContent";
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
  testProfiles,
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

type EvaluationStartScreenProps = {
  loading: boolean;
  onStartMode: (mode: EvaluationMode) => void;
  onUseExample: (values: FormState) => void;
};

function EvaluationStartScreen({ loading, onStartMode, onUseExample }: EvaluationStartScreenProps) {
  return (
    <section className="evaluation-start" aria-labelledby="evaluation-start-title">
      <div className="evaluation-start-heading">
        <p className="section-kicker">Inicio</p>
        <h2 id="evaluation-start-title">Elegí el modo de evaluación</h2>
        <p>
          La evaluación completa usa laboratorio reciente. El modo simple permite continuar con
          mediciones corporales y contexto declarado.
        </p>
      </div>

      <div className="evaluation-mode-grid" aria-label="Modos de evaluación">
        <button
          className="evaluation-mode-card"
          type="button"
          disabled={loading}
          onClick={() => onStartMode("complete")}
        >
          <span>Modo completo</span>
          <strong>Con laboratorio reciente</strong>
          <p>Incluye colesterol total, HDL y HbA1c para usar todas las señales del modelo.</p>
          <em>Ir a mediciones</em>
        </button>

        <button
          className="evaluation-mode-card"
          type="button"
          disabled={loading}
          onClick={() => onStartMode("simple")}
        >
          <span>Modo simple</span>
          <strong>Sin laboratorio reciente</strong>
          <p>Usa edad, IMC, cintura, sexo reportado, grupo étnico reportado y tabaquismo actual.</p>
          <em>Ir a mediciones</em>
        </button>
      </div>

      <section className="example-cases" aria-labelledby="example-cases-title">
        <div className="example-cases-heading">
          <h3 id="example-cases-title">Casos de ejemplo</h3>
          <p>{presetSafetyCopy}</p>
        </div>
        <div className="preset-grid evaluation-example-grid">
          {testProfiles.map((profile) => (
            <button
              className="preset-button"
              type="button"
              disabled={loading}
              key={profile.id}
              onClick={() => onUseExample(profile.values)}
            >
              <strong>{profile.label}</strong>
              <span>{profile.description}</span>
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}

export function PredictionTool() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [evaluationMode, setEvaluationMode] = useState<EvaluationMode>("complete");
  const [flowStarted, setFlowStarted] = useState(false);
  const [history, setHistory] = useState<SavedEvaluation[]>([]);
  const resultSummaryRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (!result || loading) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const resultSummary = resultSummaryRef.current;
      if (resultSummary) {
        const headerHeight =
          document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 64;
        const targetTop = resultSummary.getBoundingClientRect().top + window.scrollY;
        if (!window.navigator.userAgent.toLowerCase().includes("jsdom")) {
          window.scrollTo({ top: Math.max(0, targetTop - headerHeight - 24) });
        }
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [loading, result]);

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
  }

  function startEvaluation(mode: EvaluationMode) {
    setEvaluationMode(mode);
    applyFormState(initialForm);
    setFlowStarted(true);
  }

  function startExampleEvaluation(values: FormState) {
    setEvaluationMode("complete");
    applyFormState(values);
    setFlowStarted(true);
  }

  function returnToStartScreen() {
    setFlowStarted(false);
    setError(null);
    setResult(null);
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
    setEvaluationMode("complete");
    setFlowStarted(false);
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
            {!flowStarted ? (
              <EvaluationStartScreen
                loading={loading}
                onStartMode={startEvaluation}
                onUseExample={startExampleEvaluation}
              />
            ) : (
              <div className="workspace workspace-single" aria-label="Formulario de predicción">
                <PredictionForm
                  form={form}
                  loading={loading}
                  mode={evaluationMode}
                  onBackToStart={returnToStartScreen}
                  onFormChange={updateFormField}
                  onReset={resetForm}
                  onSubmit={handleSubmit}
                />
              </div>
            )}
          </>
        ) : null}

        {consentAccepted && result ? (
          <div className="summary-workspace" aria-label="Resumen orientativo" ref={resultSummaryRef}>
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
