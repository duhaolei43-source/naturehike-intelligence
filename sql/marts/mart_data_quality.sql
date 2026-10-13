SELECT
    COUNT(*) AS product_count,
    COUNT(DISTINCT brand_id) AS brand_count,
    COUNT(*) FILTER (WHERE verification_status = 'verified') AS verified_count,
    COUNT(*) FILTER (WHERE price_usd IS NULL) AS missing_price_count,
    COUNT(*) FILTER (WHERE minimum_weight_g IS NULL) AS missing_minimum_weight_count,
    COUNT(*) FILTER (WHERE packed_weight_g IS NULL) AS missing_packed_weight_count,
    COUNT(*) FILTER (WHERE floor_area_m2 IS NULL) AS missing_floor_area_count,
    COUNT(
        *) FILTER (
        WHERE season_rating IS NULL OR freestanding_status IS NULL
        OR construction IS NULL OR footprint_included IS NULL
    ) AS incomplete_cohort_count,
    MAX(price_observed_at_utc) AS latest_observation_utc
FROM latest_products;
