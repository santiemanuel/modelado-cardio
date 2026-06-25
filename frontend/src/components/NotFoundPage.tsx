import { assessmentRoute } from "./landingContent";
import { LandingHeader } from "./LandingHeader";
import { PageMeta } from "./PageMeta";

export function NotFoundPage() {
  return (
    <div className="landing-page">
      <PageMeta page="notFound" />
      <LandingHeader />
      <section className="content-page not-found-page" aria-labelledby="not-found-title">
        <p className="section-kicker">Página no encontrada</p>
        <h1 id="not-found-title">No encontramos esa sección</h1>
        <p className="content-lede">
          Podés volver al inicio o abrir la evaluación orientativa para cargar tus datos.
        </p>
        <div className="result-actions">
          <a className="primary-cta" href={assessmentRoute}>
            Abrir evaluación
          </a>
          <a className="secondary-link" href="/">
            Volver al inicio
          </a>
        </div>
      </section>
    </div>
  );
}
