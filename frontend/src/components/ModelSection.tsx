const guidanceSteps = [
  {
    number: "1",
    title: "Reunir mediciones",
    body: "Edad, peso, altura y cintura sostienen el modo simple y ayudan a ordenar señales iniciales.",
  },
  {
    number: "2",
    title: "Sumar laboratorio si existe",
    body: "Colesterol total, HDL y HbA1c activan el modo completo cuando tenés resultados recientes.",
  },
  {
    number: "3",
    title: "Leer como prioridad",
    body: "El resultado ordena señales indirectas; la presión se confirma con medición real y consulta.",
  },
] as const;

export function ModelSection() {
  return (
    <section className="model-section" id="modelo" aria-labelledby="model-title">
      <div className="model-section-heading">
        <p className="section-kicker">Antes de evaluar</p>
        <h2 id="model-title">Flujo de lectura antes de evaluar</h2>
        <p>
          Juntá los datos disponibles, entendé qué cambia entre modo simple y completo, y leé el
          resultado como una prioridad orientativa, no como diagnóstico.
        </p>
      </div>

      <ol className="model-flow-list" aria-label="Flujo recomendado antes de evaluar">
        {guidanceSteps.map((step) => (
          <li key={step.number}>
            <span>{step.number}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <aside className="model-flow-summary" aria-label="Resumen del alcance del modelo">
        <h3>Resumen visible</h3>
        <p>
          Si falta laboratorio, la herramienta permite continuar con menos variables y muestra una
          advertencia de menor precisión. Nunca usa la presión arterial medida como entrada del
          modelo.
        </p>
      </aside>
    </section>
  );
}
