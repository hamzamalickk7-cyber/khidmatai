"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  CircleUserRound,
  Images,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProfileCompletenessCard } from "@/modules/profile/components/profile-completeness-card";
import { ProfileFeedbackBanner, type ProfileFeedbackState } from "@/modules/profile/components/profile-operation-feedback";
import {
  ProfileSectionTabs,
  type ProfileSectionTabDefinition,
} from "@/modules/profile/components/profile-section-tabs";
import { ProviderApplicationProgressCard } from "@/modules/profile/components/provider-application-progress-card";
import { ProviderAboutMeSection } from "@/modules/profile/components/provider/provider-about-me-section";
import { ProviderAvailabilitySection } from "@/modules/profile/components/provider/provider-availability-section";
import { ProviderDocumentsSection } from "@/modules/profile/components/provider/provider-documents-section";
import { ProviderGallerySection } from "@/modules/profile/components/provider/provider-gallery-section";
import { ProviderProfileHeaderBanner } from "@/modules/profile/components/provider/provider-profile-header-banner";
import { ProviderReferencesSection } from "@/modules/profile/components/provider/provider-references-section";
import { ProviderServicesSection } from "@/modules/profile/components/provider/provider-services-section";
import { useProviderProfileQuery, useSubmitProviderProfileMutation, useUpdateProviderProfileMutation } from "@/modules/profile/hooks/use-provider-profile-query";
import type { ProviderProfileData, ProviderProfileUpdateInput } from "@/modules/profile/types/provider-profile-types";
import { Spinner } from "@/components/ui/spinner";
import { RouteLoadingState } from "@/components/feedback/route-loading-state";
import type { PublicServiceCategory } from "@/modules/explore/types/public-provider-directory-types";

interface ProviderProfileViewProperties {
  authenticationUserId: string;
  providerName: string;
  providerEmail: string;
  initialTabKey?: string;
  serviceCategories: PublicServiceCategory[];
}

const providerTipList = [
  "Use a clear profile photo customers can recognize.",
  "Describe the exact services you can confidently complete.",
  "Add recent work photos and keep your availability accurate.",
];

const sectionLabels = {
  header: "Basic profile",
  about: "About me",
  services: "Services",
  gallery: "Work gallery",
  availability: "Availability",
  documents: "Documents",
} as const;

type SectionKey = keyof typeof sectionLabels;
type ProviderProfileTabKey = "profile" | "services" | "gallery" | "availability" | "verification";

const providerProfileTabList: readonly ProfileSectionTabDefinition<ProviderProfileTabKey>[] = [
  { key: "profile", label: "My profile", IconComponent: CircleUserRound },
  { key: "services", label: "Services", IconComponent: BriefcaseBusiness },
  { key: "gallery", label: "Work gallery", IconComponent: Images },
  { key: "availability", label: "Availability", IconComponent: CalendarDays },
  { key: "verification", label: "Verification", IconComponent: ShieldCheck },
];

export function ProviderProfileView({ authenticationUserId, providerName, providerEmail, initialTabKey, serviceCategories }: ProviderProfileViewProperties) {
  const profileQuery = useProviderProfileQuery(authenticationUserId);
  const updateProfileMutation = useUpdateProviderProfileMutation(authenticationUserId);
  const submitProfileMutation = useSubmitProviderProfileMutation(authenticationUserId);
  const [activeTabKey, setActiveTabKey] = useState<ProviderProfileTabKey>(() => normalizeProviderTabKey(initialTabKey));
  const [sectionCompletionMap, setSectionCompletionMap] = useState<Record<SectionKey, boolean>>({
    header: false,
    about: false,
    services: false,
    gallery: false,
    availability: false,
    documents: false,
  });
  const [profileFeedback, setProfileFeedback] = useState<ProfileFeedbackState>({});
  const [isSubmissionDialogOpen, setIsSubmissionDialogOpen] = useState(false);
  const [isSubmissionRequestPending, setIsSubmissionRequestPending] = useState(false);

  useEffect(() => {
    function receiveProfileFeedback(event: Event) { setProfileFeedback((event as CustomEvent<ProfileFeedbackState>).detail); }
    window.addEventListener("khidmatai:profile-feedback", receiveProfileFeedback);
    return () => window.removeEventListener("khidmatai:profile-feedback", receiveProfileFeedback);
  }, []);

  const makeCompletenessHandler = useCallback(
    (sectionKey: SectionKey) => (isComplete: boolean) =>
      setSectionCompletionMap((current) =>
        current[sectionKey] === isComplete ? current : { ...current, [sectionKey]: isComplete },
      ),
    [],
  );

  const profileChecklist = (Object.keys(sectionLabels) as SectionKey[]).map((sectionKey) => ({
    label: sectionLabels[sectionKey],
    isComplete: sectionCompletionMap[sectionKey],
  }));
  if (profileQuery.isLoading || (profileQuery.isFetching && !profileQuery.data)) {
    return (
      <main className="bg-background flex-1">
        <RouteLoadingState label="Loading your profile" description="Fetching your saved details." />
      </main>
    );
  }
  if (!profileQuery.data) {
    return (
      <main className="grid min-h-[60vh] place-items-center px-4 text-center">
        <div>
          <h1 className="text-xl font-semibold">Your provider profile could not be loaded</h1>
          <p className="mt-2 text-sm text-ink/55">Check that the server is available, then try again.</p>
          <Button className="mt-4" onClick={() => void profileQuery.refetch()}>
            Try again
          </Button>
        </div>
      </main>
    );
  }
  const profile = profileQuery.data;
  const hasBeenSubmitted = ["submitted", "under_review"].includes(profile.status);
  const isApproved = profile.status === "active";
  const areRequiredSectionsComplete = profileChecklist.every((item) => item.isComplete);
  const canSubmitForReview = areRequiredSectionsComplete;

  async function saveProviderProfilePatch(patch: Partial<ProviderProfileUpdateInput>) {
    await updateProfileMutation.mutateAsync({ ...patch, expectedVersion: profile.version });
  }

  return (
    <main className="bg-background min-h-full flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5">
          <p className="text-brand text-xs font-bold tracking-[0.16em] uppercase">Provider workspace</p>
          <h1 className="text-ink mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Manage your profile</h1>
          <p className="text-ink/50 mt-2 text-sm">Keep your public information accurate and prepare it for review.</p>
        </div>

        <ProfileSectionTabs
          tabList={providerProfileTabList}
          activeTabKey={activeTabKey}
          onTabChange={(tabKey) => changeTabAndUpdateUrl(tabKey, setActiveTabKey)}
        />

        <div className="mt-5 space-y-5">
          <ProviderProfileHeaderBanner
            initialDisplayName={profile.fullName || providerName}
            initialUsername={profile.username ?? undefined}
            initialProfessionalTitle={profile.professionalTitle ?? ""}
            initialYearsOfExperience={profile.yearsOfExperience ?? 0}
            initialCity={profile.city ?? ""}
            initialIsAvailableNow={profile.isAvailableForNewJobs}
            statusLabel={profile.status.replaceAll("_", " ")}
            isVerified={profile.status === "active"}
            referenceCount={profile.references.length}
            onSaveProfile={saveProviderProfilePatch}
            profileImage={profile.mediaAssets.find((asset) => asset.mediaPurpose === "profile_image")}
            onCompletenessChange={makeCompletenessHandler("header")}
          />

          <ProfileCompletenessCard
            checklist={profileChecklist}
            onSubmitForReview={() => setIsSubmissionDialogOpen(true)}
            hasBeenSubmitted={hasBeenSubmitted}
            isApproved={isApproved}
            onCompleteNow={() => {
              const firstIncompleteSection = (Object.keys(sectionLabels) as SectionKey[]).find(
                (sectionKey) => !sectionCompletionMap[sectionKey],
              );
              const targetTabKey = getTabForSection(firstIncompleteSection);
              changeTabAndUpdateUrl(targetTabKey, setActiveTabKey);
            }}
          />

          <ProfileFeedbackBanner {...profileFeedback} />

          <TabPanel tabKey="profile" activeTabKey={activeTabKey}>
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              <ProviderAboutMeSection
                emailAddress={profile.emailAddress || providerEmail}
                profile={profile}
                onSaveProfile={saveProviderProfilePatch}
                memberSinceLabel={formatMemberSinceLabel(profile.createdAt)}
                onCompletenessChange={makeCompletenessHandler("about")}
              />
              <aside className="space-y-5">
                <ProviderApplicationProgressCard
                  currentStageKey={profile.status}
                  latestReviewDecision={profile.latestReviewDecision}
                />
                <SubmissionCard profile={profile} onReviewRequirements={() => setIsSubmissionDialogOpen(true)} />
                <ProviderTipsCard />
              </aside>
            </div>
          </TabPanel>

          <TabPanel tabKey="services" activeTabKey={activeTabKey}>
            <ProviderServicesSection profile={profile} availableCategories={serviceCategories} onSaveProfile={saveProviderProfilePatch} onCompletenessChange={makeCompletenessHandler("services")} />
          </TabPanel>

          <TabPanel tabKey="gallery" activeTabKey={activeTabKey}>
            <ProviderGallerySection initialMediaAssets={profile.mediaAssets.filter((asset) => asset.mediaPurpose === "work_gallery")} onCompletenessChange={makeCompletenessHandler("gallery")} />
          </TabPanel>

          <TabPanel tabKey="availability" activeTabKey={activeTabKey}>
            <ProviderAvailabilitySection profile={profile} onSaveProfile={saveProviderProfilePatch} onCompletenessChange={makeCompletenessHandler("availability")} />
          </TabPanel>

          <TabPanel tabKey="verification" activeTabKey={activeTabKey}>
            <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
              <ProviderDocumentsSection initialMediaAssets={profile.mediaAssets} onCompletenessChange={makeCompletenessHandler("documents")} />
              <ProviderReferencesSection
                profile={profile}
                onSaveProfile={saveProviderProfilePatch}
              />
            </div>
          </TabPanel>
        </div>
      </div>

      <ProviderProfileSubmissionDialog
        open={isSubmissionDialogOpen}
        onOpenChange={setIsSubmissionDialogOpen}
        checklist={profileChecklist}
        canSubmitForReview={canSubmitForReview}
        isSubmitting={isSubmissionRequestPending || submitProfileMutation.isPending}
        onSubmit={async () => {
          try {
            setIsSubmissionRequestPending(true);
            // Media is persisted independently from the scalar profile form.
            // Refresh here so submission always uses the latest profile version
            // and server-calculated readiness instead of a stale query snapshot.
            const refreshedProfileResult = await profileQuery.refetch();
            const refreshedProfile = refreshedProfileResult.data;
            if (!refreshedProfile) throw new Error("Your latest profile details could not be loaded. Please try again.");
            if (!refreshedProfile.readiness.canSubmitForReview) {
              throw new Error("Some required profile information has not been saved yet. Review the checklist and save each section before submitting.");
            }
            await submitProfileMutation.mutateAsync(refreshedProfile.version);
            setIsSubmissionDialogOpen(false);
            toast.success("Profile submitted for review.");
          } catch (error) {
            toast.error("Could not submit profile", {
              description: error instanceof Error ? error.message : "Review the required fields and try again.",
            });
          } finally {
            setIsSubmissionRequestPending(false);
          }
        }}
      />
    </main>
  );
}

function TabPanel({
  tabKey,
  activeTabKey,
  children,
}: {
  tabKey: ProviderProfileTabKey;
  activeTabKey: ProviderProfileTabKey;
  children: React.ReactNode;
}) {
  const isActive = tabKey === activeTabKey;

  return (
    <div
      id={`profile-tab-panel-${tabKey}`}
      role="tabpanel"
      aria-labelledby={`profile-tab-${tabKey}`}
      hidden={!isActive}
      className="scroll-mt-28"
    >
      {children}
    </div>
  );
}

function SubmissionCard({ profile, onReviewRequirements }: { profile: ProviderProfileData; onReviewRequirements: () => void }) {
  const hasBeenSubmitted = ["submitted", "under_review"].includes(profile.status);
  const isApproved = profile.status === "active";
  return (
    <section className="bg-ink-soft rounded-2xl p-5 text-white">
      <p className="text-flash text-xs font-bold tracking-[0.14em] uppercase">Profile visibility</p>
      <h2 className="mt-3 text-lg font-semibold">
        {isApproved
          ? "Approved and visible"
          : hasBeenSubmitted
            ? "Submitted for review"
            : profile.status === "changes_required"
              ? "Changes requested"
              : "Private while in draft"}
      </h2>
      <p className="mt-2 text-sm leading-6 text-white/60">
        {isApproved
          ? "Your provider profile is approved and can appear to customers in Explore."
          : hasBeenSubmitted
            ? "Your profile is with the KhidmatAI review team. You will see the decision here."
            : profile.latestReviewDecision?.reason ??
              "Submit after every required section is complete. An administrator must approve the profile before customers can see it."}
      </p>
      <Button
        type="button"
        disabled={hasBeenSubmitted || isApproved}
        onClick={onReviewRequirements}
        className="bg-flash text-ink mt-5 w-full rounded-lg text-sm font-bold hover:bg-white"
      >
        {isApproved ? "Profile is live" : hasBeenSubmitted ? "Review in progress" : "Review and submit"}
      </Button>
    </section>
  );
}

function ProviderProfileSubmissionDialog({
  open,
  onOpenChange,
  checklist,
  canSubmitForReview,
  isSubmitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checklist: Array<{ label: string; isComplete: boolean }>;
  canSubmitForReview: boolean;
  isSubmitting: boolean;
  onSubmit: () => Promise<void>;
}) {
  const remainingCount = checklist.filter((item) => !item.isComplete).length;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!isSubmitting) onOpenChange(nextOpen); }}>
      <DialogContent className="max-w-lg" showCloseButton={!isSubmitting}>
        <DialogHeader>
          <DialogTitle>{canSubmitForReview ? "Ready to submit your profile?" : "Review your profile requirements"}</DialogTitle>
          <DialogDescription>
            {canSubmitForReview
              ? "Everything required is complete. After submission, an administrator will review your profile before it appears in Explore."
              : `${remainingCount} required ${remainingCount === 1 ? "section still needs" : "sections still need"} attention before submission.`}
          </DialogDescription>
        </DialogHeader>

        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {checklist.map((item) => (
            <li key={item.label} className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm font-medium ${item.isComplete ? "border-brand/15 bg-brand-soft/40 text-ink" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
              <span className={`grid size-5 shrink-0 place-items-center rounded-full ${item.isComplete ? "bg-brand text-white" : "bg-amber-200 text-amber-800"}`}>
                {item.isComplete ? <BadgeCheck className="size-3.5" /> : <span className="text-xs font-bold">!</span>}
              </span>
              <span>{item.label}</span>
              <span className="ml-auto text-xs font-normal">{item.isComplete ? "Complete" : "Required"}</span>
            </li>
          ))}
        </ul>

        <p className="text-ink/50 mt-4 rounded-xl bg-ink/[.035] px-4 py-3 text-xs leading-5">
          References are optional and can be added now or later. You can update the profile again if an administrator requests changes.
        </p>

        <DialogFooter>
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => onOpenChange(false)}>
            Continue editing
          </Button>
          <Button type="button" disabled={!canSubmitForReview || isSubmitting} onClick={() => void onSubmit()} className="bg-brand hover:bg-brand-deep min-w-36 text-white">
            {isSubmitting ? <><Spinner className="size-4" /> Submitting…</> : "Submit for review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function ProviderTipsCard() {
  return (
    <section className="border-ink/10 rounded-2xl border bg-white p-5">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Lightbulb className="text-brand size-4" /> Build a stronger profile
      </p>
      <ul className="mt-4 space-y-3">
        {providerTipList.map((tip) => (
          <li key={tip} className="text-ink/55 flex items-start gap-2.5 text-xs leading-5">
            <BadgeCheck className="text-brand mt-0.5 size-3.5 shrink-0" /> {tip}
          </li>
        ))}
      </ul>
    </section>
  );
}

function getTabForSection(sectionKey: SectionKey | undefined): ProviderProfileTabKey {
  if (sectionKey === "services") return "services";
  if (sectionKey === "gallery") return "gallery";
  if (sectionKey === "availability") return "availability";
  if (sectionKey === "documents") return "verification";
  return "profile";
}

function formatMemberSinceLabel(createdAt: string): string {
  const createdDate = new Date(createdAt);
  if (Number.isNaN(createdDate.getTime())) return "Recently";
  return createdDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function normalizeProviderTabKey(tabKey: string | undefined): ProviderProfileTabKey {
  return providerProfileTabList.some((tab) => tab.key === tabKey) ? (tabKey as ProviderProfileTabKey) : "profile";
}

function changeTabAndUpdateUrl(
  tabKey: ProviderProfileTabKey,
  setActiveTabKey: (tabKey: ProviderProfileTabKey) => void,
) {
  setActiveTabKey(tabKey);
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("tab", tabKey);
  window.history.replaceState(window.history.state, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}
