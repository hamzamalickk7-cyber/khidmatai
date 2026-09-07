import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { khidmatAiDatabase } from "../../database/database-connection.js";
import { authenticationSessions, authenticationUsers } from "../../database/schema/authentication-schema.js";
import {
  auditEvents,
  providerProfiles,
  providerOfferedServices,
  providerReferences,
  providerReviewDecisions,
  providerServiceAreas,
  providerServiceCategories,
  providerSpokenLanguages,
  providerWeeklyAvailabilityWindows,
} from "../../database/schema/provider-onboarding-schema.js";
import { providerProfileMediaAssets } from "../../database/schema/platform-catalogue-schema.js";
import {
  providerReviewTransitionCatalog,
  type ProviderReviewActionInput,
  type ProviderReviewActor,
} from "./administration-types.js";

export interface ProviderOnboardingListPage {
  page: number;
  pageSize: number;
}
export interface AdministrationCollectionQuery extends ProviderOnboardingListPage {
  search: string;
  role?: "customer" | "provider" | "support" | "admin";
  status?: "active" | "banned" | "deactivated";
}

export async function getAdministrationDashboardMetrics() {
  const [userRows, providerStatuses] = await Promise.all([
    khidmatAiDatabase
      .select({
        totalUsers: sql<number>`count(*)::int`,
        customers: sql<number>`count(*) filter (where ${authenticationUsers.role} = 'customer')::int`,
        providers: sql<number>`count(*) filter (where ${authenticationUsers.role} = 'provider')::int`,
        staff: sql<number>`count(*) filter (where ${authenticationUsers.role} in ('admin','support'))::int`,
        banned: sql<number>`count(*) filter (where ${authenticationUsers.banned} = true)::int`,
        deactivated: sql<number>`count(*) filter (where ${authenticationUsers.deactivatedAt} is not null)::int`,
      })
      .from(authenticationUsers),
    khidmatAiDatabase
      .select({ status: providerProfiles.status, count: sql<number>`count(*)::int` })
      .from(providerProfiles)
      .innerJoin(authenticationUsers, eq(authenticationUsers.id, providerProfiles.userId))
      .where(eq(authenticationUsers.role, "provider"))
      .groupBy(providerProfiles.status)
      .orderBy(providerProfiles.status),
  ]);
  return { ...userRows[0], providerStatuses };
}

export async function listAdministrationUsers(query: AdministrationCollectionQuery) {
  const conditions = [
    query.search
      ? or(ilike(authenticationUsers.name, `%${query.search}%`), ilike(authenticationUsers.email, `%${query.search}%`))
      : undefined,
    query.role ? eq(authenticationUsers.role, query.role) : undefined,
    query.status === "banned"
      ? eq(authenticationUsers.banned, true)
      : query.status === "deactivated"
        ? sql`${authenticationUsers.deactivatedAt} is not null`
        : query.status === "active"
          ? and(eq(authenticationUsers.banned, false), sql`${authenticationUsers.deactivatedAt} is null`)
          : undefined,
  ].filter(Boolean);
  const where = conditions.length ? and(...conditions) : undefined;
  const [items, totals] = await Promise.all([
    khidmatAiDatabase
      .select({
        id: authenticationUsers.id,
        name: authenticationUsers.name,
        email: authenticationUsers.email,
        emailVerified: authenticationUsers.emailVerified,
        role: authenticationUsers.role,
        banned: authenticationUsers.banned,
        banReason: authenticationUsers.banReason,
        deactivatedAt: authenticationUsers.deactivatedAt,
        deactivationReason: authenticationUsers.deactivationReason,
        createdAt: authenticationUsers.createdAt,
      })
      .from(authenticationUsers)
      .where(where)
      .orderBy(desc(authenticationUsers.createdAt))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
    khidmatAiDatabase
      .select({ total: sql<number>`count(*)::int` })
      .from(authenticationUsers)
      .where(where),
  ]);
  return { items, total: totals[0]?.total ?? 0 };
}

export async function findAdministrationUserDetail(userId: string) {
  const [user] = await khidmatAiDatabase
    .select({
      id: authenticationUsers.id,
      name: authenticationUsers.name,
      email: authenticationUsers.email,
      emailVerified: authenticationUsers.emailVerified,
      role: authenticationUsers.role,
      accountType: authenticationUsers.accountType,
      banned: authenticationUsers.banned,
      banReason: authenticationUsers.banReason,
      banExpires: authenticationUsers.banExpires,
      deactivatedAt: authenticationUsers.deactivatedAt,
      deactivationReason: authenticationUsers.deactivationReason,
      createdAt: authenticationUsers.createdAt,
      updatedAt: authenticationUsers.updatedAt,
    })
    .from(authenticationUsers)
    .where(eq(authenticationUsers.id, userId))
    .limit(1);
  if (!user) return null;
  const [customerProfileResult, providerProfileResult] = await Promise.all([
    khidmatAiDatabase.execute(sql`select * from customer_profiles where user_id = ${userId} limit 1`),
    khidmatAiDatabase.execute(sql`select * from provider_profiles where user_id = ${userId} limit 1`),
  ]);
  return {
    ...user,
    customerProfile: customerProfileResult.rows[0] ?? null,
    providerProfile: providerProfileResult.rows[0] ?? null,
  };
}

export async function mutateAdministrationUser(
  userId: string,
  actorUserId: string,
  mutation:
    | { kind: "role"; role: string; reason: string }
    | { kind: "ban"; banned: boolean; reason: string }
    | { kind: "deactivation"; deactivated: boolean; reason: string },
) {
  return khidmatAiDatabase.transaction(async (transaction) => {
    const locked = await transaction.execute(
      sql<{
        role: string;
        deactivatedAt: Date | null;
      }>`select role, "deactivatedAt" from "user" where id = ${userId} for update`,
    );
    const user = locked.rows[0];
    if (!user) return null;
    if (userId === actorUserId) return { conflict: "self" as const };
    if (user.deactivatedAt && mutation.kind === "ban") return { conflict: "deactivated" as const };
    if (
      user.role === "admin" &&
      ((mutation.kind === "role" && mutation.role !== "admin") ||
        (mutation.kind === "deactivation" && mutation.deactivated))
    ) {
      const result = await transaction.execute(
        sql<{
          count: number;
        }>`select count(*)::int as count from "user" where role = 'admin' and "deactivatedAt" is null and banned = false`,
      );
      if (Number(result.rows[0]?.count ?? 0) <= 1) return { conflict: "last_admin" as const };
    }
    const now = new Date();
    if (mutation.kind === "role") {
      await transaction
        .update(authenticationUsers)
        .set({ role: mutation.role, accountType: mutation.role, updatedAt: now })
        .where(eq(authenticationUsers.id, userId));
      if (mutation.role === "customer")
        await transaction.execute(
          sql`insert into customer_profiles (user_id) values (${userId}) on conflict (user_id) do nothing`,
        );
      if (mutation.role === "provider")
        await transaction.execute(
          sql`insert into provider_profiles (user_id, status) values (${userId}, 'draft') on conflict (user_id) do nothing`,
        );
    }
    if (mutation.kind === "ban")
      await transaction
        .update(authenticationUsers)
        .set({
          banned: mutation.banned,
          banReason: mutation.banned ? mutation.reason : null,
          banExpires: null,
          updatedAt: now,
        })
        .where(eq(authenticationUsers.id, userId));
    if (mutation.kind === "deactivation")
      await transaction
        .update(authenticationUsers)
        .set({
          deactivatedAt: mutation.deactivated ? now : null,
          deactivatedBy: mutation.deactivated ? actorUserId : null,
          deactivationReason: mutation.deactivated ? mutation.reason : null,
          banned: false,
          banReason: null,
          updatedAt: now,
        })
        .where(eq(authenticationUsers.id, userId));
    if (mutation.kind !== "ban" || mutation.banned)
      await transaction.delete(authenticationSessions).where(eq(authenticationSessions.userId, userId));
    await transaction.insert(auditEvents).values({
      actorUserId,
      actorRole: "admin",
      eventKey: `user.${mutation.kind}_changed`,
      entityType: "user",
      entityId: userId,
      reason: mutation.reason,
      metadata: mutation,
    });
    return { conflict: null };
  });
}

export async function listAdministrationAuditEvents({
  page,
  pageSize,
  search,
  eventKey,
}: {
  page: number;
  pageSize: number;
  search: string;
  eventKey?: string;
}) {
  const where = and(
    search
      ? or(
          ilike(auditEvents.eventKey, `%${search}%`),
          ilike(auditEvents.entityId, `%${search}%`),
          ilike(auditEvents.reason, `%${search}%`),
        )
      : undefined,
    eventKey ? eq(auditEvents.eventKey, eventKey) : undefined,
  );
  const [items, totals] = await Promise.all([
    khidmatAiDatabase
      .select()
      .from(auditEvents)
      .where(where)
      .orderBy(desc(auditEvents.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    khidmatAiDatabase
      .select({ total: sql<number>`count(*)::int` })
      .from(auditEvents)
      .where(where),
  ]);
  return { items, total: totals[0]?.total ?? 0 };
}

export async function listProviderOnboardingProfilesForAdministration({ page, pageSize }: ProviderOnboardingListPage) {
  const [profileRows, totalCountRows] = await Promise.all([
    khidmatAiDatabase
      .select({
        id: providerProfiles.id,
        userId: providerProfiles.userId,
        status: providerProfiles.status,
        city: providerProfiles.city,
        yearsOfExperience: providerProfiles.yearsOfExperience,
        submittedAt: providerProfiles.submittedAt,
        version: providerProfiles.version,
        name: authenticationUsers.name,
        email: authenticationUsers.email,
        emailVerified: authenticationUsers.emailVerified,
      })
      .from(providerProfiles)
      .innerJoin(authenticationUsers, eq(authenticationUsers.id, providerProfiles.userId))
      .where(eq(authenticationUsers.role, "provider"))
      .orderBy(desc(providerProfiles.updatedAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    khidmatAiDatabase
      .select({ total: sql<number>`count(*)::int` })
      .from(providerProfiles)
      .innerJoin(authenticationUsers, eq(authenticationUsers.id, providerProfiles.userId))
      .where(eq(authenticationUsers.role, "provider")),
  ]);
  return { items: profileRows, total: totalCountRows[0]?.total ?? 0 };
}

export async function findProviderProfileForAdministration(providerProfileId: string, canViewSensitiveMedia: boolean) {
  const [profile] = await khidmatAiDatabase
    .select({
      id: providerProfiles.id,
      userId: providerProfiles.userId,
      status: providerProfiles.status,
      phoneNumber: providerProfiles.phoneNumber,
      governmentIdentityNumber: providerProfiles.governmentIdentityNumber,
      addressLine: providerProfiles.addressLine,
      city: providerProfiles.city,
      professionalTitle: providerProfiles.professionalTitle,
      yearsOfExperience: providerProfiles.yearsOfExperience,
      professionalBio: providerProfiles.professionalBio,
      availabilitySummary: providerProfiles.availabilitySummary,
      isAvailableForNewJobs: providerProfiles.isAvailableForNewJobs,
      offersEmergencyService: providerProfiles.offersEmergencyService,
      maximumTravelDistanceKilometers: providerProfiles.maximumTravelDistanceKilometers,
      submittedAt: providerProfiles.submittedAt,
      approvedAt: providerProfiles.approvedAt,
      version: providerProfiles.version,
      createdAt: providerProfiles.createdAt,
      updatedAt: providerProfiles.updatedAt,
      name: authenticationUsers.name,
      email: authenticationUsers.email,
      emailVerified: authenticationUsers.emailVerified,
      banned: authenticationUsers.banned,
      deactivatedAt: authenticationUsers.deactivatedAt,
    })
    .from(providerProfiles)
    .innerJoin(authenticationUsers, eq(authenticationUsers.id, providerProfiles.userId))
    .where(and(eq(providerProfiles.id, providerProfileId), eq(authenticationUsers.role, "provider")))
    .limit(1);
  if (!profile) return null;
  const [categories, areas, references, decisions, services, languages, weeklyAvailability, mediaAssets] = await Promise.all([
    khidmatAiDatabase
      .select({ categoryKey: providerServiceCategories.categoryKey })
      .from(providerServiceCategories)
      .where(eq(providerServiceCategories.providerProfileId, providerProfileId))
      .orderBy(providerServiceCategories.categoryKey),
    khidmatAiDatabase
      .select({ areaName: providerServiceAreas.areaName })
      .from(providerServiceAreas)
      .where(eq(providerServiceAreas.providerProfileId, providerProfileId))
      .orderBy(providerServiceAreas.areaName),
    khidmatAiDatabase
      .select()
      .from(providerReferences)
      .where(eq(providerReferences.providerProfileId, providerProfileId))
      .orderBy(providerReferences.createdAt),
    khidmatAiDatabase
      .select()
      .from(providerReviewDecisions)
      .where(eq(providerReviewDecisions.providerProfileId, providerProfileId))
      .orderBy(desc(providerReviewDecisions.createdAt)),
    khidmatAiDatabase
      .select({
        id: providerOfferedServices.id,
        name: providerOfferedServices.serviceName,
        description: providerOfferedServices.serviceDescription,
        startingPriceAmount: providerOfferedServices.startingPriceAmount,
        currencyCode: providerOfferedServices.currencyCode,
        isActive: providerOfferedServices.isActive,
      })
      .from(providerOfferedServices)
      .where(eq(providerOfferedServices.providerProfileId, providerProfileId))
      .orderBy(asc(providerOfferedServices.displayOrder)),
    khidmatAiDatabase
      .select({ id: providerSpokenLanguages.id, name: providerSpokenLanguages.languageName })
      .from(providerSpokenLanguages)
      .where(eq(providerSpokenLanguages.providerProfileId, providerProfileId))
      .orderBy(asc(providerSpokenLanguages.languageName)),
    khidmatAiDatabase
      .select({
        id: providerWeeklyAvailabilityWindows.id,
        dayOfWeek: providerWeeklyAvailabilityWindows.dayOfWeek,
        startTime: providerWeeklyAvailabilityWindows.startTime,
        endTime: providerWeeklyAvailabilityWindows.endTime,
      })
      .from(providerWeeklyAvailabilityWindows)
      .where(eq(providerWeeklyAvailabilityWindows.providerProfileId, providerProfileId))
      .orderBy(asc(providerWeeklyAvailabilityWindows.dayOfWeek), asc(providerWeeklyAvailabilityWindows.startTime)),
    khidmatAiDatabase
      .select({
        id: providerProfileMediaAssets.id,
        mediaPurpose: providerProfileMediaAssets.mediaPurpose,
        documentSide: providerProfileMediaAssets.documentSide,
        url: providerProfileMediaAssets.secureDeliveryUrl,
        cloudinaryPublicIdentifier: providerProfileMediaAssets.cloudinaryPublicIdentifier,
        cloudinaryDeliveryType: providerProfileMediaAssets.cloudinaryDeliveryType,
        originalFileName: providerProfileMediaAssets.originalFileName,
        mimeType: providerProfileMediaAssets.mimeType,
        byteSize: providerProfileMediaAssets.byteSize,
      })
      .from(providerProfileMediaAssets)
      .where(and(
        eq(providerProfileMediaAssets.providerProfileId, providerProfileId),
        canViewSensitiveMedia
          ? undefined
          : inArray(providerProfileMediaAssets.mediaPurpose, ["profile_image", "work_gallery"]),
      ))
      .orderBy(asc(providerProfileMediaAssets.displayOrder), asc(providerProfileMediaAssets.createdAt)),
  ]);
  return {
    ...profile,
    categoryKeys: categories.map(({ categoryKey }) => categoryKey),
    serviceAreas: areas.map(({ areaName }) => areaName),
    references,
    reviewDecisions: decisions,
    services,
    languages,
    weeklyAvailability,
    mediaAssets,
  };
}

export async function persistProviderReviewAction(
  providerReviewAction: ProviderReviewActionInput,
  providerReviewActor: ProviderReviewActor,
) {
  const transitionRule = providerReviewTransitionCatalog[providerReviewAction.action];
  const recordedReviewReason = createRecordedProviderReviewReason(providerReviewAction);
  return khidmatAiDatabase.transaction(async (databaseTransaction) => {
    const lockedProviderProfileResult = await databaseTransaction.execute(
      sql<{
        status: string;
      }>`select provider_profiles.status from provider_profiles inner join "user" on "user".id = provider_profiles.user_id where provider_profiles.id = ${providerReviewAction.providerProfileId} and "user".role = 'provider' for update of provider_profiles`,
    );
    const lockedProviderProfile = lockedProviderProfileResult.rows[0] as { status: string } | undefined;
    if (
      !lockedProviderProfile ||
      !transitionRule.permittedPreviousStatuses.includes(lockedProviderProfile.status as never)
    )
      return null;

    const [updatedProviderProfile] = await databaseTransaction
      .update(providerProfiles)
      .set({
        status: transitionRule.nextStatus,
        version: sql`${providerProfiles.version} + 1`,
        updatedAt: new Date(),
        ...(transitionRule.nextStatus === "active" ? { approvedAt: new Date() } : {}),
      })
      .where(
        sql`${providerProfiles.id} = ${providerReviewAction.providerProfileId} and ${providerProfiles.version} = ${providerReviewAction.expectedVersion}`,
      )
      .returning({ version: providerProfiles.version });
    if (!updatedProviderProfile) return null;

    await databaseTransaction.insert(providerReviewDecisions).values({
      providerProfileId: providerReviewAction.providerProfileId,
      actorUserId: providerReviewActor.authenticationUserId,
      action: providerReviewAction.action,
      previousStatus: lockedProviderProfile.status,
      nextStatus: transitionRule.nextStatus,
      reason: recordedReviewReason,
    });
    await databaseTransaction.insert(auditEvents).values({
      actorUserId: providerReviewActor.authenticationUserId,
      actorRole: providerReviewActor.accountRole,
      eventKey: `provider.${providerReviewAction.action}`,
      entityType: "provider_profile",
      entityId: providerReviewAction.providerProfileId,
      reason: recordedReviewReason,
    });
    return updatedProviderProfile;
  });
}

function createRecordedProviderReviewReason(providerReviewAction: ProviderReviewActionInput) {
  if (providerReviewAction.action === "request_changes") {
    const requestedSections = (providerReviewAction.requestedChangeKeys ?? [])
      .map((changeKey) => changeKey.replaceAll("_", " "))
      .join(", ");
    return `Required sections: ${requestedSections}.\n\n${providerReviewAction.reason}`;
  }

  const automaticReasons: Partial<Record<ProviderReviewActionInput["action"], string>> = {
    start_review: "Administrator started reviewing the provider application.",
    approve: "Administrator approved the provider application.",
    reinstate: "Administrator reinstated the provider profile.",
  };
  return (
    providerReviewAction.reason ??
    automaticReasons[providerReviewAction.action] ??
    "Administrator applied a provider review action."
  );
}
