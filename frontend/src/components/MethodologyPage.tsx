import { getSourcesById } from "../content/sourceContent";
import { clinicalReadinessItems, methodologyTopics } from "../content/siteContent";
import { LandingHeader } from "./LandingHeader";
import { PageMeta } from "./PageMeta";

export function MethodologyPage() {
  const methodologySources = getSourcesById(["S8", "S9", "S10", "S11", "S12", "S13", "S14", "S15", "S16"]);

  return (
    <div className="landing-page">
      <PageMeta page="methodology" />
      <LandingHeader />
      <section className="content-page" aria-labelledby="methodology-title">
        <p className="section-kicker">Metodología</p>
        <h1 id="methodology-title">Cómo se construye la evaluación</h1>
        <p className="content-lede">
          La herramienta usa un modelo de regresión logística entrenado con NHANES 2017-2018. El
          objetivo es ordenar señales indirectas y orientar próximos pasos, no diagnosticar.
        </p>
        <div className="info-grid">
          {methodologyTopics.map((topic) => (
            <article key={topic.title}>
              <h2>{topic.title}</h2>
              <p>{topic.body}</p>
            </article>
          ))}
        </div>

        <section className="content-block" aria-labelledby="methodology-readiness-title">
          <h2 id="methodology-readiness-title">Antes de uso clínico real</h2>
          <p>
            La versión actual es educativa y orientativa. Para usarla como parte de un proceso
            clínico harían falta pasos adicionales.
          </p>
          <ul className="plain-list">
            {clinicalReadinessItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="content-block" aria-labelledby="methodology-sources-title">
          <h2 id="methodology-sources-title">Fuentes metodológicas</h2>
          <div className="source-list">
            {methodologySources.map((source) => (
              <a href={source.url} key={source.id} target="_blank" rel="noreferrer">
                <span>{source.id}</span>
                {source.publisher}: {source.title}
              </a>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
