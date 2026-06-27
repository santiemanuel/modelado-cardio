import { assessmentRoute, heroImages, heroMetrics } from "./landingContent";

export function HeroSection() {
  return (
    <section className="hero-section" id="inicio" aria-labelledby="hero-title">
      <div className="hero-copy">
        <h1 id="hero-title">
          Que la presión alta no pase <span>inadvertida</span>
        </h1>
        <p className="hero-lede">
          Una lectura clara de edad, hábitos y marcadores cardiometabólicos para priorizar la
          medición de presión y conversar con un equipo de salud con mejores preguntas.
        </p>
        <div className="hero-actions">
          <a className="primary-cta" href={assessmentRoute}>
            Evaluar señales
            <span className="cta-mark" aria-hidden="true">
              →
            </span>
          </a>
        </div>
        <dl className="hero-metrics" aria-label="Alcance de la evaluación">
          {heroMetrics.map((metric) => (
            <div key={metric.label}>
              <dt>{metric.value}</dt>
              <dd>{metric.label}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="hero-visual" aria-label="Imágenes sobre prevención cardiometabólica">
        {heroImages.map((image) => (
          <figure className={image.className} key={image.caption}>
            <img src={image.src} alt={image.alt} />
            <figcaption>{image.caption}</figcaption>
          </figure>
        ))}
        <div className="hero-insight" role="note">
          <strong>Predicción orientativa</strong>
          <p>Se confirma con tensiómetro, seguimiento y criterio profesional.</p>
        </div>
      </div>
    </section>
  );
}
