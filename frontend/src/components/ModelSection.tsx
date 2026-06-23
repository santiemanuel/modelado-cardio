import { modelSignals } from "./landingContent";

export function ModelSection() {
  return (
    <section className="model-section" id="modelo" aria-labelledby="model-title">
      <div>
        <p className="section-kicker">Modelo orientativo</p>
        <h2 id="model-title">Qué datos usa la inferencia</h2>
        <p>
          El formulario trabaja con variables disponibles en controles de salud habituales. Si no
          tenés alguno de estos datos, conviene obtenerlo mediante una medición o laboratorio antes
          de interpretar el resultado.
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
