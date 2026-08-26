import { CustomerAndProviderValuePropositionSection } from "@/modules/landing/components/customer-and-provider-value-proposition-section";
import { FeaturedLocalProvidersShowcaseSection } from "@/modules/landing/components/featured-local-providers-showcase-section";
import { FrequentlyAskedQuestionsSection } from "@/modules/landing/components/frequently-asked-questions-section";
import { HeroSectionWithServiceRequestForm } from "@/modules/landing/components/hero-section-with-service-request-form";
import { HowItWorksProcessTimelineSection } from "@/modules/landing/components/how-it-works-process-timeline-section";
import { PilotServiceAvailabilitySection } from "@/modules/landing/components/pilot-service-availability-section";
import { ProviderRecruitmentCallToActionSection } from "@/modules/landing/components/provider-recruitment-call-to-action-section";
import { ServiceCategoryShowcaseSection } from "@/modules/landing/components/service-category-showcase-section";
import { TrustAndSafetyCommitmentSection } from "@/modules/landing/components/trust-and-safety-commitment-section";
import { TrustPrinciplesHighlightGridSection } from "@/modules/landing/components/trust-principles-highlight-grid-section";

export function LandingPageView() {
  return (
    <main className="flex-1 bg-white">
      <HeroSectionWithServiceRequestForm />
      <PilotServiceAvailabilitySection />
      <ServiceCategoryShowcaseSection />
      <FeaturedLocalProvidersShowcaseSection />
      <HowItWorksProcessTimelineSection />
      <TrustPrinciplesHighlightGridSection />
      <CustomerAndProviderValuePropositionSection />
      <TrustAndSafetyCommitmentSection />
      <FrequentlyAskedQuestionsSection />
      <ProviderRecruitmentCallToActionSection />
    </main>
  );
}
