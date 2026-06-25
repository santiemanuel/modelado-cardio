import { neededDataGroups } from "../content/siteContent";

export function DataChecklistSection() {
  return (
    <section className="data-checklist-section" aria-labelledby="data-checklist-title">
      <div className="section-copy">
        <p className="section-kicker">Antes de evaluar</p>
        <h2 id="data-checklist-title">Qué datos conviene tener a mano</h2>
        <p>
          La evaluación funciona mejor cuando cargás mediciones recientes. Si no tenés laboratorio,
          podés usar el modo simple y leer el resultado con más cautela.
        </p>
      </div>

      <div className="data-checklist-grid">
        {neededDataGroups.map((group) => (
          <article className="data-checklist-card" key={group.title}>
            <h3>{group.title}</h3>
            <ul>
              {group.items.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.detail}</strong>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
