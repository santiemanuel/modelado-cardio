import type { CSSProperties, FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CalendarDays,
  Check,
  Clock3,
  Dumbbell,
  Eye,
  HeartPulse,
  Minus,
  Plus,
  Trash2,
  Utensils,
  X,
} from "lucide-react";

import type { PredictionResponse, ShapExplanation } from "../api";
import { stateCopy } from "../content/evaluationContent";
import { disclaimers, getResultRange } from "../content/siteContent";
import {
  clearAllHistoryData,
  createLocalId,
  formatDateOnly,
  formatTimeOnly,
  getPressureRecordsForDate,
  historyActionOptions,
  readHistory,
  readPressureRecords,
  toLocalDateKey,
  writeHistory,
  writePressureRecords,
  type HistoryActionId,
  type PressureRecord,
  type SavedEvaluation,
} from "../utils/historyStorage";
import { LandingHeader } from "./LandingHeader";
import { PageMeta } from "./PageMeta";
import { PredictionResultPanel } from "./PredictionResultPanel";

type HistoryPageProps = {
  evaluationId?: string;
};

type PressureFormValues = Omit<PressureRecord, "id">;

type ChartPoint = {
  evaluation: SavedEvaluation;
  x: number;
  probabilityY: number;
  systolicY: number | null;
  diastolicY: number | null;
  dateKey: string;
  factors: ShapExplanation[];
};

type ChartMetrics = {
  width: number;
  height: number;
  offsetLeft: number;
  offsetTop: number;
};

type HistoryHoverStyle = CSSProperties & {
  "--history-hover-x": string;
  "--history-hover-y": string;
};

const actionIconMap = {
  nutrition: Utensils,
  exercise: Dumbbell,
  measure: HeartPulse,
} satisfies Record<HistoryActionId, typeof Activity>;

function sortPressureRecords(records: PressureRecord[]) {
  return [...records].sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));
}

function numericPressure(value: string) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function average(values: Array<number | null>) {
  const numbers = values.filter((value): value is number => value !== null);
  if (!numbers.length) {
    return null;
  }

  return Math.round(numbers.reduce((total, value) => total + value, 0) / numbers.length);
}

function getAveragePressure(records: PressureRecord[]) {
  const systolic = average(records.map((record) => numericPressure(record.systolic)));
  const diastolic = average(records.map((record) => numericPressure(record.diastolic)));

  if (systolic === null || diastolic === null) {
    return null;
  }

  return { systolic, diastolic };
}

function getPeakPressure(records: PressureRecord[]) {
  return records.reduce<PressureRecord | null>((peak, record) => {
    if (!peak) {
      return record;
    }

    const currentSystolic = numericPressure(record.systolic) ?? 0;
    const peakSystolic = numericPressure(peak.systolic) ?? 0;
    const currentDiastolic = numericPressure(record.diastolic) ?? 0;
    const peakDiastolic = numericPressure(peak.diastolic) ?? 0;

    if (currentSystolic > peakSystolic) {
      return record;
    }
    if (currentSystolic === peakSystolic && currentDiastolic > peakDiastolic) {
      return record;
    }

    return peak;
  }, null);
}

function getEvaluationFactors(evaluation: SavedEvaluation) {
  return (
    evaluation.result?.shap_explanations?.length
      ? evaluation.result.shap_explanations
      : evaluation.shapExplanations ?? []
  ).slice(0, 3);
}

function formatStoredSpanishText(value: string) {
  return value
    .replace(/\banos\b/g, "a\u00f1os")
    .replace(/\bAno\b/g, "A\u00f1o")
    .replace(/\bPerimetro\b/g, "Per\u00edmetro")
    .replace(/\bevaluacion\b/g, "evaluaci\u00f3n")
    .replace(/\bpresion\b/g, "presi\u00f3n")
    .replace(/\bmedicion\b/g, "medici\u00f3n")
    .replace(/\bSi\b/g, "S\u00ed");
}

function getEvaluationResult(evaluation: SavedEvaluation): PredictionResponse {
  const shapExplanations = getEvaluationFactors(evaluation);

  if (evaluation.result) {
    return {
      ...evaluation.result,
      mode: evaluation.result.mode ?? evaluation.mode,
      shap_explanations: evaluation.result.shap_explanations?.length
        ? evaluation.result.shap_explanations
        : shapExplanations,
    };
  }

  const range = getResultRange(evaluation.probability);
  return {
    probability: evaluation.probability,
    threshold: evaluation.threshold,
    prediction: evaluation.probability >= evaluation.threshold ? 1 : 0,
    risk_label: evaluation.riskLabel ?? range.label,
    context: evaluation.context ?? disclaimers.short,
    model_name: evaluation.modelName,
    model_version: evaluation.modelVersion,
    mode: evaluation.mode,
    shap_explanations: shapExplanations,
    shap_base_value: null,
    shap_output_unit: "log_odds",
  };
}

function getStatusLabel(evaluation: SavedEvaluation) {
  return evaluation.probability >= evaluation.threshold ? "Atenci\u00f3n" : "Estable";
}

function getInitialPressureForm(defaultDate?: string): PressureFormValues {
  const now = new Date();
  return {
    date: defaultDate || toLocalDateKey(now),
    time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
    systolic: "",
    diastolic: "",
    pulse: "",
    arm: "No informado",
    notes: "",
  };
}

function DirectionIcon({ direction }: { direction: ShapExplanation["direction"] }) {
  if (direction === "raises_risk") {
    return (
      <span className="history-direction history-direction-up" aria-label="Sube la estimación">
        <ArrowUp aria-hidden="true" />
      </span>
    );
  }

  if (direction === "lowers_risk") {
    return (
      <span className="history-direction history-direction-down" aria-label="Baja la estimación">
        <ArrowDown aria-hidden="true" />
      </span>
    );
  }

  return (
    <span className="history-direction history-direction-neutral" aria-label="Sin cambio relevante">
      <Minus aria-hidden="true" />
    </span>
  );
}

function ReadingFactors({ factors }: { factors: ShapExplanation[] }) {
  if (!factors.length) {
    return <span className="history-muted">Sin lectura guardada</span>;
  }

  return (
    <ul className="history-reading-list">
      {factors.map((factor) => (
        <li key={factor.feature}>
          <span>
            <strong>{formatStoredSpanishText(factor.label)}</strong>
            <em>{formatStoredSpanishText(factor.value)}</em>
          </span>
          <DirectionIcon direction={factor.direction} />
        </li>
      ))}
    </ul>
  );
}

function ActionToggleGroup({
  actions,
  compact = false,
  onToggle,
}: {
  actions: HistoryActionId[];
  compact?: boolean;
  onToggle: (action: HistoryActionId) => void;
}) {
  return (
    <div className={`history-action-toggle-list ${compact ? "history-action-toggle-list-compact" : ""}`}>
      {historyActionOptions.map((option) => {
        const Icon = actionIconMap[option.id];
        const selected = actions.includes(option.id);

        return (
          <button
            className={`history-action-toggle ${selected ? "history-action-toggle-selected" : ""}`}
            type="button"
            aria-pressed={selected}
            title={option.label}
            key={option.id}
            onClick={() => onToggle(option.id)}
          >
            {selected ? <Check aria-hidden="true" /> : <Icon aria-hidden="true" />}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function PressureRecordModal({
  defaultDate,
  onClose,
  onSave,
}: {
  defaultDate?: string;
  onClose: () => void;
  onSave: (record: PressureFormValues) => void;
}) {
  const [values, setValues] = useState<PressureFormValues>(() => getInitialPressureForm(defaultDate));
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof PressureFormValues>(key: K, value: PressureFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const systolic = numericPressure(values.systolic);
    const diastolic = numericPressure(values.diastolic);
    const pulse = values.pulse ? numericPressure(values.pulse) : null;

    if (!values.date || !values.time) {
      setError("Ingresá fecha y hora de la medición.");
      return;
    }
    if (systolic === null || systolic < 70 || systolic > 260) {
      setError("Ingresá una sistólica entre 70 y 260 mmHg.");
      return;
    }
    if (diastolic === null || diastolic < 40 || diastolic > 160) {
      setError("Ingresá una diastólica entre 40 y 160 mmHg.");
      return;
    }
    if (systolic <= diastolic) {
      setError("La sistólica debe ser mayor que la diastólica.");
      return;
    }
    if (values.pulse && (pulse === null || pulse < 30 || pulse > 220)) {
      setError("Ingresá un pulso entre 30 y 220, o dejalo vacío.");
      return;
    }

    onSave(values);
    onClose();
  }

  return (
    <div className="modal-backdrop history-modal-backdrop" role="presentation">
      <form
        className="history-pressure-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pressure-modal-title"
        onSubmit={handleSubmit}
      >
        <div className="modal-heading">
          <div>
            <span>Registro manual</span>
            <h2 id="pressure-modal-title">Agregar presión</h2>
          </div>
          <button className="modal-close" type="button" aria-label="Cerrar modal de presión" onClick={onClose}>
            <X aria-hidden="true" />
          </button>
        </div>

        {error ? (
          <p className="message error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="pressure-form history-pressure-form">
          <label>
            Fecha
            <input
              name="date"
              type="date"
              required
              value={values.date}
              onChange={(event) => updateField("date", event.target.value)}
            />
          </label>
          <label>
            Hora
            <input
              name="time"
              type="time"
              required
              value={values.time}
              onChange={(event) => updateField("time", event.target.value)}
            />
          </label>
          <label>
            Sistólica
            <input
              name="systolic"
              inputMode="numeric"
              required
              value={values.systolic}
              onChange={(event) => updateField("systolic", event.target.value)}
            />
          </label>
          <label>
            Diastólica
            <input
              name="diastolic"
              inputMode="numeric"
              required
              value={values.diastolic}
              onChange={(event) => updateField("diastolic", event.target.value)}
            />
          </label>
          <label>
            Pulso
            <input
              name="pulse"
              inputMode="numeric"
              value={values.pulse}
              onChange={(event) => updateField("pulse", event.target.value)}
            />
          </label>
          <label>
            Brazo
            <select name="arm" value={values.arm} onChange={(event) => updateField("arm", event.target.value)}>
              <option>No informado</option>
              <option>Izquierdo</option>
              <option>Derecho</option>
            </select>
          </label>
          <label className="pressure-notes">
            Observaciones
            <input
              name="notes"
              placeholder="Reposo, actividad previa, medicación indicada..."
              value={values.notes}
              onChange={(event) => updateField("notes", event.target.value)}
            />
          </label>
        </div>

        <div className="history-modal-actions">
          <button className="step-next" type="submit">
            Guardar presión
          </button>
          <button className="form-reset" type="button" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

function PressureChips({ records }: { records: PressureRecord[] }) {
  if (!records.length) {
    return <span className="history-muted">Sin registros</span>;
  }

  return (
    <span className="history-pressure-chip-list">
      {records.map((record) => {
        const isAlert = (numericPressure(record.systolic) ?? 0) >= 140 || (numericPressure(record.diastolic) ?? 0) >= 90;

        return (
          <span className={`history-pressure-chip ${isAlert ? "history-pressure-chip-alert" : ""}`} key={record.id}>
            <span>{record.time}</span>
            <strong>
              {record.systolic}/{record.diastolic}
            </strong>
          </span>
        );
      })}
    </span>
  );
}

function PressureDayPanel({
  onAddPressure,
  records,
}: {
  onAddPressure: () => void;
  records: PressureRecord[];
}) {
  const averagePressure = getAveragePressure(records);

  return (
    <section className="history-detail-card" aria-labelledby="pressure-day-title">
      <div className="history-card-heading">
        <div>
          <p className="section-kicker">Presión arterial</p>
          <h2 id="pressure-day-title">Mediciones del día</h2>
        </div>
        <button className="secondary-link" type="button" onClick={onAddPressure}>
          <Plus aria-hidden="true" />
          Agregar presión
        </button>
      </div>

      {averagePressure ? (
        <p className="history-pressure-summary">
          Promedio registrado: <strong>{averagePressure.systolic}/{averagePressure.diastolic} mmHg</strong>
        </p>
      ) : null}

      {records.length ? (
        <div className="history-pressure-detail-list">
          {records.map((record) => (
            <article className="history-pressure-detail-item" key={record.id}>
              <div>
                <Clock3 aria-hidden="true" />
                <strong>{record.time}</strong>
              </div>
              <p>
                <span>{record.systolic}/{record.diastolic} mmHg</span>
                {record.pulse ? <span>Pulso {record.pulse}</span> : null}
                <span>{record.arm}</span>
              </p>
              {record.notes ? <small>{record.notes}</small> : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="muted-copy">{stateCopy.pressureEmpty}</p>
      )}
    </section>
  );
}

function HistorySummary({
  history,
  pressureRecords,
}: {
  history: SavedEvaluation[];
  pressureRecords: PressureRecord[];
}) {
  const latest = history[0] ?? null;
  const latestDate = latest ? toLocalDateKey(latest.createdAt) : "";
  const latestPressure = latestDate
    ? getAveragePressure(getPressureRecordsForDate(pressureRecords, latestDate))
    : null;
  const peak = getPeakPressure(pressureRecords);
  const actionCount = history.reduce((total, item) => total + (item.actions?.length ?? 0), 0);

  return (
    <section className="history-summary-grid" aria-label="Resumen del historial">
      <article className="history-metric">
        <small>Probabilidad actual</small>
        <strong>{latest ? `${Math.round(latest.probability * 100)}%` : "-"}</strong>
        <span>{latest ? getStatusLabel(latest) : "sin evaluaciones"}</span>
      </article>
      <article className="history-metric" data-tone="blue">
        <small>Promedio del día</small>
        <strong>{latestPressure ? `${latestPressure.systolic}/${latestPressure.diastolic}` : "-"}</strong>
        <span>{latestPressure ? formatDateOnly(latest?.createdAt ?? "") : "sin presión asociada"}</span>
      </article>
      <article className="history-metric" data-tone="red">
        <small>Pico de presión</small>
        <strong>{peak ? `${peak.systolic}/${peak.diastolic}` : "-"}</strong>
        <span>{peak ? formatDateOnly(peak.date) : "sin registros manuales"}</span>
      </article>
      <article className="history-metric" data-tone="amber">
        <small>Acciones registradas</small>
        <strong>{actionCount}</strong>
        <span>marcadas por el usuario</span>
      </article>
    </section>
  );
}

function HistoryChart({
  history,
  pressureRecords,
}: {
  history: SavedEvaluation[];
  pressureRecords: PressureRecord[];
}) {
  const width = 960;
  const height = 300;
  const margin = { top: 24, right: 64, bottom: 42, left: 56 };
  const pressureTicks = [80, 120, 140, 160];
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null);
  const chartWrapRef = useRef<HTMLDivElement | null>(null);
  const [chartMetrics, setChartMetrics] = useState<ChartMetrics>({
    width,
    height,
    offsetLeft: 0,
    offsetTop: 0,
  });
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const orderedHistory = useMemo(
    () => [...history].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [history],
  );

  useEffect(() => {
    const chartWrapElement = chartWrapRef.current;
    if (!chartWrapElement) {
      return;
    }
    const chartWrap = chartWrapElement;

    function updateChartMetrics() {
      const svg = chartWrap.querySelector<SVGSVGElement>(".history-chart");
      if (!svg) {
        return;
      }

      const rect = svg.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }

      const wrapRect = chartWrap.getBoundingClientRect();
      setChartMetrics({
        width: rect.width,
        height: rect.height,
        offsetLeft: rect.left - wrapRect.left + chartWrap.scrollLeft,
        offsetTop: rect.top - wrapRect.top + chartWrap.scrollTop,
      });
    }

    updateChartMetrics();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const resizeObserver = new ResizeObserver(updateChartMetrics);
    resizeObserver.observe(chartWrap);

    return () => resizeObserver.disconnect();
  }, []);

  function x(index: number) {
    if (orderedHistory.length <= 1) {
      return margin.left + plotWidth / 2;
    }
    return margin.left + (plotWidth * index) / (orderedHistory.length - 1);
  }

  function yProbability(probability: number) {
    return margin.top + plotHeight - plotHeight * probability;
  }

  function yPressure(value: number) {
    const min = 60;
    const max = 180;
    return margin.top + plotHeight - (plotHeight * (value - min)) / (max - min);
  }

  const points: ChartPoint[] = orderedHistory.map((evaluation, index) => {
    const dateKey = toLocalDateKey(evaluation.createdAt);
    const averagePressure = getAveragePressure(getPressureRecordsForDate(pressureRecords, dateKey));

    return {
      evaluation,
      x: x(index),
      probabilityY: yProbability(evaluation.probability),
      systolicY: averagePressure ? yPressure(averagePressure.systolic) : null,
      diastolicY: averagePressure ? yPressure(averagePressure.diastolic) : null,
      dateKey,
      factors: getEvaluationFactors(evaluation),
    };
  });

  function pathFor(values: Array<{ x: number; y: number | null }>) {
    return values
      .filter((point): point is { x: number; y: number } => point.y !== null)
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
      .join(" ");
  }

  function getHoverPlacement(point: ChartPoint) {
    const pointX = chartMetrics.offsetLeft + (point.x / width) * chartMetrics.width;
    const pointY = chartMetrics.offsetTop + (point.probabilityY / height) * chartMetrics.height;
    const estimatedCardWidth = 280;
    const estimatedCardHeight = 132;
    const hoverGap = 12;
    const chartBottom = chartMetrics.offsetTop + chartMetrics.height;
    const hasRoomAbove = pointY - estimatedCardHeight - hoverGap >= 0;
    const hasRoomBelow = pointY + estimatedCardHeight + hoverGap <= chartBottom;
    const topBand = margin.top + plotHeight * 0.34;
    const bottomBand = margin.top + plotHeight * 0.66;
    const inline =
      pointX < estimatedCardWidth / 2
        ? "start"
        : pointX > chartMetrics.offsetLeft + chartMetrics.width - estimatedCardWidth / 2
          ? "end"
          : "center";
    const block =
      (!hasRoomAbove || (point.probabilityY <= topBand && hasRoomBelow)) && point.probabilityY < bottomBand
        ? "below"
        : "above";

    return {
      block,
      inline,
    };
  }

  const hoverPlacement = hoveredPoint ? getHoverPlacement(hoveredPoint) : null;
  const hoverStyle: HistoryHoverStyle | undefined = hoveredPoint
    ? {
        "--history-hover-x": `${chartMetrics.offsetLeft + (hoveredPoint.x / width) * chartMetrics.width}px`,
        "--history-hover-y": `${chartMetrics.offsetTop + (hoveredPoint.probabilityY / height) * chartMetrics.height}px`,
      }
    : undefined;

  return (
    <section className="history-chart-shell" aria-labelledby="history-chart-title">
      <div className="history-card-heading">
        <div>
          <p className="section-kicker">Evolución</p>
          <h2 id="history-chart-title">Probabilidad y presión</h2>
        </div>
        <div className="history-legend" aria-hidden="true">
          <span><i className="history-dot history-dot-probability" />Probabilidad</span>
          <span><i className="history-dot history-dot-systolic" />Sistólica prom.</span>
          <span><i className="history-dot history-dot-diastolic" />Diastólica prom.</span>
        </div>
      </div>

      <div className="history-chart-wrap" onMouseLeave={() => setHoveredPoint(null)} ref={chartWrapRef}>
        <svg className="history-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="history-chart-title">
          <rect className="history-chart-bg" x={margin.left} y={margin.top} width={plotWidth} height={plotHeight} />
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
            <g key={tick}>
              <line
                className="history-grid-line"
                x1={margin.left}
                x2={margin.left + plotWidth}
                y1={yProbability(tick)}
                y2={yProbability(tick)}
              />
              <text className="history-tick-label" x={margin.left - 12} y={yProbability(tick) + 4} textAnchor="end">
                {Math.round(tick * 100)}%
              </text>
            </g>
          ))}
          {pressureTicks.map((tick) => (
            <g key={`pressure-${tick}`}>
              <line
                className="history-pressure-grid-line"
                x1={margin.left}
                x2={margin.left + plotWidth}
                y1={yPressure(tick)}
                y2={yPressure(tick)}
              />
              <line
                className="history-pressure-axis-tick"
                x1={margin.left + plotWidth}
                x2={margin.left + plotWidth + 8}
                y1={yPressure(tick)}
                y2={yPressure(tick)}
              />
              <text className="history-tick-label" x={margin.left + plotWidth + 14} y={yPressure(tick) + 4}>
                {tick}
              </text>
            </g>
          ))}
          <line
            className="history-pressure-axis-line"
            x1={margin.left + plotWidth}
            x2={margin.left + plotWidth}
            y1={margin.top}
            y2={margin.top + plotHeight}
          />
          <line
            className="history-threshold-line"
            x1={margin.left}
            x2={margin.left + plotWidth}
            y1={yProbability(0.5)}
            y2={yProbability(0.5)}
          />
          <line
            className="history-pressure-threshold-line"
            x1={margin.left}
            x2={margin.left + plotWidth}
            y1={yPressure(140)}
            y2={yPressure(140)}
          />
          <path className="history-probability-line" d={pathFor(points.map((point) => ({ x: point.x, y: point.probabilityY })))} />
          <path className="history-systolic-line" d={pathFor(points.map((point) => ({ x: point.x, y: point.systolicY })))} />
          <path className="history-diastolic-line" d={pathFor(points.map((point) => ({ x: point.x, y: point.diastolicY })))} />

          {points.map((point) => (
            <g key={point.evaluation.id}>
              <text className="history-month-label" x={point.x} y={margin.top + plotHeight + 28} textAnchor="middle">
                {new Date(point.evaluation.createdAt).toLocaleDateString("es-AR", { month: "short" })}
              </text>
              {point.systolicY !== null ? (
                <circle className="history-systolic-point" cx={point.x} cy={point.systolicY} r="4" />
              ) : null}
              {point.diastolicY !== null ? (
                <circle className="history-diastolic-point" cx={point.x} cy={point.diastolicY} r="4" />
              ) : null}
              <circle
                className={`history-probability-point ${
                  point.evaluation.probability >= point.evaluation.threshold
                    ? "history-probability-point-attention"
                    : "history-probability-point-stable"
                }`}
                cx={point.x}
                cy={point.probabilityY}
                r="6"
                tabIndex={0}
                role="button"
                aria-label={`Ver lectura de ${formatDateOnly(point.evaluation.createdAt)}`}
                onFocus={() => setHoveredPoint(point)}
                onBlur={() => setHoveredPoint(null)}
                onMouseEnter={() => setHoveredPoint(point)}
              />
            </g>
          ))}
        </svg>

        {hoveredPoint && hoverPlacement ? (
          <aside
            className="history-hover-card"
            aria-label="Explicabilidad del punto"
            data-inline={hoverPlacement.inline}
            data-placement={hoverPlacement.block}
            style={hoverStyle}
          >
            <ReadingFactors factors={hoveredPoint.factors} />
          </aside>
        ) : null}
      </div>
    </section>
  );
}

function HistoryTable({
  history,
  onToggleAction,
  pressureRecords,
}: {
  history: SavedEvaluation[];
  pressureRecords: PressureRecord[];
  onToggleAction: (evaluationId: string, action: HistoryActionId) => void;
}) {
  return (
    <section className="history-log-shell" aria-labelledby="history-log-title">
      <div className="history-card-heading">
        <div>
          <p className="section-kicker">Registros recientes</p>
          <h2 id="history-log-title">Historial con acciones</h2>
        </div>
        <span className="history-sort-note">reciente primero</span>
      </div>
      <div className="history-table-wrap">
        <table className="history-records">
          <thead>
            <tr>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Prob.</th>
              <th>Mis acciones</th>
              <th>Registros de presión</th>
              <th>Lectura</th>
              <th>Ver Más</th>
            </tr>
          </thead>
          <tbody>
            {history.map((evaluation) => {
              const dateKey = toLocalDateKey(evaluation.createdAt);
              const dailyPressure = getPressureRecordsForDate(pressureRecords, dateKey);
              const status = getStatusLabel(evaluation);

              return (
                <tr key={evaluation.id}>
                  <td>
                    <span className={`history-state ${evaluation.probability >= evaluation.threshold ? "history-state-attention" : ""}`}>
                      {status}
                    </span>
                  </td>
                  <td>
                    <span className="history-date-cell">
                      <span>
                        <CalendarDays aria-hidden="true" />
                        {formatDateOnly(evaluation.createdAt)}
                      </span>
                      <span>
                        <Clock3 aria-hidden="true" />
                        {formatTimeOnly(evaluation.createdAt)}
                      </span>
                    </span>
                  </td>
                  <td>
                    <span className="history-probability-cell">{Math.round(evaluation.probability * 100)}%</span>
                  </td>
                  <td>
                    <ActionToggleGroup
                      actions={evaluation.actions ?? []}
                      compact
                      onToggle={(action) => onToggleAction(evaluation.id, action)}
                    />
                  </td>
                  <td>
                    <PressureChips records={dailyPressure} />
                  </td>
                  <td>
                    <ReadingFactors factors={getEvaluationFactors(evaluation)} />
                  </td>
                  <td>
                    <a className="history-more-link" href={`/historial/${encodeURIComponent(evaluation.id)}`}>
                      <Eye aria-hidden="true" />
                      Ver Más
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function EmptyHistoryState({ onAddPressure }: { onAddPressure: () => void }) {
  return (
    <section className="history-empty-state" aria-labelledby="history-empty-title">
      <p className="section-kicker">Historial local</p>
      <h2 id="history-empty-title">Todavía no hay mediciones guardadas</h2>
      <p>{stateCopy.historyEmpty}</p>
      <div className="history-empty-actions">
        <a className="step-next" href="/evaluar">Ir a evaluar señales</a>
        <button className="form-reset" type="button" onClick={onAddPressure}>
          <Plus aria-hidden="true" />
          Agregar presión
        </button>
      </div>
    </section>
  );
}

export function HistoryPage({ evaluationId }: HistoryPageProps) {
  const [history, setHistory] = useState<SavedEvaluation[]>(() => readHistory());
  const [pressureRecords, setPressureRecords] = useState<PressureRecord[]>(() => readPressureRecords());
  const [pressureModalDate, setPressureModalDate] = useState<string | null>(null);

  function persistHistory(nextHistory: SavedEvaluation[]) {
    setHistory(nextHistory);
    writeHistory(nextHistory);
  }

  function persistPressureRecords(nextRecords: PressureRecord[]) {
    const sorted = sortPressureRecords(nextRecords);
    setPressureRecords(sorted);
    writePressureRecords(sorted);
  }

  function toggleAction(evaluationIdToUpdate: string, action: HistoryActionId) {
    persistHistory(
      history.map((evaluation) => {
        if (evaluation.id !== evaluationIdToUpdate) {
          return evaluation;
        }

        const currentActions = evaluation.actions ?? [];
        const nextActions = currentActions.includes(action)
          ? currentActions.filter((item) => item !== action)
          : [...currentActions, action];

        return { ...evaluation, actions: nextActions };
      }),
    );
  }

  function addPressureRecord(record: PressureFormValues) {
    persistPressureRecords([{ id: createLocalId(), ...record }, ...pressureRecords]);
  }

  function clearAllData() {
    if (!window.confirm("¿Eliminar todos los datos guardados en este dispositivo?")) {
      return;
    }

    clearAllHistoryData();
    setHistory([]);
    setPressureRecords([]);
  }

  const selectedEvaluation = evaluationId
    ? history.find((evaluation) => evaluation.id === decodeURIComponent(evaluationId))
    : null;

  if (evaluationId) {
    return (
      <HistoryDetail
        evaluation={selectedEvaluation}
        onAddPressure={(date) => setPressureModalDate(date)}
        onSavePressure={addPressureRecord}
        onToggleAction={toggleAction}
        pressureModalDate={pressureModalDate}
        pressureRecords={pressureRecords}
        onClosePressureModal={() => setPressureModalDate(null)}
      />
    );
  }

  return (
    <div className="prediction-page history-page">
      <PageMeta page="history" />
      <LandingHeader />
      <section className="history-section" aria-labelledby="history-title">
        <div className="history-hero-row">
          <div>
            <p className="section-kicker">Historial local</p>
            <h1 id="history-title">Seguimiento</h1>
            <p className="history-subtitle">
              Revisá evaluaciones guardadas, mediciones manuales de presión y acciones realizadas.
            </p>
          </div>
          <div className="history-page-actions">
            <button className="form-reset" type="button" onClick={clearAllData} disabled={!history.length && !pressureRecords.length}>
              <Trash2 aria-hidden="true" />
              Eliminar todos los datos
            </button>
            <button className="step-next" type="button" onClick={() => setPressureModalDate(toLocalDateKey(new Date()))}>
              <Plus aria-hidden="true" />
              Agregar presión
            </button>
          </div>
        </div>

        {history.length ? (
          <>
            <HistorySummary history={history} pressureRecords={pressureRecords} />
            <HistoryChart history={history} pressureRecords={pressureRecords} />
            <HistoryTable history={history} pressureRecords={pressureRecords} onToggleAction={toggleAction} />
          </>
        ) : (
          <EmptyHistoryState onAddPressure={() => setPressureModalDate(toLocalDateKey(new Date()))} />
        )}
      </section>

      {pressureModalDate ? (
        <PressureRecordModal
          defaultDate={pressureModalDate}
          onClose={() => setPressureModalDate(null)}
          onSave={addPressureRecord}
        />
      ) : null}
    </div>
  );
}

function HistoryDetail({
  evaluation,
  onAddPressure,
  onClosePressureModal,
  onSavePressure,
  onToggleAction,
  pressureModalDate,
  pressureRecords,
}: {
  evaluation: SavedEvaluation | null | undefined;
  onAddPressure: (date: string) => void;
  onClosePressureModal: () => void;
  onSavePressure: (record: PressureFormValues) => void;
  onToggleAction: (evaluationId: string, action: HistoryActionId) => void;
  pressureModalDate: string | null;
  pressureRecords: PressureRecord[];
}) {
  const evaluationDate = evaluation ? toLocalDateKey(evaluation.createdAt) : "";
  const dailyPressure = evaluation ? getPressureRecordsForDate(pressureRecords, evaluationDate) : [];
  const result = evaluation ? getEvaluationResult(evaluation) : null;

  return (
    <div className="prediction-page history-page">
      <PageMeta page="history" />
      <LandingHeader />
      <section className="history-section history-detail-section" aria-labelledby="history-detail-title">
        <div className="history-detail-nav">
          <a className="secondary-link" href="/historial">
            <ArrowLeft aria-hidden="true" />
            Volver al historial
          </a>
          {evaluation ? (
            <button className="step-next" type="button" onClick={() => onAddPressure(evaluationDate)}>
              <Plus aria-hidden="true" />
              Agregar presión
            </button>
          ) : null}
        </div>

        {!evaluation || !result ? (
          <section className="history-empty-state" aria-labelledby="history-detail-title">
            <p className="section-kicker">Historial local</p>
            <h1 id="history-detail-title">No encontramos esa medición</h1>
            <p>Puede haber sido eliminada de este dispositivo.</p>
          </section>
        ) : (
          <>
            <div className="history-detail-heading">
              <p className="section-kicker">Detalle de medición</p>
              <h1 id="history-detail-title">Resultado guardado</h1>
              <p>
                {formatDateOnly(evaluation.createdAt)}
                <span>{formatTimeOnly(evaluation.createdAt)}</span>
              </p>
            </div>

            <PredictionResultPanel
              error={null}
              loading={false}
              probabilityPercent={`${Math.round(evaluation.probability * 100)}%`}
              result={result}
              variant="full"
              actions={
                <>
                  <a className="secondary-link" href="/historial">
                    Volver al historial
                  </a>
                  <button className="step-next" type="button" onClick={() => onAddPressure(evaluationDate)}>
                    Agregar presión
                  </button>
                </>
              }
            />

            <section className="history-detail-grid" aria-label="Seguimiento de la medición">
              <section className="history-detail-card" aria-labelledby="detail-actions-title">
                <div className="history-card-heading">
                  <div>
                    <p className="section-kicker">Mis acciones</p>
                    <h2 id="detail-actions-title">Acciones realizadas</h2>
                  </div>
                </div>
                <ActionToggleGroup
                  actions={evaluation.actions ?? []}
                  onToggle={(action) => onToggleAction(evaluation.id, action)}
                />
              </section>

              <PressureDayPanel records={dailyPressure} onAddPressure={() => onAddPressure(evaluationDate)} />

              <section className="history-detail-card history-detail-values-card" aria-labelledby="detail-values-title">
                <div className="history-card-heading">
                  <div>
                    <p className="section-kicker">Datos cargados</p>
                    <h2 id="detail-values-title">Mediciones de la evaluación</h2>
                  </div>
                </div>
                <dl className="saved-values history-detail-values">
                  {evaluation.values.map((item) => (
                    <div key={item.label}>
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </section>
          </>
        )}
      </section>

      {pressureModalDate ? (
        <PressureRecordModal defaultDate={pressureModalDate} onClose={onClosePressureModal} onSave={onSavePressure} />
      ) : null}
    </div>
  );
}
