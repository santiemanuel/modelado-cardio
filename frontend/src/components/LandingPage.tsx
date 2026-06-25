import { CareMosaicSection } from "./CareMosaicSection";
import { DataChecklistSection } from "./DataChecklistSection";
import { FinalCta } from "./FinalCta";
import { HeroSection } from "./HeroSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { LandingFooter } from "./LandingFooter";
import { LandingHeader } from "./LandingHeader";
import { LimitsSection } from "./LimitsSection";
import { ModelSection } from "./ModelSection";
import { PageMeta } from "./PageMeta";
import { PreventiveUseSection } from "./PreventiveUseSection";
import { ProblemSection } from "./ProblemSection";
import { ServiceStrip } from "./ServiceStrip";
import { StandardsSection } from "./StandardsSection";

export function LandingPage() {
  return (
    <div className="landing-page">
      <PageMeta page="home" />
      <LandingHeader />
      <HeroSection />
      <ServiceStrip />
      <HowItWorksSection />
      <ProblemSection />
      <LimitsSection />
      <PreventiveUseSection />
      <StandardsSection />
      <CareMosaicSection />
      <ModelSection />
      <DataChecklistSection />
      <FinalCta />
      <LandingFooter />
    </div>
  );
}
