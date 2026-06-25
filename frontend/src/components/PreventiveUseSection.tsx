import { preventiveUseCards } from "../content/siteContent";

export function PreventiveUseSection() {
  return (
    <section className="preventive-use-section" aria-labelledby="preventive-use-title">
      <div className="section-heading-centered">
        <p className="section-kicker">Lectura responsable</p>
        <h2 id="preventive-use-title">Una lectura preventiva, no un diagnóstico</h2>
      </div>
      <div className="preventive-use-grid">
        {preventiveUseCards.map((card) => (
          <article className="preventive-use-card" key={card.title}>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
