import type { z } from "zod";
import type {
  customerProfileUpdateValidationSchema,
  customerSavedAddressCreationValidationSchema,
} from "./customer-profile-validation-schemas.js";

export type CustomerProfileUpdateInput = z.infer<typeof customerProfileUpdateValidationSchema>;
export type CustomerSavedAddressInput = z.infer<typeof customerSavedAddressCreationValidationSchema>;
