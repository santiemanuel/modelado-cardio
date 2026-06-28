import { CareMosaicSection } from "./CareMosaicSection";
import { FinalCta } from "./FinalCta";
import { HeroSection } from "./HeroSection";
import { LandingHeader } from "./LandingHeader";
import { LimitsSection } from "./LimitsSection";
import { ModelSection } from "./ModelSection";
import { PageMeta } from "./PageMeta";
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
      <ProblemSection />
      <LimitsSection />
      <StandardsSection />
      <CareMosaicSection />
      <ModelSection />
      <FinalCta />
    </div>
  );
}
