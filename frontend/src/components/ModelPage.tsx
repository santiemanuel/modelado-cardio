import { useEffect, useState } from "react";

import { requestModelInfo } from "../api";
import type { ModelInfoResponse } from "../api";
import { getSourcesById } from "../content/sourceContent";
import { clinicalReadinessItems, forbiddenFeatures, modelVisibleFields } from "../content/siteContent";
import { LandingHeader } from "./LandingHeader";
import { PageMeta } from "./PageMeta";

const fallbackMetrics = {
  accuracy: 0.721,
  balanced_accuracy: 0.721,
  roc_auc: 0.78,
  average_precision: 0.723,
  recall: 0.726,
  precision: 0.707,
  f1: 0.716,
  brier: 0.191,
  log_loss: 0.564,
};

const fallbackModelSummaries = [
  {
    mode: "complete",
    model_name: "logistic_regression_no_indfmpir",
    model_version: "case1-logreg-no-indfmpir-v2",
    threshold_default: 0.5,
    primary_test_metrics_weighted: [fallbackMetrics],
  },
  {
    mode: "simple",
    model_name: "logistic_regression_simple_no_lab",
    model_version: "case1-logreg-simple-no-lab-v2",
    threshold_default: 0.5,
    primary_test_metrics_weighted: [
      {
        accuracy: 0.719,
        balanced_accuracy: 0.718,
        precision: 0.711,
        recall: 0.753,
        f1: 0.731,
        roc_auc: 0.788,
        average_precision: 0.758,
        brier: 0.187,
        log_loss: 0.557,
      },
    ],
  },
] as const;

function formatModelName(modelName: string) {
  if (modelName === "logistic_regression_no_indfmpir") {
    return "Regresión logística sin INDFMPIR";
  }
  if (modelName === "logistic_regression_simple_no_lab") {
    return "Regresión logística simple";
  }
  if (modelName === "logistic_regression") {
    return "Regresión logística";
  }
  return modelName;
}

export function ModelPage() {
  const [modelInfo, setModelInfo] = useState<ModelInfoResponse | null>(null);
  const modelSources = getSourcesById(["S8", "S9", "S10", "S11", "S12"]);

  useEffect(() => {
    let active = true;
    requestModelInfo()
      .then((info) => {
        if (active && Array.isArray(info.features)) {
          setModelInfo(info);
        }
      })
      .catch(() => {
        if (active) {
          setModelInfo(null);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const metrics = modelInfo?.primary_test_metrics_weighted?.[0] ?? fallbackMetrics;
  const modelSummaries = modelInfo?.model_summaries ?? fallbackModelSummaries;

  return (
    <div className="landing-page">
      <PageMeta page="model" />
      <LandingHeader />
      <section className="content-page" aria-labelledby="model-page-title">
        <p className="section-kicker">Sobre el modelo</p>
        <h1 id="model-page-title">Cómo funciona el modelo</h1>
        <p className="content-lede">
          Este modelo estima señales compatibles con hipertensión a partir de datos indirectos. No
          diagnostica hipertensión, no la descarta y no reemplaza mediciones reales de presión
          arterial ni una consulta profesional.
        </p>

        <div className="info-grid">
          <article className="model-facts-card">
            <h2>Ficha técnica</h2>
            <dl className="stacked-list">
              <div>
                <dt>Fuente de datos</dt>
                <dd>NHANES 2017-2018, encuesta de Estados Unidos.</dd>
              </div>
              <div>
                <dt>Población considerada</dt>
                <dd>Adultos de 20 años o más incluidos en la muestra usada para entrenar y evaluar.</dd>
              </div>
              <div>
                <dt>Modelo activo</dt>
                <dd>{formatModelName(modelInfo?.model_name ?? "logistic_regression_no_indfmpir")}</dd>
              </div>
              <div>
                <dt>Versión del modelo</dt>
                <dd>{modelInfo?.model_version ?? "case1-logreg-no-indfmpir-v2"}</dd>
              </div>
              <div>
                <dt>Metadata</dt>
                <dd>{modelInfo?.metadata_version ?? "case1-metadata-v2"}</dd>
              </div>
              <div>
                <dt>Fecha de entrenamiento</dt>
                <dd>{modelInfo?.trained_at ?? "2026-06-24"}</dd>
              </div>
              <div>
                <dt>Umbral de decisión</dt>
                <dd>
                  0.50. Se informa por transparencia y se muestra separado de los tramos orientativos
                  que ves en el resultado.
                </dd>
              </div>
            </dl>
          </article>
        </div>

        <section className="content-block" aria-labelledby="visible-fields-title">
          <h2 id="visible-fields-title">Datos que usa la evaluación</h2>
          <div className="resource-grid">
            {modelVisibleFields.map((field) => (
              <article className="resource-card" key={field.code}>
                <span>{field.code}</span>
                <h3>{field.label}</h3>
                <p>{field.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="content-block" aria-labelledby="target-variable-title">
          <h2 id="target-variable-title">Variable objetivo derivada</h2>
          <p>
            Para entrenar el modelo se creó <code>hypertension_130_80</code>, una etiqueta interna
            del dataset NHANES. No se pide en el formulario.
          </p>
          <ul className="plain-list">
            <li>
              Usa el promedio de presión sistólica y diastólica, priorizando las lecturas 2 a 4.
            </li>
            <li>
              También considera <code>hbp_med_current</code>, derivada de la pregunta sobre
              medicación actual para bajar la presión.
            </li>
            <li>
              Marca señal positiva si la sistólica es <code>≥130</code>, la diastólica es{" "}
              <code>≥80</code> o hay medicación antihipertensiva actual.
            </li>
          </ul>
          <p>
            Esas columnas definen el objetivo de entrenamiento, pero no entran como datos del modelo.
          </p>
        </section>

        <section className="content-block" aria-labelledby="forbidden-title">
          <h2 id="forbidden-title">Datos que el modelo no usa</h2>
          <p>
            Se excluyen datos que revelarían la respuesta: lecturas de presión, promedios derivados,
            diagnóstico previo y medicación antihipertensiva. Así se evita fuga de información.
          </p>
          <aside className="model-not-requested-note" aria-labelledby="not-requested-title">
            <h3 id="not-requested-title">Datos descartados por diseño operativo</h3>
            <p>
              <code>INDFMPIR</code> quedó fuera por bajo aporte predictivo, poca extrapolación local
              y fricción de carga. Tampoco se piden columnas de auditoría o diseño muestral, como{" "}
              <code>SEQN</code>, <code>WTMEC2YR</code>, <code>SDMVSTRA</code> y <code>SDMVPSU</code>.
            </p>
            <p>
              El modo simple no usa laboratorio; el modo completo sí usa <code>LBXTC</code>,{" "}
              <code>LBDHDD</code> y <code>LBXGH</code>.
            </p>
          </aside>
          <ul className="chip-list">
            {forbiddenFeatures.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </section>

        <section className="content-block" aria-labelledby="metrics-title">
          <h2 id="metrics-title">Métricas actuales del modelo activo</h2>
          <p>
            Estos valores resumen el desempeño observado en una evaluación interna, con regresión
            logística y umbral 0.50. Sirven para entender el comportamiento del modelo; no
            equivalen a una validación clínica externa.
          </p>
          <dl className="metric-grid">
            <div>
              <dt>ROC-AUC</dt>
              <dd>{Number(metrics.roc_auc).toFixed(3)}</dd>
            </div>
            <div>
              <dt>Recall</dt>
              <dd>{Number(metrics.recall).toFixed(3)}</dd>
            </div>
            <div>
              <dt>Precisión</dt>
              <dd>{Number(metrics.precision).toFixed(3)}</dd>
            </div>
            <div>
              <dt>F1</dt>
              <dd>{Number(metrics.f1).toFixed(3)}</dd>
            </div>
            <div>
              <dt>Brier</dt>
              <dd>{Number(metrics.brier).toFixed(3)}</dd>
            </div>
            <div>
              <dt>Log loss</dt>
              <dd>{Number(metrics.log_loss).toFixed(3)}</dd>
            </div>
          </dl>
        </section>

        <section className="content-block" aria-labelledby="metrics-by-mode-title">
          <h2 id="metrics-by-mode-title">Métricas por modo de evaluación</h2>
          <p>
            Las métricas se muestran separadas para no mezclar el modelo completo con laboratorio y
            el modelo simple sin laboratorio.
          </p>
          <div className="metrics-table-wrap">
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>Modo</th>
                  <th>Versión</th>
                  <th>Umbral</th>
                  <th>Accuracy</th>
                  <th>Balanced accuracy</th>
                  <th>Precisión</th>
                  <th>Recall</th>
                  <th>F1</th>
                  <th>ROC-AUC</th>
                  <th>Average precision</th>
                  <th>Brier</th>
                  <th>Log loss</th>
                </tr>
              </thead>
              <tbody>
                {modelSummaries.map((summary) => {
                  const row = summary.primary_test_metrics_weighted[0] ?? {};
                  return (
                    <tr key={summary.mode}>
                      <td>{summary.mode === "simple" ? "Simple sin laboratorio" : "Completa"}</td>
                      <td>{summary.model_version}</td>
                      <td>{Number(summary.threshold_default).toFixed(2)}</td>
                      <td>{Number(row.accuracy).toFixed(3)}</td>
                      <td>{Number(row.balanced_accuracy).toFixed(3)}</td>
                      <td>{Number(row.precision).toFixed(3)}</td>
                      <td>{Number(row.recall).toFixed(3)}</td>
                      <td>{Number(row.f1).toFixed(3)}</td>
                      <td>{Number(row.roc_auc).toFixed(3)}</td>
                      <td>{Number(row.average_precision).toFixed(3)}</td>
                      <td>{Number(row.brier).toFixed(3)}</td>
                      <td>{Number(row.log_loss).toFixed(3)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="content-block" aria-labelledby="limitations-title">
          <h2 id="limitations-title">Limitaciones</h2>
          <ul className="plain-list">
            <li>No está validado clínicamente para población argentina.</li>
            <li>Puede producir falsos positivos y falsos negativos.</li>
            <li>
              Interpretá el resultado junto con mediciones reales, historia clínica y criterio
              profesional.
            </li>
            <li>El uso fuera de la población NHANES requiere cautela.</li>
          </ul>
        </section>

        <section className="content-block" aria-labelledby="clinical-use-title">
          <h2 id="clinical-use-title">Qué faltaría antes de uso clínico real</h2>
          <p>
            Esta versión no está lista para decidir diagnósticos, tratamientos ni derivaciones por sí
            sola. Antes de un uso clínico real harían falta condiciones adicionales.
          </p>
          <ul className="plain-list">
            {clinicalReadinessItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="content-block" aria-labelledby="model-sources-title">
          <h2 id="model-sources-title">Fuentes principales</h2>
          <div className="source-list">
            {modelSources.map((source) => (
              <a href={source.url} key={source.id} target="_blank" rel="noreferrer">
                <span>{source.id}</span>
                {source.publisher}: {source.title}
              </a>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
