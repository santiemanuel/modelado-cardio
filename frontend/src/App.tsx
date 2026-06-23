import { LandingPage } from "./components/LandingPage";
import { PredictionTool } from "./components/PredictionTool";

export default function App() {
  const normalizedPath = window.location.pathname.replace(/\/$/, "") || "/";
  const isPredictionRoute = normalizedPath === "/evaluar";

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <main id="contenido" tabIndex={-1}>
        {isPredictionRoute ? <PredictionTool /> : <LandingPage />}
      </main>
    </>
  );
}
