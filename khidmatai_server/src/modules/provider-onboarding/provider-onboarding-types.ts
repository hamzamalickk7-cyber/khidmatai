export const editableProviderOnboardingStatuses = ["draft", "changes_required", "active"] as const;
export type EditableProviderOnboardingStatus = (typeof editableProviderOnboardingStatuses)[number];

export interface ProviderReferenceInput {
  fullName: string;
  relationship: string;
  email?: string;
  phoneNumber?: string;
}

export interface ProviderOnboardingUpdateInput {
  fullName: string;
  phoneNumber: string;
  addressLine: string;
  city: string;
  professionalTitle: string;
  yearsOfExperience: number;
  professionalBio: string;
  availabilitySummary: string;
  governmentIdentityNumber: string;
  categoryKeys: string[];
  serviceAreas: string[];
  references: ProviderReferenceInput[];
  languages: string[];
  services: Array<{ categorySlug: string; name: string; description?: string; startingPriceAmount: number }>;
  weeklyAvailability: Array<{ dayOfWeek: number; startTime: string; endTime: string }>;
  isAvailableForNewJobs: boolean;
  offersEmergencyService: boolean;
  maximumTravelDistanceKilometers: number;
  expectedVersion: number;
}

export type ProviderOnboardingPatchInput = Partial<Omit<ProviderOnboardingUpdateInput, "expectedVersion">> & Pick<ProviderOnboardingUpdateInput, "expectedVersion">;
