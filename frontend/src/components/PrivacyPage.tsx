import { getSourcesById } from "../content/sourceContent";
import { LandingHeader } from "./LandingHeader";
import { PageMeta } from "./PageMeta";

export function PrivacyPage() {
  const privacySources = getSourcesById(["S24"]);

  return (
    <div className="landing-page">
      <PageMeta page="privacy" />
      <LandingHeader />
      <section className="content-page" aria-labelledby="privacy-title">
        <p className="section-kicker">Privacidad</p>
        <h1 id="privacy-title">Privacidad, consentimiento y uso de datos</h1>
        <p className="content-lede">
          Los datos que cargás se usan para generar una evaluación orientativa. No necesitás crear
          una cuenta y la aplicación no guarda tus datos en una base externa.
        </p>

        <div className="info-grid">
          <article>
            <h2>Datos procesados</h2>
            <ul className="plain-list">
              <li>Edad, peso y altura para calcular IMC.</li>
              <li>Cintura, colesterol total, HDL y HbA1c.</li>
              <li>Sexo reportado, grupo étnico reportado y tabaquismo actual.</li>
              <li>Resultado del modelo, umbral usado y modelo activo.</li>
            </ul>
          </article>
          <article>
            <h2>Historial local</h2>
            <p>
              Si decidís guardar una evaluación, los datos se almacenan en este dispositivo. No se
              sincronizan con una cuenta ni se envían a una base externa. Podés borrar el historial
              local desde la interfaz.
            </p>
          </article>
        </div>

        <section className="content-block" aria-labelledby="privacy-principles-title">
          <h2 id="privacy-principles-title">Cómo se cuidan tus datos</h2>
          <ul className="plain-list">
            <li>Se piden solo los datos necesarios para calcular la evaluación.</li>
            <li>Se informa para qué se usan los datos y cuáles son los límites del resultado.</li>
            <li>Si guardás evaluaciones en este dispositivo, podés borrarlas desde la interfaz.</li>
            <li>El historial local no se sincroniza con cuentas ni servicios externos.</li>
            <li>La versión del modelo y el umbral se muestran para que el resultado sea trazable.</li>
          </ul>
        </section>

        <section className="content-block" aria-labelledby="privacy-sources-title">
          <h2 id="privacy-sources-title">Marco de referencia</h2>
          <div className="source-list">
            {privacySources.map((source) => (
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
