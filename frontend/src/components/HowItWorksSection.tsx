import { howItWorksSteps } from "../content/siteContent";
import { assessmentRoute } from "./landingContent";

export function HowItWorksSection() {
  return (
    <section className="how-it-works-section" id="como-funciona" aria-labelledby="how-title">
      <div className="section-copy">
        <p className="section-kicker">Cómo funciona</p>
        <h2 id="how-title">Tres pasos para ordenar tus señales</h2>
        <p>
          El laboratorio reciente mejora la lectura completa. Si no lo tenés, el modo simple permite
          continuar con menos datos y más cautela.
        </p>
        <a className="secondary-link" href={assessmentRoute}>
          Abrir evaluación
        </a>
      </div>
      <div className="step-card-list">
        {howItWorksSteps.map((step, index) => (
          <article className="step-card" key={step.title}>
            <span>{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
