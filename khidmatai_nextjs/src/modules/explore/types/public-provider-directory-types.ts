export interface PublicServiceCategory { slug: string; displayName: string; description?: string }
export interface PublicProviderDirectoryItem {
  id: string; username: string; fullName: string; professionalTitle: string; professionalBio: string;
  yearsOfExperience: number; cityName: string; serviceAreas: string[]; profileImageUrl: string | null;
  workImageUrl: string | null; isAvailableForNewJobs: boolean;
  categories: PublicServiceCategory[];
}
export interface PublicProviderDetails extends PublicProviderDirectoryItem {
  availabilitySummary: string | null;
  serviceAreas: string[];
  media: Array<{ id: string; url: string; purpose: "profile_image" | "work_gallery" }>;
}
export interface PublicApiEnvelope<T> { success: true; data: T }
