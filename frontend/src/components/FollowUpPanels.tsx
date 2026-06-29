import { useState, type FormEvent } from "react";

import { buttonLabels, stateCopy } from "../content/evaluationContent";
import { ContextDropdown } from "./ContextDropdown";

export type SavedEvaluation = {
  id: string;
  createdAt: string;
  probability: number;
  threshold: number;
  modelName: string;
  bmi: string;
  values: Array<{ label: string; value: string }>;
};

export type PressureRecord = {
  id: string;
  date: string;
  time: string;
  systolic: string;
  diastolic: string;
  pulse: string;
  arm: string;
  notes: string;
};

type FollowUpPanelsProps = {
  history: SavedEvaluation[];
  pressureRecords: PressureRecord[];
  onDeleteHistory: (id: string) => void;
  onClearHistory: () => void;
  onAddPressureRecord: (record: Omit<PressureRecord, "id">) => void;
  onDeletePressureRecord: (id: string) => void;
};

const pressureArmOptions = [
  { value: "No informado", label: "No informado" },
  { value: "Izquierdo", label: "Izquierdo" },
  { value: "Derecho", label: "Derecho" },
];

function formatModelName(modelName: string) {
  if (modelName === "logistic_regression" || modelName === "logistic_regression_no_indfmpir") {
    return "Regresión logística";
  }
  if (modelName === "logistic_regression_simple_no_lab") {
    return "Regresión logística simple";
  }

  return modelName;
}

export function FollowUpPanels({
  history,
  pressureRecords,
  onDeleteHistory,
  onClearHistory,
  onAddPressureRecord,
  onDeletePressureRecord,
}: FollowUpPanelsProps) {
  const [pressureArm, setPressureArm] = useState("No informado");
  const [isArmDropdownOpen, setIsArmDropdownOpen] = useState(false);

  function handlePressureSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onAddPressureRecord({
      date: String(data.get("date") ?? ""),
      time: String(data.get("time") ?? ""),
      systolic: String(data.get("systolic") ?? ""),
      diastolic: String(data.get("diastolic") ?? ""),
      pulse: String(data.get("pulse") ?? ""),
      arm: pressureArm,
      notes: String(data.get("notes") ?? ""),
    });
    event.currentTarget.reset();
    setPressureArm("No informado");
    setIsArmDropdownOpen(false);
  }

  return (
    <section className="follow-up-grid" aria-label="Seguimiento local">
      <article className="follow-up-card">
        <div className="follow-up-heading">
          <div>
            <p className="section-kicker">Historial local</p>
            <h2>Evaluaciones guardadas</h2>
          </div>
          {history.length > 0 ? (
            <button className="text-button" type="button" onClick={onClearHistory}>
              {buttonLabels.deleteHistory}
            </button>
          ) : null}
        </div>
        {history.length === 0 ? (
          <p className="muted-copy">{stateCopy.historyEmpty}</p>
        ) : (
          <div className="saved-list">
            {history.map((item) => (
              <article className="saved-item" key={item.id}>
                <div>
                  <strong>{Math.round(item.probability * 100)}%</strong>
                  <span>{new Date(item.createdAt).toLocaleString("es-AR")}</span>
                </div>
                <p>
                  IMC {item.bmi} · umbral {Math.round(item.threshold * 100)}% ·{" "}
                  {formatModelName(item.modelName)}
                </p>
                <details>
                  <summary>Datos cargados</summary>
                  <dl className="saved-values">
                    {(item.values ?? []).map((value) => (
                      <div key={value.label}>
                        <dt>{value.label}</dt>
                        <dd>{value.value}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
                <button className="text-button" type="button" onClick={() => onDeleteHistory(item.id)}>
                  {buttonLabels.delete}
                </button>
              </article>
            ))}
          </div>
        )}
      </article>

      <article className="follow-up-card">
        <div className="follow-up-heading">
          <div>
            <p className="section-kicker">Registro manual</p>
            <h2>Presión arterial</h2>
          </div>
        </div>
        <p className="muted-copy">
          Estos datos no se envían al modelo. Sirven para conversar con un profesional o preparar un
          resumen de consulta.
        </p>
        <form className="pressure-form" onSubmit={handlePressureSubmit}>
          <label>
            Fecha
            <input name="date" type="date" required />
          </label>
          <label>
            Hora
            <input name="time" type="time" required />
          </label>
          <label>
            Sistólica
            <input name="systolic" inputMode="numeric" placeholder="Ej. 120" required />
          </label>
          <label>
            Diastólica
            <input name="diastolic" inputMode="numeric" placeholder="Ej. 80" required />
          </label>
          <label>
            Pulso
            <input name="pulse" inputMode="numeric" placeholder="Opcional, ej. 72" />
          </label>
          <ContextDropdown
            id="follow-up-pressure-arm"
            label="Brazo"
            name="arm"
            value={pressureArm}
            options={pressureArmOptions}
            isOpen={isArmDropdownOpen}
            className="pressure-form-field"
            onChange={setPressureArm}
            onOpenChange={setIsArmDropdownOpen}
          />
          <label className="pressure-notes">
            Observaciones
            <input name="notes" placeholder="Reposo, actividad previa, medicación indicada..." />
          </label>
          <button className="step-next" type="submit">
            {buttonLabels.savePressureRecord}
          </button>
        </form>
        {pressureRecords.length > 0 ? (
          <div className="pressure-table-wrap">
            <table className="pressure-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Sistólica</th>
                  <th>Diastólica</th>
                  <th>Pulso</th>
                  <th>Brazo</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {pressureRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{record.date}</td>
                    <td>{record.time}</td>
                    <td>{record.systolic}</td>
                    <td>{record.diastolic}</td>
                    <td>{record.pulse || "-"}</td>
                    <td>{record.arm}</td>
                    <td>
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => onDeletePressureRecord(record.id)}
                      >
                        {buttonLabels.delete}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted-copy pressure-empty-copy">{stateCopy.pressureEmpty}</p>
        )}
      </article>
    </section>
  );
}
