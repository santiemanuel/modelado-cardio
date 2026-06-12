import { assessmentRoute } from "./landingContent";

export function FinalCta() {
  return (
    <section className="final-cta" aria-labelledby="final-cta-title">
      <div>
        <p className="section-kicker">Siguiente paso</p>
        <h2 id="final-cta-title">Usá el formulario cuando tengas tus datos a mano</h2>
        <p>
          Vas a recibir una predicción orientativa y un texto de contexto para decidir si corresponde
          medir, repetir controles o consultar.
        </p>
      </div>
      <a className="primary-cta" href={assessmentRoute}>
        Ir al formulario
      </a>
    </section>
  );
}
