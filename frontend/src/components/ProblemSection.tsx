import { priorityRows } from "./landingContent";

export function ProblemSection() {
  return (
    <section className="problem-section" id="enfoque" aria-labelledby="focus-title">
      <div className="section-copy">
        <p className="section-kicker">Sobre hipertensión</p>
        <h2 id="focus-title">La presión alta no siempre se siente</h2>
        <p>
          Muchas personas recién detectan valores elevados durante un control. La forma de saberlo
          es medir la presión arterial; esta herramienta solo ayuda a ordenar señales para preparar
          una conversación con el equipo de salud.
        </p>
        <p className="inline-warning">
          Si ya tenés mediciones altas, síntomas o dudas, priorizá una consulta. El resultado no
          confirma ni descarta hipertensión.
        </p>
      </div>
      <div className="care-priority-list" aria-label="Orden sugerido para interpretar la sección">
        {priorityRows.map((row, index) => (
          <article className="care-priority-item" key={row.label}>
            <span className="care-priority-number">{index + 1}</span>
            <div>
              <strong>{row.label}</strong>
              <p>{row.note}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
