export interface CustomerSavedAddress {
  id: string;
  label: string;
  addressLine: string;
  city: string;
  isDefault: boolean;
}
export interface CustomerProfile {
  id: string;
  fullName: string;
  emailAddress: string;
  phoneNumber: string | null;
  city: string | null;
  preferredContactMethod: "phone" | "whatsapp" | "email";
  version: number;
  createdAt: string;
  updatedAt: string;
  savedAddresses: CustomerSavedAddress[];
  servicePreferenceKeys: string[];
}
export interface SuccessfulApiEnvelope<T> {
  success: true;
  data: T;
}
