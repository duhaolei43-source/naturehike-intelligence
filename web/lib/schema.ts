import { z } from "zod";
const number = z.number().finite().nonnegative().nullable();
export const productSchema = z
  .object({
    product_id: z.string(),
    brand_id: z.string(),
    product_name: z.string(),
    product_variant: z.string(),
    product_url: z.url(),
    price_usd: number,
    original_price_usd: number,
    price_type: z.enum([
      "regular",
      "sale",
      "displayed_unclassified",
      "unavailable",
    ]),
    minimum_weight_g: number,
    packed_weight_g: number,
    floor_area_m2: number,
    doors_count: z.number().int().nullable(),
    season_rating: z.string().nullable(),
    freestanding_status: z.string().nullable(),
    construction: z.string().nullable(),
    footprint_included: z.boolean().nullable(),
    availability: z.string(),
    source_id: z.string(),
    price_observed_at_utc: z.string(),
    weight_definition: z.string(),
    fabric_material: z.string().nullable(),
    notes: z.string(),
    listing_type: z.string(),
    vendor_name: z.string(),
    missing_reasons: z.record(z.string(), z.string()),
    field_evidence: z.record(z.string(), z.string()),
    verification_status: z.literal("verified"),
    cohort_id: z.string().nullable(),
  })
  .strict();
export type Product = z.infer<typeof productSchema>;
export const sourceSchema = z
  .object({
    source_id: z.string(),
    url: z.url(),
    publisher: z.string(),
    retrieved_at_utc: z.string(),
    identifier: z.string(),
    tier: z.string(),
    confidence: z.string(),
    access_method: z.string(),
    public_use: z.literal("concise_facts_only"),
    limitations: z.array(z.string()),
    evidence_sha256: z.string().regex(/^[a-f0-9]{64}$/),
    extracted_fields: z.array(z.string()),
  })
  .strict();
export const productsSchema = z.array(productSchema);
export const sourcesSchema = z.array(sourceSchema);
