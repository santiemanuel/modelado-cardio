import { useMemo, useState } from "react";

import { getSourcesById } from "../content/sourceContent";
import { localResources } from "../content/siteContent";
import type { LocalResourceKind } from "../content/siteContent";
import { LandingHeader } from "./LandingHeader";
import { PageMeta } from "./PageMeta";

const filters: LocalResourceKind[] = ["Todos", "Público", "Privado"];

export function ResourcesPage() {
  const [filter, setFilter] = useState<LocalResourceKind>("Todos");
  const filteredResources = useMemo(
    () =>
      filter === "Todos"
        ? localResources
        : localResources.filter((resource) => resource.kind === filter),
    [filter],
  );
  const resourceSources = getSourcesById(["S17", "S18", "S19", "S20", "S21", "S22", "S23"]);

  return (
    <div className="landing-page">
      <PageMeta page="resources" />
      <LandingHeader />
      <section className="content-page" aria-labelledby="resources-title">
        <p className="section-kicker">Recursos locales</p>
        <h1 id="resources-title">Laboratorios y centros de salud en Salta Capital</h1>
        <p className="content-lede">
          Este directorio reúne centros públicos y privados mencionados por fuentes institucionales
          o sitios oficiales. Antes de concurrir, confirmá si realizan colesterol total, HDL y
          HbA1c, si necesitás pedido médico, turno u obra social.
        </p>

        <div className="segmented-control" aria-label="Filtrar centros por tipo">
          {filters.map((option) => (
            <button
              className={option === filter ? "segment-active" : ""}
              type="button"
              key={option}
              onClick={() => setFilter(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="resource-grid">
          {filteredResources.map((center) => (
            <article className="resource-card" key={center.name}>
              <span>{center.kind}</span>
              <h2>{center.name}</h2>
              <p>{center.address}</p>
              <p>{center.evidence}</p>
              <dl className="resource-details">
                <div>
                  <dt>Servicios mencionados</dt>
                  <dd>{center.servicesMentioned.join(", ")}</dd>
                </div>
                <div>
                  <dt>Preguntas para confirmar</dt>
                  <dd>{center.questionsToConfirm.join(", ")}</dd>
                </div>
                <div>
                  <dt>Antes de ir</dt>
                  <dd>{center.scheduleNote}</dd>
                </div>
              </dl>
              <a href={center.sourceUrl} target="_blank" rel="noreferrer">
                Fuente: {center.sourceLabel}
              </a>
            </article>
          ))}
        </div>

        <section className="content-block" aria-labelledby="resource-sources-title">
          <h2 id="resource-sources-title">Fuentes del directorio</h2>
          <div className="source-list">
            {resourceSources.map((source) => (
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
