export function LimitsSection() {
  const limits = [
    "No diagnostica.",
    "No prescribe medicación.",
    "No reemplaza medir presión.",
    "No reemplaza seguimiento médico.",
    "No sirve para emergencias.",
  ];

  return (
    <section className="limits-section" aria-labelledby="limits-title">
      <div className="section-copy">
        <p className="section-kicker">Lectura preventiva</p>
        <h2 id="limits-title">Lo que esta herramienta no hace</h2>
        <p>
          Esta evaluación no diagnostica hipertensión, no indica medicación y no debe usarse para
          decidir tratamientos. Un resultado bajo no descarta presión alta. Un resultado alto no
          confirma hipertensión.
        </p>
      </div>
      <div className="limits-panel">
        <ul>
          {limits.map((limit) => (
            <li key={limit}>{limit}</li>
          ))}
        </ul>
        <p role="note">
          Si tenés síntomas preocupantes, malestar intenso o una medición de presión extremadamente
          elevada, buscá atención médica urgente por los canales locales.
        </p>
      </div>
    </section>
  );
}
