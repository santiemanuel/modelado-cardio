import { assessmentRoute, navLinks } from "./landingContent";

const currentYear = new Date().getFullYear();

export function LandingFooter() {
  return (
    <footer className="landing-footer" aria-label="Cierre del sitio">
      <div className="footer-main">
        <div className="footer-brand">
          <a className="footer-brand-name" href="/">
            Presión Bajo Control
          </a>
          <p>
            Herramienta educativa para ordenar señales cardiometabólicas antes de medir presión o
            conversar con un equipo de salud.
          </p>
        </div>

        <nav className="footer-nav" aria-label="Secciones del sitio">
          {navLinks.map((link) => (
            <a href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="footer-action">
          <span>Evaluación orientativa</span>
          <p>No confirma ni descarta hipertensión. Interpretá el resultado con mediciones reales.</p>
          <a className="footer-cta" href={assessmentRoute}>
            Abrir evaluación
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {currentYear} Presión Bajo Control</p>
        <p>Medir presión · Revisar datos · Consultar profesionalmente</p>
      </div>
    </footer>
  );
}
