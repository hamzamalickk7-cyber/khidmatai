export interface ProviderAdministrationListItem {
  id: string; name: string; email: string; status: string; city: string | null; yearsOfExperience: number | null;
  submittedAt: string | null; version: number; emailVerified: boolean;
}
export interface ProviderReviewActionInput { providerProfileId: string; action: string; reason: string; expectedVersion: number; }
