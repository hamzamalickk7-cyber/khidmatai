export const publicAccountRoleList = ["customer", "provider"] as const;
export const accountRoleList = ["customer", "provider", "support", "admin"] as const;
export type PublicAccountRole = (typeof publicAccountRoleList)[number];
export type AccountRole = (typeof accountRoleList)[number];
