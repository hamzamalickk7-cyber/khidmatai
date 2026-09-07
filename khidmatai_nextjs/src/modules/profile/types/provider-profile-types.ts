export interface ProviderProfileReference {
  id: string;
  fullName: string;
  relationship: string;
  email: string | null;
  phoneNumber: string | null;
}
export interface ProviderProfileData {
  id: string;
  status: string;
  fullName: string;
  username: string | null;
  emailAddress: string;
  phoneNumber: string | null;
  governmentIdentityNumber: string | null;
  addressLine: string | null;
  city: string | null;
  professionalTitle: string | null;
  yearsOfExperience: number | null;
  professionalBio: string | null;
  availabilitySummary: string | null;
  version: number;
  categoryKeys: string[];
  serviceAreas: string[];
  references: ProviderProfileReference[];
  languages: Array<{ id: string; name: string }>;
  services: Array<{ id: string; categoryId: string; categorySlug: string; name: string; description: string | null; startingPriceAmount: number; currencyCode: string; displayOrder: number }>;
  weeklyAvailability: Array<{ id: string; dayOfWeek: number; startTime: string; endTime: string }>;
  mediaAssets: Array<{ id: string; mediaPurpose: "profile_image" | "work_gallery" | "identity_document" | "professional_certificate"; documentSide: "front" | "back" | null; url: string; originalFileName: string | null; displayOrder: number }>;
  isAvailableForNewJobs: boolean;
  offersEmergencyService: boolean;
  maximumTravelDistanceKilometers: number;
  createdAt: string;
  readiness: { hasBasicProfile: boolean; hasServices: boolean; hasAvailability: boolean; hasIdentityDocuments: boolean; hasWorkGallery: boolean; canSubmitForReview: boolean };
  latestReviewDecision: {
    action: string;
    reason: string;
    requestedChangeKeys: string[];
    createdAt: string;
  } | null;
}

export type ProviderProfileUpdateInput = {
  fullName: string; phoneNumber: string; addressLine: string; city: string; professionalTitle: string;
  yearsOfExperience: number; professionalBio: string; availabilitySummary: string; governmentIdentityNumber: string;
  categoryKeys: string[]; serviceAreas: string[]; references: Array<{ fullName: string; relationship: string; email?: string; phoneNumber?: string }>;
  languages: string[]; services: Array<{ categorySlug: string; name: string; description?: string; startingPriceAmount: number }>;
  weeklyAvailability: Array<{ dayOfWeek: number; startTime: string; endTime: string }>;
  isAvailableForNewJobs: boolean; offersEmergencyService: boolean; maximumTravelDistanceKilometers: number; expectedVersion: number;
};
export type ProviderProfilePatchInput = Partial<Omit<ProviderProfileUpdateInput, "expectedVersion">> & Pick<ProviderProfileUpdateInput, "expectedVersion">;

export interface ProviderProfileUpdateResult {
  id: string;
  version: number;
  status: string;
}
