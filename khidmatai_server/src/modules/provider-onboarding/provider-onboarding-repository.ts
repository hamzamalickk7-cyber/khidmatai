import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { khidmatAiDatabase } from "../../database/database-connection.js";
import { authenticationUsers } from "../../database/schema/authentication-schema.js";
import {
  auditEvents,
  providerProfiles,
  providerReferences,
  providerOfferedServices,
  providerReviewDecisions,
  providerServiceAreas,
  providerServiceCategories,
  providerSpokenLanguages,
  providerWeeklyAvailabilityWindows,
} from "../../database/schema/provider-onboarding-schema.js";
import { providerProfileMediaAssets } from "../../database/schema/platform-catalogue-schema.js";
import { serviceCategories } from "../../database/schema/service-category-schema.js";
import { editableProviderOnboardingStatuses, type ProviderOnboardingPatchInput } from "./provider-onboarding-types.js";

export async function findProviderOnboardingByAuthenticationUserId(authenticationUserId: string) {
  const [providerProfile] = await khidmatAiDatabase
    .select()
    .from(providerProfiles)
    .where(eq(providerProfiles.userId, authenticationUserId))
    .limit(1);
  if (!providerProfile) return null;

  const [providerCategories, providerAreas, providerProfessionalReferences, latestReviewDecisions, languages, services, weeklyAvailability, mediaAssets] = await Promise.all([
    khidmatAiDatabase
      .select({ categoryKey: sql<string>`coalesce((select slug from service_categories where id = ${providerServiceCategories.categoryId}), ${providerServiceCategories.categoryKey})` })
      .from(providerServiceCategories)
      .where(eq(providerServiceCategories.providerProfileId, providerProfile.id))
      .orderBy(asc(providerServiceCategories.categoryKey)),
    khidmatAiDatabase
      .select({ areaName: providerServiceAreas.areaName })
      .from(providerServiceAreas)
      .where(eq(providerServiceAreas.providerProfileId, providerProfile.id))
      .orderBy(asc(providerServiceAreas.areaName)),
    khidmatAiDatabase
      .select()
      .from(providerReferences)
      .where(eq(providerReferences.providerProfileId, providerProfile.id))
      .orderBy(asc(providerReferences.createdAt)),
    khidmatAiDatabase
      .select({
        action: providerReviewDecisions.action,
        reason: providerReviewDecisions.reason,
        createdAt: providerReviewDecisions.createdAt,
      })
      .from(providerReviewDecisions)
      .where(eq(providerReviewDecisions.providerProfileId, providerProfile.id))
      .orderBy(desc(providerReviewDecisions.createdAt))
      .limit(1),
    khidmatAiDatabase.select({ id: providerSpokenLanguages.id, name: providerSpokenLanguages.languageName }).from(providerSpokenLanguages).where(eq(providerSpokenLanguages.providerProfileId, providerProfile.id)).orderBy(asc(providerSpokenLanguages.languageName)),
    khidmatAiDatabase.select({ id: providerOfferedServices.id, categoryId: providerOfferedServices.categoryId, categorySlug: sql<string>`(select slug from service_categories where id = ${providerOfferedServices.categoryId})`, name: providerOfferedServices.serviceName, description: providerOfferedServices.serviceDescription, startingPriceAmount: providerOfferedServices.startingPriceAmount, currencyCode: providerOfferedServices.currencyCode, displayOrder: providerOfferedServices.displayOrder }).from(providerOfferedServices).where(eq(providerOfferedServices.providerProfileId, providerProfile.id)).orderBy(asc(providerOfferedServices.displayOrder)),
    khidmatAiDatabase.select({ id: providerWeeklyAvailabilityWindows.id, dayOfWeek: providerWeeklyAvailabilityWindows.dayOfWeek, startTime: providerWeeklyAvailabilityWindows.startTime, endTime: providerWeeklyAvailabilityWindows.endTime }).from(providerWeeklyAvailabilityWindows).where(eq(providerWeeklyAvailabilityWindows.providerProfileId, providerProfile.id)).orderBy(asc(providerWeeklyAvailabilityWindows.dayOfWeek), asc(providerWeeklyAvailabilityWindows.startTime)),
    khidmatAiDatabase.select({ id: providerProfileMediaAssets.id, mediaPurpose: providerProfileMediaAssets.mediaPurpose, documentSide: providerProfileMediaAssets.documentSide, url: providerProfileMediaAssets.secureDeliveryUrl, originalFileName: providerProfileMediaAssets.originalFileName, displayOrder: providerProfileMediaAssets.displayOrder }).from(providerProfileMediaAssets).where(eq(providerProfileMediaAssets.providerProfileId, providerProfile.id)).orderBy(asc(providerProfileMediaAssets.displayOrder), asc(providerProfileMediaAssets.createdAt)),
  ]);

  const [providerIdentity] = await khidmatAiDatabase.select({
    fullName: authenticationUsers.name,
    username: authenticationUsers.username,
    emailAddress: authenticationUsers.email,
  }).from(authenticationUsers).where(eq(authenticationUsers.id, authenticationUserId)).limit(1);

  return {
    ...providerProfile,
    ...providerIdentity,
    categoryKeys: providerCategories.map(({ categoryKey }) => categoryKey),
    serviceAreas: providerAreas.map(({ areaName }) => areaName),
    references: providerProfessionalReferences,
    languages,
    services,
    weeklyAvailability,
    mediaAssets,
    latestReviewDecision: normalizeProviderReviewDecisionForProfileOwner(latestReviewDecisions[0]),
    readiness: {
      hasBasicProfile: Boolean(providerIdentity?.username && providerProfile.phoneNumber && providerProfile.city && providerProfile.professionalTitle && providerProfile.professionalBio && providerCategories.length > 0),
      hasServices: services.length > 0,
      hasAvailability: weeklyAvailability.length > 0,
      hasIdentityDocuments: mediaAssets.filter((asset) => asset.mediaPurpose === "identity_document").length >= 2,
      hasWorkGallery: mediaAssets.some((asset) => asset.mediaPurpose === "work_gallery"),
      canSubmitForReview: Boolean(
        providerIdentity?.username
          && providerProfile.phoneNumber
          && providerProfile.governmentIdentityNumber
          && providerProfile.addressLine
          && providerProfile.city
          && providerProfile.professionalTitle
          && providerProfile.yearsOfExperience !== null
          && providerProfile.professionalBio
          && providerProfile.availabilitySummary
          && providerCategories.length > 0
          && services.length > 0
          && providerAreas.length > 0
          && weeklyAvailability.length > 0
          && mediaAssets.some((asset) => asset.mediaPurpose === "identity_document" && asset.documentSide === "front")
          && mediaAssets.some((asset) => asset.mediaPurpose === "identity_document" && asset.documentSide === "back")
          && mediaAssets.some((asset) => asset.mediaPurpose === "work_gallery")
      ),
    },
  };
}

export async function findOrCreateProviderOnboardingByAuthenticationUserId(authenticationUserId: string) {
  const existingProviderOnboarding = await findProviderOnboardingByAuthenticationUserId(authenticationUserId);
  if (existingProviderOnboarding) return existingProviderOnboarding;

  await khidmatAiDatabase
    .insert(providerProfiles)
    .values({ userId: authenticationUserId, status: "draft" })
    .onConflictDoNothing({ target: providerProfiles.userId });

  return findProviderOnboardingByAuthenticationUserId(authenticationUserId);
}

function normalizeProviderReviewDecisionForProfileOwner(
  reviewDecision: { action: string; reason: string; createdAt: Date } | undefined,
) {
  if (!reviewDecision) return null;

  const structuredReasonMatch = reviewDecision.reason.match(/^Required sections:\s*(.+?)\.\n\n([\s\S]+)$/);
  if (!structuredReasonMatch) {
    return { ...reviewDecision, requestedChangeKeys: [] as string[] };
  }

  return {
    ...reviewDecision,
    reason: structuredReasonMatch[2]?.trim() ?? reviewDecision.reason,
    requestedChangeKeys: (structuredReasonMatch[1] ?? "")
      .split(",")
      .map((sectionKey) => sectionKey.trim().replaceAll(" ", "_"))
      .filter(Boolean),
  };
}

export async function updateProviderOnboardingDraft(
  authenticationUserId: string,
  providerOnboardingUpdate: ProviderOnboardingPatchInput,
) {
  return khidmatAiDatabase.transaction(async (databaseTransaction) => {
    const resolvedCategories = providerOnboardingUpdate.categoryKeys
      ? await databaseTransaction
          .select({ id: serviceCategories.id, slug: serviceCategories.slug })
          .from(serviceCategories)
          .where(and(eq(serviceCategories.isActive, true), inArray(serviceCategories.slug, providerOnboardingUpdate.categoryKeys)))
      : [];
    if (providerOnboardingUpdate.categoryKeys && resolvedCategories.length !== providerOnboardingUpdate.categoryKeys.length) return null;
    const requestedServiceCategorySlugs = [...new Set((providerOnboardingUpdate.services ?? []).map((service) => service.categorySlug))];
    const resolvedServiceCategories = providerOnboardingUpdate.services
      ? await databaseTransaction
          .select({ id: serviceCategories.id, slug: serviceCategories.slug })
          .from(serviceCategories)
          .where(and(eq(serviceCategories.isActive, true), inArray(serviceCategories.slug, requestedServiceCategorySlugs)))
      : [];
    const serviceCategoryMap = new Map(resolvedServiceCategories.map((category) => [category.slug, category.id]));
    if (providerOnboardingUpdate.services && serviceCategoryMap.size !== requestedServiceCategorySlugs.length) return null;
    const [updatedProviderProfile] = await databaseTransaction
      .update(providerProfiles)
      .set({
        ...(providerOnboardingUpdate.phoneNumber !== undefined ? { phoneNumber: providerOnboardingUpdate.phoneNumber } : {}),
        ...(providerOnboardingUpdate.addressLine !== undefined ? { addressLine: providerOnboardingUpdate.addressLine } : {}),
        ...(providerOnboardingUpdate.city !== undefined ? { city: providerOnboardingUpdate.city } : {}),
        ...(providerOnboardingUpdate.professionalTitle !== undefined ? { professionalTitle: providerOnboardingUpdate.professionalTitle } : {}),
        ...(providerOnboardingUpdate.yearsOfExperience !== undefined ? { yearsOfExperience: providerOnboardingUpdate.yearsOfExperience } : {}),
        ...(providerOnboardingUpdate.professionalBio !== undefined ? { professionalBio: providerOnboardingUpdate.professionalBio } : {}),
        ...(providerOnboardingUpdate.availabilitySummary !== undefined ? { availabilitySummary: providerOnboardingUpdate.availabilitySummary } : {}),
        ...(providerOnboardingUpdate.isAvailableForNewJobs !== undefined ? { isAvailableForNewJobs: providerOnboardingUpdate.isAvailableForNewJobs } : {}),
        ...(providerOnboardingUpdate.offersEmergencyService !== undefined ? { offersEmergencyService: providerOnboardingUpdate.offersEmergencyService } : {}),
        ...(providerOnboardingUpdate.maximumTravelDistanceKilometers !== undefined ? { maximumTravelDistanceKilometers: providerOnboardingUpdate.maximumTravelDistanceKilometers } : {}),
        ...(providerOnboardingUpdate.governmentIdentityNumber !== undefined ? { governmentIdentityNumber: providerOnboardingUpdate.governmentIdentityNumber } : {}),
        version: sql`${providerProfiles.version} + 1`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(providerProfiles.userId, authenticationUserId),
          eq(providerProfiles.version, providerOnboardingUpdate.expectedVersion),
          inArray(providerProfiles.status, editableProviderOnboardingStatuses),
        ),
      )
      .returning({ id: providerProfiles.id, version: providerProfiles.version, status: providerProfiles.status });

    if (!updatedProviderProfile) return null;

    if (providerOnboardingUpdate.fullName !== undefined) await databaseTransaction
      .update(authenticationUsers)
      .set({ name: providerOnboardingUpdate.fullName, updatedAt: new Date() })
      .where(eq(authenticationUsers.id, authenticationUserId));

    await Promise.all([
      ...(providerOnboardingUpdate.categoryKeys ? [
      databaseTransaction
        .delete(providerServiceCategories)
        .where(eq(providerServiceCategories.providerProfileId, updatedProviderProfile.id))] : []),
      ...(providerOnboardingUpdate.serviceAreas ? [
      databaseTransaction
        .delete(providerServiceAreas)
        .where(eq(providerServiceAreas.providerProfileId, updatedProviderProfile.id))] : []),
      ...(providerOnboardingUpdate.references ? [
      databaseTransaction
        .delete(providerReferences)
        .where(eq(providerReferences.providerProfileId, updatedProviderProfile.id))] : []),
      ...(providerOnboardingUpdate.languages ? [databaseTransaction.delete(providerSpokenLanguages).where(eq(providerSpokenLanguages.providerProfileId, updatedProviderProfile.id))] : []),
      ...(providerOnboardingUpdate.services ? [databaseTransaction.delete(providerOfferedServices).where(eq(providerOfferedServices.providerProfileId, updatedProviderProfile.id))] : []),
      ...(providerOnboardingUpdate.weeklyAvailability ? [databaseTransaction.delete(providerWeeklyAvailabilityWindows).where(eq(providerWeeklyAvailabilityWindows.providerProfileId, updatedProviderProfile.id))] : []),
    ]);

    if (providerOnboardingUpdate.categoryKeys) await databaseTransaction.insert(providerServiceCategories).values(
      resolvedCategories.map((category) => ({ providerProfileId: updatedProviderProfile.id, categoryKey: category.slug, categoryId: category.id })),
    );
    if (providerOnboardingUpdate.serviceAreas) await databaseTransaction.insert(providerServiceAreas).values(
      providerOnboardingUpdate.serviceAreas.map((areaName) => ({
        providerProfileId: updatedProviderProfile.id,
        areaName,
      })),
    );
    if (providerOnboardingUpdate.references?.length)
      await databaseTransaction.insert(providerReferences).values(
        providerOnboardingUpdate.references.map((providerReference) => ({
          providerProfileId: updatedProviderProfile.id,
          ...providerReference,
        })),
      );
    if (providerOnboardingUpdate.languages?.length) await databaseTransaction.insert(providerSpokenLanguages).values(providerOnboardingUpdate.languages.map((languageName) => ({ providerProfileId: updatedProviderProfile.id, languageName })));
    if (providerOnboardingUpdate.services?.length) await databaseTransaction.insert(providerOfferedServices).values(providerOnboardingUpdate.services.map((service, displayOrder) => ({ providerProfileId: updatedProviderProfile.id, categoryId: serviceCategoryMap.get(service.categorySlug), serviceName: service.name, serviceDescription: service.description, startingPriceAmount: service.startingPriceAmount, displayOrder })));
    if (providerOnboardingUpdate.weeklyAvailability?.length) await databaseTransaction.insert(providerWeeklyAvailabilityWindows).values(providerOnboardingUpdate.weeklyAvailability.map((window) => ({ providerProfileId: updatedProviderProfile.id, ...window })));
    await databaseTransaction.insert(auditEvents).values({
      actorUserId: authenticationUserId,
      actorRole: "provider",
      eventKey: "provider.onboarding_saved",
      entityType: "provider_profile",
      entityId: updatedProviderProfile.id,
    });
    return updatedProviderProfile;
  });
}

export async function submitCompletedProviderOnboarding(
  authenticationUserId: string,
  expectedProviderProfileVersion: number,
) {
  return khidmatAiDatabase.transaction(async (databaseTransaction) => {
    const [currentProviderProfile] = await databaseTransaction
      .select({ id: providerProfiles.id, status: providerProfiles.status })
      .from(providerProfiles)
      .where(eq(providerProfiles.userId, authenticationUserId))
      .limit(1);
    if (!currentProviderProfile || !["draft", "changes_required"].includes(currentProviderProfile.status)) return null;

    const [submittedProviderProfile] = await databaseTransaction
      .update(providerProfiles)
      .set({
        status: "submitted",
        submittedAt: new Date(),
        updatedAt: new Date(),
        version: sql`${providerProfiles.version} + 1`,
      })
      .where(
        and(
          eq(providerProfiles.id, currentProviderProfile.id),
          eq(providerProfiles.version, expectedProviderProfileVersion),
          sql`${providerProfiles.phoneNumber} is not null`,
          sql`${providerProfiles.governmentIdentityNumber} is not null`,
          sql`${providerProfiles.addressLine} is not null`,
          sql`${providerProfiles.city} is not null`,
          sql`${providerProfiles.professionalTitle} is not null`,
          sql`${providerProfiles.yearsOfExperience} is not null`,
          sql`${providerProfiles.professionalBio} is not null`,
          sql`${providerProfiles.availabilitySummary} is not null`,
          sql`exists (select 1 from provider_service_categories where provider_profile_id = ${providerProfiles.id})`,
          sql`exists (select 1 from provider_offered_services where provider_profile_id = ${providerProfiles.id} and is_active = true)`,
          sql`exists (select 1 from "user" where id = ${authenticationUserId} and username is not null)`,
          sql`exists (select 1 from provider_service_areas where provider_profile_id = ${providerProfiles.id})`,
          sql`exists (select 1 from provider_weekly_availability_windows where provider_profile_id = ${providerProfiles.id})`,
          sql`exists (select 1 from provider_profile_media_assets where provider_profile_id = ${providerProfiles.id} and media_purpose = 'identity_document' and document_side = 'front')`,
          sql`exists (select 1 from provider_profile_media_assets where provider_profile_id = ${providerProfiles.id} and media_purpose = 'identity_document' and document_side = 'back')`,
          sql`exists (select 1 from provider_profile_media_assets where provider_profile_id = ${providerProfiles.id} and media_purpose = 'work_gallery')`,
        ),
      )
      .returning({ id: providerProfiles.id, version: providerProfiles.version });
    if (!submittedProviderProfile) return null;

    await databaseTransaction.insert(providerReviewDecisions).values({
      providerProfileId: submittedProviderProfile.id,
      actorUserId: authenticationUserId,
      action: "submit",
      previousStatus: currentProviderProfile.status,
      nextStatus: "submitted",
      reason: "Provider submitted onboarding for review.",
    });
    return submittedProviderProfile;
  });
}
