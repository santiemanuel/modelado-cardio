import { glossaryEntries } from "../content/glossaryContent";
import { getSourcesById } from "../content/sourceContent";
import { educationSections } from "../content/siteContent";
import { LandingHeader } from "./LandingHeader";
import { PageMeta } from "./PageMeta";

export function EducationPage() {
  const educationSources = getSourcesById(["S1", "S2", "S3", "S4", "S5", "S6", "S7"]);

  return (
    <div className="landing-page">
      <PageMeta page="education" />
      <LandingHeader />
      <section className="content-page" aria-labelledby="education-title">
        <p className="section-kicker">Educación cardiometabólica</p>
        <h1 id="education-title">Guía para entender tus datos</h1>
        <p className="content-lede">
          Esta guía explica por qué la evaluación pregunta por presión arterial, IMC, cintura,
          laboratorio y hábitos. La información es educativa y no reemplaza una consulta médica.
        </p>
        <div className="resource-grid">
          {educationSections.map((section) => (
            <article className="resource-card" key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </article>
          ))}
        </div>

        <section className="content-block" aria-labelledby="glossary-title">
          <p className="section-kicker">Glosario</p>
          <h2 id="glossary-title">Términos clave</h2>
          <div className="resource-grid">
            {glossaryEntries.map((entry) => (
              <article className="resource-card" key={entry.term}>
                <h3>{entry.term}</h3>
                <p>{entry.definition}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="content-block" aria-labelledby="education-sources-title">
          <h2 id="education-sources-title">Fuentes educativas</h2>
          <div className="source-list">
            {educationSources.map((source) => (
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
