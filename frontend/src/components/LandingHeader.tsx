import logoImage from "../assets/landing/logo.png";
import { assessmentRoute, navLinks } from "./landingContent";

export function LandingHeader() {
  return (
    <header className="site-header" aria-label="Navegación principal">
      <a className="brand-mark" href="/" aria-label="Inicio">
        <img src={logoImage} alt="" />
      </a>
      <nav className="site-nav" aria-label="Secciones">
        {navLinks.map((link) => (
          <a href={link.href} key={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <a className="nav-cta" href={assessmentRoute}>
        Abrir evaluación
      </a>
    </header>
  );
}
