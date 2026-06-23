import logoImage from "../assets/landing/logo.png";

export function PredictionHeader() {
  return (
    <header className="tool-header" aria-label="Navegación del formulario">
      <a className="brand-mark" href="/" aria-label="Volver al inicio">
        <img src={logoImage} alt="" />
      </a>
      <a className="secondary-link" href="/">
        Volver al sitio
      </a>
    </header>
  );
}
