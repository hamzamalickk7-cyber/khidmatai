import { and, asc, eq, ne, sql } from "drizzle-orm";
import { khidmatAiDatabase } from "../../database/database-connection.js";
import { authenticationUsers } from "../../database/schema/authentication-schema.js";
import {
  customerProfiles,
  customerSavedAddresses,
  customerServicePreferences,
} from "../../database/schema/customer-profile-schema.js";
import { auditEvents } from "../../database/schema/provider-onboarding-schema.js";
import type { CustomerProfileUpdateInput, CustomerSavedAddressInput } from "./customer-profile-types.js";

export async function findCustomerProfileByAuthenticationUserId(authenticationUserId: string) {
  const [profile] = await khidmatAiDatabase
    .select({
      id: customerProfiles.id,
      fullName: authenticationUsers.name,
      emailAddress: authenticationUsers.email,
      phoneNumber: customerProfiles.phoneNumber,
      city: customerProfiles.city,
      preferredContactMethod: customerProfiles.preferredContactMethod,
      version: customerProfiles.version,
      createdAt: customerProfiles.createdAt,
      updatedAt: customerProfiles.updatedAt,
    })
    .from(customerProfiles)
    .innerJoin(authenticationUsers, eq(customerProfiles.userId, authenticationUsers.id))
    .where(eq(customerProfiles.userId, authenticationUserId))
    .limit(1);
  if (!profile) return null;
  const [addresses, preferences] = await Promise.all([
    khidmatAiDatabase
      .select()
      .from(customerSavedAddresses)
      .where(eq(customerSavedAddresses.customerProfileId, profile.id))
      .orderBy(asc(customerSavedAddresses.createdAt)),
    khidmatAiDatabase
      .select({ categoryKey: customerServicePreferences.categoryKey })
      .from(customerServicePreferences)
      .where(eq(customerServicePreferences.customerProfileId, profile.id))
      .orderBy(asc(customerServicePreferences.categoryKey)),
  ]);
  return {
    ...profile,
    savedAddresses: addresses,
    servicePreferenceKeys: preferences.map(({ categoryKey }) => categoryKey),
  };
}

export async function updateCustomerProfile(authenticationUserId: string, input: CustomerProfileUpdateInput) {
  return khidmatAiDatabase.transaction(async (transaction) => {
    const [profile] = await transaction
      .update(customerProfiles)
      .set({
        phoneNumber: input.phoneNumber,
        city: input.city,
        preferredContactMethod: input.preferredContactMethod,
        version: sql`${customerProfiles.version} + 1`,
        updatedAt: new Date(),
      })
      .where(
        and(eq(customerProfiles.userId, authenticationUserId), eq(customerProfiles.version, input.expectedVersion)),
      )
      .returning({ id: customerProfiles.id, version: customerProfiles.version });
    if (!profile) return null;
    await transaction
      .update(authenticationUsers)
      .set({ name: input.fullName, updatedAt: new Date() })
      .where(eq(authenticationUsers.id, authenticationUserId));
    await transaction
      .delete(customerServicePreferences)
      .where(eq(customerServicePreferences.customerProfileId, profile.id));
    if (input.servicePreferenceKeys.length)
      await transaction
        .insert(customerServicePreferences)
        .values(input.servicePreferenceKeys.map((categoryKey) => ({ customerProfileId: profile.id, categoryKey })));
    await transaction
      .insert(auditEvents)
      .values({
        actorUserId: authenticationUserId,
        actorRole: "customer",
        eventKey: "customer.profile_updated",
        entityType: "customer_profile",
        entityId: profile.id,
      });
    return profile;
  });
}

async function ensureOnlyDefaultAddress(
  transaction: Parameters<Parameters<typeof khidmatAiDatabase.transaction>[0]>[0],
  customerProfileId: string,
  excludedAddressId?: string,
) {
  const condition = excludedAddressId
    ? and(
        eq(customerSavedAddresses.customerProfileId, customerProfileId),
        ne(customerSavedAddresses.id, excludedAddressId),
      )
    : eq(customerSavedAddresses.customerProfileId, customerProfileId);
  await transaction.update(customerSavedAddresses).set({ isDefault: false, updatedAt: new Date() }).where(condition);
}

export async function createCustomerSavedAddress(authenticationUserId: string, input: CustomerSavedAddressInput) {
  return khidmatAiDatabase.transaction(async (transaction) => {
    const [profile] = await transaction
      .select({ id: customerProfiles.id })
      .from(customerProfiles)
      .where(eq(customerProfiles.userId, authenticationUserId))
      .limit(1);
    if (!profile) return null;
    if (input.isDefault) await ensureOnlyDefaultAddress(transaction, profile.id);
    const [address] = await transaction
      .insert(customerSavedAddresses)
      .values({ customerProfileId: profile.id, ...input })
      .returning();
    return address;
  });
}

export async function updateCustomerSavedAddress(
  authenticationUserId: string,
  addressId: string,
  input: CustomerSavedAddressInput,
) {
  return khidmatAiDatabase.transaction(async (transaction) => {
    const [ownedAddress] = await transaction
      .select({ profileId: customerProfiles.id })
      .from(customerSavedAddresses)
      .innerJoin(customerProfiles, eq(customerSavedAddresses.customerProfileId, customerProfiles.id))
      .where(and(eq(customerSavedAddresses.id, addressId), eq(customerProfiles.userId, authenticationUserId)))
      .limit(1);
    if (!ownedAddress) return null;
    if (input.isDefault) await ensureOnlyDefaultAddress(transaction, ownedAddress.profileId, addressId);
    const [address] = await transaction
      .update(customerSavedAddresses)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(customerSavedAddresses.id, addressId))
      .returning();
    return address;
  });
}

export async function deleteCustomerSavedAddress(authenticationUserId: string, addressId: string) {
  return khidmatAiDatabase.transaction(async (transaction) => {
    const [ownedAddress] = await transaction
      .select({ id: customerSavedAddresses.id })
      .from(customerSavedAddresses)
      .innerJoin(customerProfiles, eq(customerSavedAddresses.customerProfileId, customerProfiles.id))
      .where(and(eq(customerSavedAddresses.id, addressId), eq(customerProfiles.userId, authenticationUserId)))
      .limit(1);
    if (!ownedAddress) return null;
    const [deletedAddress] = await transaction
      .delete(customerSavedAddresses)
      .where(eq(customerSavedAddresses.id, ownedAddress.id))
      .returning({ id: customerSavedAddresses.id });
    return deletedAddress ?? null;
  });
}
