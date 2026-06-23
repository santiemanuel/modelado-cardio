import { priorityRows } from "./landingContent";

export function ProblemSection() {
  return (
    <section className="problem-section" id="enfoque" aria-labelledby="focus-title">
      <div className="section-copy">
        <p className="section-kicker">Sobre hipertensión</p>
        <h2 id="focus-title">La presión alta no siempre se siente</h2>
        <p>
          Muchas personas descubren valores elevados durante un control. Por eso conviene unir
          mediciones, antecedentes y marcadores metabólicos en una lectura fácil de conversar con un
          equipo de salud.
        </p>
      </div>
      <div className="priority-list">
        {priorityRows.map((row) => (
          <article className="priority-item" key={row.label}>
            <div>
              <strong>{row.label}</strong>
              <span>{row.note}</span>
            </div>
            <div className="progress-track" aria-hidden="true">
              <span style={{ width: row.fill }} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
