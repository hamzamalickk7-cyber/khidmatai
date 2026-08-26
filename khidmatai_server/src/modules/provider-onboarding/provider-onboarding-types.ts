export const editableProviderOnboardingStatuses = ["draft", "changes_required"] as const;
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
  expectedVersion: number;
}
