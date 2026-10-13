SELECT
    product_id,
    brand_id,
    product_name,
    product_variant,
    source_id,
    product_url,
    price_observed_at_utc,
    price_usd,
    price_type,
    original_price_usd,
    price_band,
    cohort_id,
    season_rating,
    freestanding_status,
    construction,
    footprint_included,
    availability,
    original_price_usd - price_usd AS sale_discount_usd
FROM comparable
ORDER BY product_id;
