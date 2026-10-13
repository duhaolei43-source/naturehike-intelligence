# Data dictionary

The formal runtime schema is src/naturehike_intel/validation/models.py; data/public/raw/products.json supplies field evidence and null reasons. Product/source JSON rejects unknown fields and non-finite numbers.

| Field | Definition / units |
|---|---|
| product_id | Stable variant identifier, not a price observation key |
| brand_id | Brand dimension key |
| product_name | Official model label |
| product_variant | Bound material/color, retailer ID or SKU; colors not replicated |
| product_url | Original reviewed official listing |
| product_category | backpacking_tent |
| capacity_persons | Exactly 2 |
| season_rating | Published 3-season/3+-season/4-season; null when unverified |
| price_usd | Observed display price in USD; positive or null |
| price_type | regular / sale / displayed_unclassified / unavailable |
| price_observed_at_utc | ISO-8601 UTC timestamp for the observation |
| minimum_weight_g | Published minimum/trail weight converted to grams |
| packed_weight_g | Published packed/packaged/total weight in grams; source label retained |
| weight_definition | Definitions and component/rounding caveats |
| floor_area_m2 | Published interior floor area in square metres; no exterior estimate |
| doors_count | Verified entrance count; positive integer or null |
| freestanding_status | freestanding / semi-freestanding / non-freestanding / null |
| footprint_included | True/false only with verified evidence; null when unknown |
| source_id | Foreign key to the source registry |
| verification_status | verified populated source facts / partial / unverified |
| construction | double-wall / single-wall / null; derived classifications disclosed |
| advertised_us | Inclusion flag; not proof of delivery or stock |
| backpacking_evidence | Official intended-use justification |
| availability | advertised / out_of_stock / unknown; not inferred from duplicated UI widgets |
| missing_reasons | Per-field reasons for null required analytical fields |
| field_evidence | Source field label, unit conversion and interpretation notes |
| is_test_data | True only for synthetic test input; public builder rejects it |

Optional fields: original_price_usd (verified pre-sale USD price), currency_original (USD), shipping_cost_usd (null if unquoted), floor_length_cm, floor_width_cm, peak_height_cm, waterproof_rating_mm (specify component in notes), fabric_material, pole_material, vendor_name and notes. Optional nulls mean unverified/unavailable unless notes say otherwise.

Source fields and enums are specified in Source. evidence_sha256 is a structured extraction hash; the original page was not archived. Source IDs must be unique. Product snapshot uniqueness: product_id + product_url + source_id + price_observed_at_utc.

Trends grain: batch + term + US geography + period start. term_id includes batch to preserve semantics and prevent arbitrary cross-batch merging. interest_index is 0–100 or null; censored_below_one flags <1. Period start/end, category and search type are exported. Metadata retains export date and declared date range.

listing_type distinguishes brand_owned from retailer; vendor_name identifies the observed seller. Manufacturer published 3+ ratings are preserved as 3+-season and never combined with ordinary 3-season by default.
