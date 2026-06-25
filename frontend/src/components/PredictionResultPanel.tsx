import type { CSSProperties, ReactNode } from "react";

import type { PredictionResponse, ShapExplanation } from "../api";
import { stateCopy } from "../content/evaluationContent";
import { disclaimers, getResultRange, resultFactorGroups } from "../content/siteContent";

type PredictionResultPanelProps = {
  error: string | null;
  loading: boolean;
  probabilityPercent: string | null;
  result: PredictionResponse | null;
  actions?: ReactNode;
  variant?: "default" | "full";
};

type ProbabilityTone = "green" | "yellow" | "red";

type ProbabilityGuidance = {
  tone: ProbabilityTone;
  range: string;
  interpretation: string;
  recommendation: string;
  nextSteps: readonly string[];
};

type ProbabilityMeterStyle = CSSProperties & {
  "--probability-position": string;
};

type ShapImpactStyle = CSSProperties & {
  "--shap-impact": string;
};

function getProbabilityGuidance(probability: number): ProbabilityGuidance {
  const range = getResultRange(probability);
  return {
    tone: range.tone,
    range: `${range.min}-${range.max}%`,
    interpretation: `${range.interpretation} ${range.disclaimer}`,
    recommendation: range.nextStep,
    nextSteps: range.nextSteps,
  };
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatModelName(modelName: string) {
  if (modelName === "logistic_regression" || modelName === "logistic_regression_no_indfmpir") {
    return "Regresión logística";
  }
  if (modelName === "logistic_regression_simple_no_lab") {
    return "Regresión logística simple";
  }

  return modelName
    .split("_")
    .filter(Boolean)
    .map((word, index) => (index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");
}

function getShapDirectionMeta(direction: ShapExplanation["direction"]) {
  if (direction === "raises_risk") {
    return { symbol: "+", label: "Sube la estimacion" };
  }
  if (direction === "lowers_risk") {
    return { symbol: "-", label: "Baja la estimacion" };
  }
  return { symbol: "0", label: "Sin cambio relevante" };
}

export function PredictionResultPanel({
  actions,
  error,
  loading,
  probabilityPercent,
  result,
  variant = "default",
}: PredictionResultPanelProps) {
  const guidance = result ? getProbabilityGuidance(result.probability) : null;
  const probabilityPosition = result
    ? `${Math.min(100, Math.max(0, result.probability * 100))}%`
    : "0%";
  const displayedProbabilityPercent = result
    ? (probabilityPercent ?? formatPercent(result.probability))
    : null;
  const factorGroup =
    result?.mode === "simple" || result?.model_name === "logistic_regression_simple_no_lab"
      ? resultFactorGroups.simple
      : resultFactorGroups.complete;
  const shapExplanations = result?.shap_explanations ?? [];
  const maxShapImpact = Math.max(...shapExplanations.map((item) => Math.abs(item.shap_value)), 0);
  const meterStyle: ProbabilityMeterStyle = {
    "--probability-position": probabilityPosition,
  };

  return (
    <aside className={`result-panel ${variant === "full" ? "result-panel-full" : ""}`} aria-live="polite">
      {loading && (
        <div className="result-skeleton" aria-label="Calculando resultado">
          <span />
          <span />
          <span />
          <p>{stateCopy.resultLoading}</p>
        </div>
      )}

      {!loading && !result && !error && (
        <div className="empty-state">
          <span className="status-dot" />
          <p>{stateCopy.resultEmpty}</p>
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
              <div>
                <span>Probabilidad estimada</span>
                <p>Estimación del modelo, no diagnóstico individual.</p>
              </div>
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
            <p>{result.context}</p>
            <p>{disclaimers.long}</p>
          </div>

          <section className="next-steps-block" aria-labelledby="next-steps-title">
            <h3 id="next-steps-title">Qué hacer ahora</h3>
            <ul className="plain-list">
              {guidance.nextSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </section>

          <section className="factor-explanation" aria-labelledby="factor-explanation-title">
            <h3 id="factor-explanation-title">Qué influyó en este resultado</h3>
            <p>
              SHAP compara los datos cargados con un punto base del modelo. En cada tarjeta,
              + sube la estimación, - la baja y 0 indica un cambio mínimo. No indica causalidad.
            </p>
            {shapExplanations.length > 0 ? (
              <ol className="shap-list">
                {shapExplanations.map((item) => {
                  const directionMeta = getShapDirectionMeta(item.direction);
                  const impactPercent =
                    maxShapImpact > 0
                      ? Math.max(4, Math.round((Math.abs(item.shap_value) / maxShapImpact) * 100))
                      : 0;
                  const shapStyle: ShapImpactStyle = {
                    "--shap-impact": `${impactPercent}%`,
                  };

                  return (
                    <li className={`shap-item shap-${item.direction}`} key={item.feature}>
                      <div className="shap-item-heading">
                        <div>
                          <strong>{item.label}</strong>
                          <span>{item.value}</span>
                        </div>
                        <span
                          className="shap-direction-badge"
                          aria-label={directionMeta.label}
                          title={directionMeta.label}
                        >
                          {directionMeta.symbol}
                        </span>
                      </div>
                      <div className="shap-bar" style={shapStyle} aria-hidden="true">
                        <span />
                      </div>
                      <p>{item.description}</p>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <ul className="chip-list">
                {factorGroup.map((factor) => (
                  <li key={factor}>{factor}</li>
                ))}
              </ul>
            )}
          </section>

          <dl className="result-details">
            <div>
              <dt>Tramo comunicacional</dt>
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
          <div className="result-actions">{actions}</div>
        </div>
      )}
    </aside>
  );
}
