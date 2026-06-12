import { serviceCards } from "./landingContent";

export function ServiceStrip() {
  return (
    <section className="service-strip" id="servicios" aria-label="Servicios preventivos">
      {serviceCards.map((card) => (
        <article className="service-card" key={card.title}>
          <span aria-hidden="true">{card.icon}</span>
          <h2>{card.title}</h2>
          <p>{card.description}</p>
        </article>
      ))}
    </section>
  );
}
