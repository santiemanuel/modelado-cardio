import { EducationPage } from "./components/EducationPage";
import { FaqPage } from "./components/FaqPage";
import { HistoryPage } from "./components/HistoryPage";
import { LandingPage } from "./components/LandingPage";
import { MethodologyPage } from "./components/MethodologyPage";
import { ModelPage } from "./components/ModelPage";
import { NotFoundPage } from "./components/NotFoundPage";
import { PredictionTool } from "./components/PredictionTool";
import { PrivacyPage } from "./components/PrivacyPage";
import { ResourcesPage } from "./components/ResourcesPage";

export default function App() {
  const normalizedPath = window.location.pathname.replace(/\/$/, "") || "/";

  function renderRoute() {
    if (normalizedPath === "/") {
      return <LandingPage />;
    }
    if (normalizedPath === "/evaluar") {
      return <PredictionTool />;
    }
    if (normalizedPath === "/historial") {
      return <HistoryPage />;
    }
    if (normalizedPath.startsWith("/historial/")) {
      return <HistoryPage evaluationId={normalizedPath.replace("/historial/", "")} />;
    }
    if (normalizedPath === "/modelo") {
      return <ModelPage />;
    }
    if (normalizedPath === "/privacidad") {
      return <PrivacyPage />;
    }
    if (normalizedPath === "/educacion") {
      return <EducationPage />;
    }
    if (normalizedPath === "/recursos") {
      return <ResourcesPage />;
    }
    if (normalizedPath === "/faq") {
      return <FaqPage />;
    }
    if (normalizedPath === "/metodologia" || normalizedPath === "/metodología") {
      return <MethodologyPage />;
    }
    if (normalizedPath === "/404") {
      return <NotFoundPage />;
    }
    return <NotFoundPage />;
  }

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <main id="contenido" tabIndex={-1}>
        {renderRoute()}
      </main>
    </>
  );
}
