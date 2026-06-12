import { CareMosaicSection } from "./CareMosaicSection";
import { FinalCta } from "./FinalCta";
import { HeroSection } from "./HeroSection";
import { LandingHeader } from "./LandingHeader";
import { ModelSection } from "./ModelSection";
import { ProblemSection } from "./ProblemSection";
import { ServiceStrip } from "./ServiceStrip";
import { StandardsSection } from "./StandardsSection";

export function LandingPage() {
  return (
    <div className="landing-page">
      <LandingHeader />
      <HeroSection />
      <ServiceStrip />
      <ProblemSection />
      <StandardsSection />
      <CareMosaicSection />
      <ModelSection />
      <FinalCta />
    </div>
  );
}
