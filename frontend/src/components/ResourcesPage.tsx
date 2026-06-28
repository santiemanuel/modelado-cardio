import { useMemo, useState } from "react";

import { localResources } from "../content/siteContent";
import type { LocalResourceKind } from "../content/siteContent";
import { LandingHeader } from "./LandingHeader";
import { PageMeta } from "./PageMeta";
import { ResourceContactLinks } from "./ResourceContactLinks";

const filters: LocalResourceKind[] = ["Todos", "Público", "Privado"];

function getResourceAddresses(address: string) {
  return address.split(/\s+\/\s+/).map((value) => value.trim());
}

function getGoogleMapsUrl(centerName: string, address: string) {
  const query = `${centerName}, ${address}, Salta Capital, Salta, Argentina`;
  return `https://maps.google.com/?q=${encodeURIComponent(query)}`;
}

function MapIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.2 2.4 3.4 5.2 3.4 8.5S14.2 18.1 12 20.5" />
      <path d="M12 3.5C9.8 5.9 8.6 8.7 8.6 12s1.2 6.1 3.4 8.5" />
    </svg>
  );
}

export function ResourcesPage() {
  const [filter, setFilter] = useState<LocalResourceKind>("Todos");
  const filteredResources = useMemo(
    () =>
      filter === "Todos"
        ? localResources
        : localResources.filter((resource) => resource.kind === filter),
    [filter],
  );

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

        <div className="resource-grid" key={filter}>
          {filteredResources.map((center) => (
            <article className="resource-card" key={center.name}>
              <span>{center.kind}</span>
              <h2>{center.name}</h2>
              <div className="resource-address-list" aria-label={`Direcciones de ${center.name}`}>
                {getResourceAddresses(center.address).map((address) => (
                  <a
                    className="resource-map-link"
                    href={getGoogleMapsUrl(center.name, address)}
                    target="_blank"
                    rel="noreferrer"
                    key={address}
                    aria-label={`Abrir ${center.name}, ${address}, en Google Maps`}
                  >
                    <MapIcon />
                    <span>{address}</span>
                  </a>
                ))}
              </div>
              <ResourceContactLinks contact={center.contact} />
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
                Ver sitio de {center.sourceLabel}
              </a>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
