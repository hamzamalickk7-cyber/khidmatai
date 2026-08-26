export interface ProviderOnboardingProfile {
  version: number; status: string; phoneNumber?: string | null; addressLine?: string | null; city?: string | null;
  yearsOfExperience?: number | null; professionalBio?: string | null; availabilitySummary?: string | null;
  governmentIdentityNumber?: string | null; categoryKeys: string[]; serviceAreas: string[];
}

export interface ProviderOnboardingUpdate {
  phoneNumber: string; addressLine: string; city: string; yearsOfExperience: number; professionalBio: string;
  availabilitySummary: string; governmentIdentityNumber: string; categoryKeys: string[]; serviceAreas: string[];
  references: never[]; expectedVersion: number;
}
