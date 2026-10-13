SELECT
    product_id,
    brand_id,
    product_name,
    price_usd,
    minimum_weight_g,
    packed_weight_g,
    weight_definition,
    floor_area_m2,
    price_per_floor_m2,
    season_rating,
    freestanding_status,
    construction,
    footprint_included,
    cohort_id,
    source_id,
    product_url,
    price_observed_at_utc
FROM comparable
ORDER BY product_id;
