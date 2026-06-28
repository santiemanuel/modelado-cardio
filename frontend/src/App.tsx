import { EducationPage } from "./components/EducationPage";
import { FaqPage } from "./components/FaqPage";
import { HistoryPage } from "./components/HistoryPage";
import { LandingFooter } from "./components/LandingFooter";
import { LandingPage } from "./components/LandingPage";
import { MethodologyPage } from "./components/MethodologyPage";
import { ModelPage } from "./components/ModelPage";
import { NotFoundPage } from "./components/NotFoundPage";
import { PredictionTool } from "./components/PredictionTool";
import { PrivacyPage } from "./components/PrivacyPage";
import { ResourcesPage } from "./components/ResourcesPage";

function getRouteName(normalizedPath: string) {
  if (normalizedPath === "/") {
    return "home";
  }
  if (normalizedPath === "/evaluar") {
    return "evaluation";
  }
  if (normalizedPath === "/historial" || normalizedPath.startsWith("/historial/")) {
    return "history";
  }
  if (normalizedPath === "/modelo") {
    return "model";
  }
  if (normalizedPath === "/privacidad") {
    return "privacy";
  }
  if (normalizedPath === "/educacion") {
    return "education";
  }
  if (normalizedPath === "/recursos") {
    return "resources";
  }
  if (normalizedPath === "/faq") {
    return "faq";
  }
  if (normalizedPath === "/metodologia" || normalizedPath === "/metodologÃ­a") {
    return "methodology";
  }

  return "not-found";
}

export default function App() {
  const normalizedPath = window.location.pathname.replace(/\/$/, "") || "/";
  const routeName = getRouteName(normalizedPath);
  const shouldShowFooter = routeName !== "evaluation";

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
      <main className={`route-shell route-${routeName}`} id="contenido" tabIndex={-1}>
        {renderRoute()}
      </main>
      {shouldShowFooter ? <LandingFooter /> : null}
    </>
  );
}
