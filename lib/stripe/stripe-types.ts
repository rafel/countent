import {
  STRIPE_PRICE_LOOKUP_KEYS,
  StripePriceLookupKey,
} from "@/content/common";

// Client-safe interfaces
export interface CheckoutSessionRequest {
  lookup_key: string;
  success_path: string;
  cancel_path: string;
  payer_type: "user" | "company";
  company_id?: string;
}

export interface PortalSessionRequest {
  return_path: string;
  company_id?: string; // Optional: for B2B to specify which company's billing
}

export { STRIPE_PRICE_LOOKUP_KEYS, type StripePriceLookupKey };
