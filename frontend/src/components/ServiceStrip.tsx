import { serviceCards } from "./landingContent";

export function ServiceStrip() {
  return (
    <section className="service-strip" id="servicios" aria-label="Servicios preventivos">
      <div className="service-strip-grid">
        {serviceCards.map((card) => (
          <article className="service-card" key={card.title}>
            <span aria-hidden="true">{card.icon}</span>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
          </article>
        ))}
      </div>
      <p className="service-strip-note">
        La presión arterial se confirma con mediciones reales. Un resultado bajo no descarta presión
        alta y uno alto no confirma hipertensión.
      </p>
    </section>
  );
}
