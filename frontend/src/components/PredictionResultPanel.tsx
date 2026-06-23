import type { CSSProperties } from "react";

import type { PredictionResponse } from "../api";

type PredictionResultPanelProps = {
  error: string | null;
  loading: boolean;
  probabilityPercent: string | null;
  result: PredictionResponse | null;
};

type ProbabilityTone = "green" | "yellow" | "red";

type ProbabilityGuidance = {
  tone: ProbabilityTone;
  range: string;
  interpretation: string;
  recommendation: string;
};

type ProbabilityMeterStyle = CSSProperties & {
  "--probability-position": string;
};

function getProbabilityGuidance(probability: number): ProbabilityGuidance {
  const percent = Math.round(probability * 100);

  if (percent < 25) {
    return {
      tone: "green",
      range: "0-24%",
      interpretation:
        "Las señales cargadas no sugieren prioridad alta, pero siguen siendo una lectura orientativa.",
      recommendation:
        "Mantené controles habituales y llevá este resultado a tu próxima consulta médica; el criterio profesional confirma o descarta la predicción.",
    };
  }

  if (percent < 50) {
    return {
      tone: "yellow",
      range: "25-49%",
      interpretation:
        "Hay señales que conviene revisar con más atención, especialmente si tenés mediciones previas elevadas.",
      recommendation:
        "Agendá una consulta médica de control y compartí los valores usados; la consulta es la autoridad para verificar esta estimación.",
    };
  }

  if (percent < 75) {
    return {
      tone: "red",
      range: "50-74%",
      interpretation:
        "El modelo detecta una combinación de señales que amerita priorizar una revisión clínica.",
      recommendation:
        "Priorizá una consulta médica para confirmar con mediciones de presión arterial y evaluación profesional antes de tomar decisiones.",
    };
  }

  return {
    tone: "red",
    range: "75-100%",
    interpretation:
      "La probabilidad orientativa es muy alta y no debería manejarse solo con esta herramienta.",
    recommendation:
      "Buscá evaluación médica pronta; si hay síntomas o registros de presión muy altos, acudí a un servicio de salud. La autoridad final es la consulta médica.",
  };
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatModelName(modelName: string) {
  if (modelName === "logistic_regression") {
    return "Regresión logística";
  }

  return modelName
    .split("_")
    .filter(Boolean)
    .map((word, index) => (index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");
}

export function PredictionResultPanel({
  error,
  loading,
  probabilityPercent,
  result,
}: PredictionResultPanelProps) {
  const guidance = result ? getProbabilityGuidance(result.probability) : null;
  const probabilityPosition = result
    ? `${Math.min(100, Math.max(0, result.probability * 100))}%`
    : "0%";
  const displayedProbabilityPercent = result
    ? (probabilityPercent ?? formatPercent(result.probability))
    : null;
  const meterStyle: ProbabilityMeterStyle = {
    "--probability-position": probabilityPosition,
  };

  return (
    <aside className="result-panel" aria-live="polite">
      {loading && (
        <div className="result-skeleton" aria-label="Calculando resultado">
          <span />
          <span />
          <span />
          <p>Calculando con el modelo entrenado.</p>
        </div>
      )}

      {!loading && !result && !error && (
        <div className="empty-state">
          <span className="status-dot" />
          <p>Completá el formulario para ver una probabilidad orientativa y el contexto del modelo.</p>
        </div>
      )}

      {!loading && error && (
        <div className="message error" role="alert">
          {error}
        </div>
      )}

      {!loading && result && guidance && (
        <div className={`result result-${guidance.tone}`}>
          <div className="result-heading">
            <div>
              <p className="result-kicker">Resumen orientativo</p>
              <h2>{result.risk_label}</h2>
            </div>
          </div>

          <div
            className="probability-meter"
            role="meter"
            aria-label="Semáforo de probabilidad"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(result.probability * 100)}
            style={meterStyle}
          >
            <div className="probability-readout">
              <span>Probabilidad estimada</span>
              <strong>{displayedProbabilityPercent}</strong>
            </div>
            <div className="traffic-track" aria-hidden="true">
              <span className="traffic-segment traffic-green" />
              <span className="traffic-segment traffic-yellow" />
              <span className="traffic-segment traffic-red" />
              <span className="traffic-marker" />
            </div>
            <div className="traffic-labels" aria-hidden="true">
              <span>Verde</span>
              <span>Advertencia</span>
              <span>Alto riesgo</span>
            </div>
          </div>

          <div className="clinical-guidance">
            <p>{guidance.interpretation}</p>
            <strong>{guidance.recommendation}</strong>
          </div>

          <dl className="result-details">
            <div>
              <dt>Tramo</dt>
              <dd>{guidance.range}</dd>
            </div>
            <div>
              <dt>Umbral del modelo</dt>
              <dd>{formatPercent(result.threshold)}</dd>
            </div>
            <div>
              <dt>Modelo</dt>
              <dd>{formatModelName(result.model_name)}</dd>
            </div>
            <div>
              <dt>Valor técnico</dt>
              <dd>{result.probability.toFixed(3)}</dd>
            </div>
          </dl>
        </div>
      )}
    </aside>
  );
}
