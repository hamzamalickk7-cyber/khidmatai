"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart, Home, ShieldCheck, UserRound } from "lucide-react";
import { ProfileCompletenessCard } from "@/modules/profile/components/profile-completeness-card";
import { ProfileFeedbackBanner, type ProfileFeedbackState } from "@/modules/profile/components/profile-operation-feedback";
import {
  ProfileSectionTabs,
  type ProfileSectionTabDefinition,
} from "@/modules/profile/components/profile-section-tabs";
import { CustomerAddressesSection } from "@/modules/profile/components/customer/customer-addresses-section";
import { CustomerContactSection } from "@/modules/profile/components/customer/customer-contact-section";
import { CustomerPreferencesSection } from "@/modules/profile/components/customer/customer-preferences-section";
import { CustomerProfileHeaderBanner } from "@/modules/profile/components/customer/customer-profile-header-banner";
import { contactOptionList } from "@/modules/profile/components/customer/customer-contact-section";
import { useCustomerProfileQuery, useUpdateCustomerProfileMutation } from "@/modules/profile/hooks/use-customer-profile-query";
import { RouteLoadingState } from "@/components/feedback/route-loading-state";

interface CustomerProfileViewProps {
  authenticationUserId: string;
  customerName: string;
  customerEmail: string;
  initialTabKey?: string;
}

const sectionLabels = { header: "Basic profile", contact: "Contact details" } as const;
type SectionKey = keyof typeof sectionLabels;
type CustomerProfileTabKey = "profile" | "addresses" | "preferences";

const customerProfileTabList: readonly ProfileSectionTabDefinition<CustomerProfileTabKey>[] = [
  { key: "profile", label: "My profile", IconComponent: UserRound },
  { key: "addresses", label: "Saved addresses", IconComponent: Home },
  { key: "preferences", label: "Preferences", IconComponent: Heart },
];

export function CustomerProfileView({ authenticationUserId, customerName, customerEmail, initialTabKey }: CustomerProfileViewProps) {
  const profileQuery = useCustomerProfileQuery(authenticationUserId);
  const updateProfileMutation = useUpdateCustomerProfileMutation(authenticationUserId);
  const [activeTabKey, setActiveTabKey] = useState<CustomerProfileTabKey>(() => normalizeCustomerTabKey(initialTabKey));
  const [sectionCompletionMap, setSectionCompletionMap] = useState<Record<SectionKey, boolean>>({
    header: false,
    contact: false,
  });
  const [profileFeedback, setProfileFeedback] = useState<ProfileFeedbackState>({});

  useEffect(() => {
    function receiveProfileFeedback(event: Event) { setProfileFeedback((event as CustomEvent<ProfileFeedbackState>).detail); }
    window.addEventListener("khidmatai:profile-feedback", receiveProfileFeedback);
    return () => window.removeEventListener("khidmatai:profile-feedback", receiveProfileFeedback);
  }, []);
  // These start `null` (no override) and derive from the loaded profile
  // below; a child section calls the setter only to reflect an unsaved
  // local edit immediately, ahead of the next query refetch.
  const [preferredContactLabelOverride, setPreferredContactLabelOverride] = useState<string | null>(null);
  const [savedAddressCountOverride, setSavedAddressCountOverride] = useState<number | null>(null);

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

  if (profileQuery.isLoading) {
    return (
      <main className="bg-background flex-1">
        <RouteLoadingState label="Loading your profile" description="Fetching your saved details." />
      </main>
    );
  }
  if (!profileQuery.data) return <main className="grid min-h-[60vh] place-items-center px-4 text-center"><div><h1 className="text-xl font-semibold">Your profile could not be loaded</h1><button className="text-brand mt-3 text-sm font-semibold" onClick={() => profileQuery.refetch()}>Try again</button></div></main>;
  const profile = profileQuery.data;
  const preferredContactLabel =
    preferredContactLabelOverride ??
    contactOptionList.find((option) => option.value === profile.preferredContactMethod)?.label ??
    "";
  const savedAddressCount = savedAddressCountOverride ?? profile.savedAddresses.length;

  async function saveProfilePatch(patch: Partial<Pick<typeof profile, "fullName" | "phoneNumber" | "city" | "preferredContactMethod" | "servicePreferenceKeys">>) {
    await updateProfileMutation.mutateAsync({
      fullName: patch.fullName ?? profile.fullName,
      phoneNumber: patch.phoneNumber !== undefined ? patch.phoneNumber : profile.phoneNumber,
      city: patch.city !== undefined ? patch.city : profile.city,
      preferredContactMethod: patch.preferredContactMethod ?? profile.preferredContactMethod,
      servicePreferenceKeys: patch.servicePreferenceKeys ?? profile.servicePreferenceKeys,
      expectedVersion: profile.version,
    });
  }

  return (
    <main className="bg-background min-h-full flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5">
          <p className="text-brand text-xs font-bold tracking-[0.16em] uppercase">Customer account</p>
          <h1 className="text-ink mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Manage your profile</h1>
          <p className="text-ink/50 mt-2 text-sm">Keep your contact details and service locations up to date.</p>
        </div>

        <ProfileSectionTabs
          tabList={customerProfileTabList}
          activeTabKey={activeTabKey}
          onTabChange={(tabKey) => changeCustomerTabAndUpdateUrl(tabKey, setActiveTabKey)}
        />

        <div className="mt-5 space-y-5">
          <CustomerProfileHeaderBanner
            initialDisplayName={profile.fullName || customerName}
            initialUsername={profile.username ?? undefined}
            initialCity={profile.city ?? ""}
            onSaveProfile={saveProfilePatch}
            profileImage={profile.profileImage}
            preferredContactLabel={preferredContactLabel}
            savedAddressCount={savedAddressCount}
            onCompletenessChange={makeCompletenessHandler("header")}
          />

          <ProfileCompletenessCard
            checklist={profileChecklist}
            onCompleteNow={() => {
              changeCustomerTabAndUpdateUrl("profile", setActiveTabKey);
            }}
          />

          <ProfileFeedbackBanner {...profileFeedback} />

          <CustomerTabPanel tabKey="profile" activeTabKey={activeTabKey}>
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
              <CustomerContactSection
                emailAddress={profile.emailAddress || customerEmail}
                initialPhoneNumber={profile.phoneNumber ?? ""}
                initialPreferredContactMethod={profile.preferredContactMethod}
                onSaveProfile={saveProfilePatch}
                onCompletenessChange={makeCompletenessHandler("contact")}
                onPreferredContactChange={setPreferredContactLabelOverride}
              />
              <PrivacyCard />
            </div>
          </CustomerTabPanel>

          <CustomerTabPanel tabKey="addresses" activeTabKey={activeTabKey}>
            <CustomerAddressesSection initialAddressList={profile.savedAddresses} onAddressCountChange={setSavedAddressCountOverride} />
          </CustomerTabPanel>

          <CustomerTabPanel tabKey="preferences" activeTabKey={activeTabKey}>
            <CustomerPreferencesSection initialSelectedPreferenceList={profile.servicePreferenceKeys} onSavePreferences={(servicePreferenceKeys) => saveProfilePatch({ servicePreferenceKeys })} />
          </CustomerTabPanel>
        </div>
      </div>
    </main>
  );
}

function CustomerTabPanel({
  tabKey,
  activeTabKey,
  children,
}: {
  tabKey: CustomerProfileTabKey;
  activeTabKey: CustomerProfileTabKey;
  children: React.ReactNode;
}) {
  return (
    <div
      id={`profile-tab-panel-${tabKey}`}
      role="tabpanel"
      aria-labelledby={`profile-tab-${tabKey}`}
      hidden={tabKey !== activeTabKey}
      className="scroll-mt-28"
    >
      {children}
    </div>
  );
}

function PrivacyCard() {
  return (
    <aside className="border-brand/15 bg-brand-soft rounded-2xl border p-5">
      <span className="text-brand grid size-10 place-items-center rounded-lg bg-white shadow-sm">
        <ShieldCheck className="size-5" />
      </span>
      <h2 className="text-ink mt-4 text-base font-semibold">Your details stay private</h2>
      <p className="text-ink/55 mt-2 text-sm leading-6">
        Your phone number and addresses are not public. Only the provider selected for a confirmed booking receives the
        details needed for that job.
      </p>
    </aside>
  );
}

function normalizeCustomerTabKey(tabKey: string | undefined): CustomerProfileTabKey {
  return customerProfileTabList.some((tab) => tab.key === tabKey) ? (tabKey as CustomerProfileTabKey) : "profile";
}

function changeCustomerTabAndUpdateUrl(
  tabKey: CustomerProfileTabKey,
  setActiveTabKey: (tabKey: CustomerProfileTabKey) => void,
) {
  setActiveTabKey(tabKey);
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("tab", tabKey);
  window.history.replaceState(window.history.state, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}
