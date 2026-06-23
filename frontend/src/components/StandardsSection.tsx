import { standardsCards } from "./landingContent";

export function StandardsSection() {
  return (
    <section className="standards-section" aria-labelledby="standards-title">
      <p className="section-kicker">Cuidado diario</p>
      <h2 id="standards-title">Un recorrido simple para actuar con mejor información</h2>
      <div className="standards-grid">
        {standardsCards.map((card) => (
          <article className="image-service-card" key={card.title}>
            <img src={card.image} alt={card.alt} />
            <div>
              <span />
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
