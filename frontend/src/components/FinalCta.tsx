import { assessmentRoute } from "./landingContent";

export function FinalCta() {
  return (
    <section className="final-cta" aria-labelledby="final-cta-title">
      <div className="final-cta-content">
        <p className="section-kicker">Siguiente paso</p>
        <h2 id="final-cta-title">Ordená tus señales antes del próximo control</h2>
        <p>
          Cargá tus mediciones y laboratorio si lo tenés para generar un resumen orientativo fácil
          de revisar.
        </p>
        <a className="primary-cta" href={assessmentRoute}>
          Empezar evaluación
        </a>
        <p className="final-cta-note">No reemplaza medición de presión arterial ni consulta médica.</p>
      </div>
    </section>
  );
}
