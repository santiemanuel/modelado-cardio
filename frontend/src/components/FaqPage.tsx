import { faqItems } from "../content/siteContent";
import { LandingHeader } from "./LandingHeader";
import { PageMeta } from "./PageMeta";

export function FaqPage() {
  return (
    <div className="landing-page">
      <PageMeta page="faq" />
      <LandingHeader />
      <section className="content-page" aria-labelledby="faq-title">
        <p className="section-kicker">Preguntas frecuentes</p>
        <h1 id="faq-title">Respuestas rápidas antes de usar la evaluación</h1>
        <p className="content-lede">
          Estas respuestas ayudan a interpretar el alcance de la herramienta, los datos que solicita
          y los límites del resultado.
        </p>
        <div className="faq-list">
          {faqItems.map((item) => (
            <article className="faq-item" key={item.question}>
              <h2>{item.question}</h2>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
