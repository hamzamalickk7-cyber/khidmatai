export interface ProviderAdministrationListItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  status: string;
  city: string | null;
  yearsOfExperience: number | null;
  submittedAt: string | null;
  version: number;
  emailVerified: boolean;
}
export interface ProviderReviewActionInput {
  providerProfileId: string;
  action: string;
  reason?: string;
  requestedChangeKeys?: string[];
  expectedVersion: number;
}
export interface ProviderAdministrationDetail extends ProviderAdministrationListItem {
  phoneNumber: string | null;
  governmentIdentityNumber: string | null;
  addressLine: string | null;
  professionalTitle: string | null;
  professionalBio: string | null;
  availabilitySummary: string | null;
  isAvailableForNewJobs: boolean;
  offersEmergencyService: boolean;
  maximumTravelDistanceKilometers: number | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  banned: boolean;
  deactivatedAt: string | null;
  categoryKeys: string[];
  serviceAreas: string[];
  services: Array<{
    id: string;
    name: string;
    description: string | null;
    startingPriceAmount: string | null;
    currencyCode: string;
    isActive: boolean;
  }>;
  languages: Array<{ id: string; name: string }>;
  weeklyAvailability: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  mediaAssets: Array<{
    id: string;
    mediaPurpose: "profile_image" | "work_gallery" | "identity_document" | "professional_certificate";
    documentSide: "front" | "back" | null;
    url: string;
    originalFileName: string | null;
    mimeType: string;
    byteSize: number;
  }>;
  references: Array<{
    id: string;
    fullName: string;
    relationship: string;
    email: string | null;
    phoneNumber: string | null;
    createdAt: string;
  }>;
  reviewDecisions: Array<{
    id: string;
    actorUserId: string;
    action: string;
    previousStatus: string;
    nextStatus: string;
    reason: string;
    createdAt: string;
  }>;
}
