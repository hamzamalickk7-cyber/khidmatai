import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { khidmatAiDatabase } from "../../database/database-connection.js";
import { auditEvents, providerProfiles, providerReferences, providerReviewDecisions, providerServiceAreas, providerServiceCategories } from "../../database/schema/provider-onboarding-schema.js";
import type { ProviderOnboardingUpdateInput } from "./provider-onboarding-types.js";

export async function findProviderOnboardingByAuthenticationUserId(authenticationUserId: string) {
  const [providerProfile] = await khidmatAiDatabase.select().from(providerProfiles).where(eq(providerProfiles.userId, authenticationUserId)).limit(1);
  if (!providerProfile) return null;

  const [providerCategories, providerAreas, providerProfessionalReferences] = await Promise.all([
    khidmatAiDatabase.select({ categoryKey: providerServiceCategories.categoryKey }).from(providerServiceCategories).where(eq(providerServiceCategories.providerProfileId, providerProfile.id)).orderBy(asc(providerServiceCategories.categoryKey)),
    khidmatAiDatabase.select({ areaName: providerServiceAreas.areaName }).from(providerServiceAreas).where(eq(providerServiceAreas.providerProfileId, providerProfile.id)).orderBy(asc(providerServiceAreas.areaName)),
    khidmatAiDatabase.select().from(providerReferences).where(eq(providerReferences.providerProfileId, providerProfile.id)).orderBy(asc(providerReferences.createdAt)),
  ]);

  return { ...providerProfile, categoryKeys: providerCategories.map(({ categoryKey }) => categoryKey), serviceAreas: providerAreas.map(({ areaName }) => areaName), references: providerProfessionalReferences };
}

export async function updateProviderOnboardingDraft(authenticationUserId: string, providerOnboardingUpdate: ProviderOnboardingUpdateInput) {
  return khidmatAiDatabase.transaction(async (databaseTransaction) => {
    const [updatedProviderProfile] = await databaseTransaction.update(providerProfiles).set({
      phoneNumber: providerOnboardingUpdate.phoneNumber,
      addressLine: providerOnboardingUpdate.addressLine,
      city: providerOnboardingUpdate.city,
      yearsOfExperience: providerOnboardingUpdate.yearsOfExperience,
      professionalBio: providerOnboardingUpdate.professionalBio,
      availabilitySummary: providerOnboardingUpdate.availabilitySummary,
      governmentIdentityNumber: providerOnboardingUpdate.governmentIdentityNumber,
      version: sql`${providerProfiles.version} + 1`,
      updatedAt: new Date(),
    }).where(and(eq(providerProfiles.userId, authenticationUserId), eq(providerProfiles.version, providerOnboardingUpdate.expectedVersion), inArray(providerProfiles.status, ["draft", "changes_required"]))).returning({ id: providerProfiles.id, version: providerProfiles.version, status: providerProfiles.status });

    if (!updatedProviderProfile) return null;

    await Promise.all([
      databaseTransaction.delete(providerServiceCategories).where(eq(providerServiceCategories.providerProfileId, updatedProviderProfile.id)),
      databaseTransaction.delete(providerServiceAreas).where(eq(providerServiceAreas.providerProfileId, updatedProviderProfile.id)),
      databaseTransaction.delete(providerReferences).where(eq(providerReferences.providerProfileId, updatedProviderProfile.id)),
    ]);

    await databaseTransaction.insert(providerServiceCategories).values(providerOnboardingUpdate.categoryKeys.map((categoryKey) => ({ providerProfileId: updatedProviderProfile.id, categoryKey })));
    await databaseTransaction.insert(providerServiceAreas).values(providerOnboardingUpdate.serviceAreas.map((areaName) => ({ providerProfileId: updatedProviderProfile.id, areaName })));
    if (providerOnboardingUpdate.references.length > 0) await databaseTransaction.insert(providerReferences).values(providerOnboardingUpdate.references.map((providerReference) => ({ providerProfileId: updatedProviderProfile.id, ...providerReference })));
    await databaseTransaction.insert(auditEvents).values({ actorUserId: authenticationUserId, actorRole: "provider", eventKey: "provider.onboarding_saved", entityType: "provider_profile", entityId: updatedProviderProfile.id });
    return updatedProviderProfile;
  });
}

export async function submitCompletedProviderOnboarding(authenticationUserId: string, expectedProviderProfileVersion: number) {
  return khidmatAiDatabase.transaction(async (databaseTransaction) => {
    const currentProviderProfileResult = await databaseTransaction.execute(sql<{ id: string; status: string }>`select id, status from provider_profiles where user_id = ${authenticationUserId} for update`);
    const currentProviderProfile = currentProviderProfileResult.rows[0] as { id: string; status: string } | undefined;
    if (!currentProviderProfile || !["draft", "changes_required"].includes(currentProviderProfile.status)) return null;

    const [submittedProviderProfile] = await databaseTransaction.update(providerProfiles).set({ status: "submitted", submittedAt: new Date(), updatedAt: new Date(), version: sql`${providerProfiles.version} + 1` }).where(and(
      eq(providerProfiles.id, currentProviderProfile.id), eq(providerProfiles.version, expectedProviderProfileVersion),
      sql`${providerProfiles.phoneNumber} is not null`, sql`${providerProfiles.governmentIdentityNumber} is not null`, sql`${providerProfiles.professionalBio} is not null`,
    )).returning({ id: providerProfiles.id, version: providerProfiles.version });
    if (!submittedProviderProfile) return null;

    await databaseTransaction.insert(providerReviewDecisions).values({ providerProfileId: submittedProviderProfile.id, actorUserId: authenticationUserId, action: "submit", previousStatus: currentProviderProfile.status, nextStatus: "submitted", reason: "Provider submitted onboarding for review." });
    return submittedProviderProfile;
  });
}
