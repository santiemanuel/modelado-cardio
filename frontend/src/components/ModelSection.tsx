import { modelSignals } from "./landingContent";

export function ModelSection() {
  return (
    <section className="model-section" id="modelo" aria-labelledby="model-title">
      <div>
        <p className="section-kicker">Modelo orientativo</p>
        <h2 id="model-title">Qué datos usa la inferencia</h2>
        <p>
          La evaluación completa trabaja con variables disponibles en controles de salud habituales.
          Si no tenés laboratorio reciente, el modo simple permite continuar con menos información y
          una advertencia de menor precisión.
        </p>
      </div>
      <ul className="signal-list" aria-label="Datos usados por el modelo">
        {modelSignals.map((signal) => (
          <li key={signal}>{signal}</li>
        ))}
      </ul>
    </section>
  );
}
