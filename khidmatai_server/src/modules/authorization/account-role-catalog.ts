export const publiclyRegistrableAccountRoles = ["customer", "provider"] as const;
export const completeAccountRoleCatalog = ["customer", "provider", "support", "admin"] as const;

export type PubliclyRegistrableAccountRole = (typeof publiclyRegistrableAccountRoles)[number];
export type KhidmatAiAccountRole = (typeof completeAccountRoleCatalog)[number];
