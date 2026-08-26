import { desc, eq, sql } from "drizzle-orm";
import { khidmatAiDatabase } from "../../database/database-connection.js";
import { authenticationUsers } from "../../database/schema/authentication-schema.js";
import { auditEvents, providerProfiles, providerReviewDecisions } from "../../database/schema/provider-onboarding-schema.js";
import { providerReviewTransitionCatalog, type ProviderReviewActionInput, type ProviderReviewActor } from "./administration-types.js";

export interface ProviderOnboardingListPage { page: number; pageSize: number; }

export async function listProviderOnboardingProfilesForAdministration({ page, pageSize }: ProviderOnboardingListPage) {
  const [profileRows, totalCountRows] = await Promise.all([
    khidmatAiDatabase.select({
      id: providerProfiles.id, status: providerProfiles.status, city: providerProfiles.city, yearsOfExperience: providerProfiles.yearsOfExperience,
      submittedAt: providerProfiles.submittedAt, version: providerProfiles.version, name: authenticationUsers.name, email: authenticationUsers.email,
      emailVerified: authenticationUsers.emailVerified,
    }).from(providerProfiles).innerJoin(authenticationUsers, eq(authenticationUsers.id, providerProfiles.userId)).orderBy(desc(providerProfiles.updatedAt)).limit(pageSize).offset((page - 1) * pageSize),
    khidmatAiDatabase.select({ total: sql<number>`count(*)::int` }).from(providerProfiles),
  ]);
  return { items: profileRows, total: totalCountRows[0]?.total ?? 0 };
}

export async function persistProviderReviewAction(providerReviewAction: ProviderReviewActionInput, providerReviewActor: ProviderReviewActor) {
  const transitionRule = providerReviewTransitionCatalog[providerReviewAction.action];
  return khidmatAiDatabase.transaction(async (databaseTransaction) => {
    const lockedProviderProfileResult = await databaseTransaction.execute(sql<{ status: string }>`select status from provider_profiles where id = ${providerReviewAction.providerProfileId} for update`);
    const lockedProviderProfile = lockedProviderProfileResult.rows[0] as { status: string } | undefined;
    if (!lockedProviderProfile || !transitionRule.permittedPreviousStatuses.includes(lockedProviderProfile.status as never)) return null;

    const [updatedProviderProfile] = await databaseTransaction.update(providerProfiles).set({
      status: transitionRule.nextStatus, version: sql`${providerProfiles.version} + 1`, updatedAt: new Date(),
      ...(transitionRule.nextStatus === "active" ? { approvedAt: new Date() } : {}),
    }).where(sql`${providerProfiles.id} = ${providerReviewAction.providerProfileId} and ${providerProfiles.version} = ${providerReviewAction.expectedVersion}`).returning({ version: providerProfiles.version });
    if (!updatedProviderProfile) return null;

    await databaseTransaction.insert(providerReviewDecisions).values({ providerProfileId: providerReviewAction.providerProfileId, actorUserId: providerReviewActor.authenticationUserId, action: providerReviewAction.action, previousStatus: lockedProviderProfile.status, nextStatus: transitionRule.nextStatus, reason: providerReviewAction.reason });
    await databaseTransaction.insert(auditEvents).values({ actorUserId: providerReviewActor.authenticationUserId, actorRole: providerReviewActor.accountRole, eventKey: `provider.${providerReviewAction.action}`, entityType: "provider_profile", entityId: providerReviewAction.providerProfileId, reason: providerReviewAction.reason });
    return updatedProviderProfile;
  });
}
