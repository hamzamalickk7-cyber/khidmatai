export interface AdministrationUserListItem {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: string;
  banned: boolean;
  banReason: string | null;
  deactivatedAt: string | null;
  deactivationReason: string | null;
  createdAt: string;
}
export interface AdministrationUserDetail extends AdministrationUserListItem {
  accountType: string;
  banExpires: string | null;
  updatedAt: string;
  customerProfile: Record<string, unknown> | null;
  providerProfile: Record<string, unknown> | null;
}
export interface AdministrationAuditEvent {
  id: string;
  actorUserId: string | null;
  actorRole: string | null;
  eventKey: string;
  entityType: string;
  entityId: string;
  reason: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}
export interface AdministrationOverview {
  totalUsers: number;
  customers: number;
  providers: number;
  staff: number;
  banned: number;
  deactivated: number;
  providerStatuses: Array<{ status: string; count: number }>;
}
