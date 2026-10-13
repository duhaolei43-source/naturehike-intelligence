SELECT
    COUNT(DISTINCT product_id) AS product_count,
    MEDIAN(price_usd) AS median_price_usd,
    MEDIAN(minimum_weight_g) AS median_minimum_weight_g,
    MEDIAN(packed_weight_g) AS median_packed_weight_g,
    MAX(price_usd) - MIN(price_usd) AS price_range_usd,
    COUNT(DISTINCT source_id) FILTER (WHERE verification_status = 'verified')::DOUBLE
    / NULLIF(COUNT(DISTINCT source_id), 0) AS verified_source_coverage
FROM fact_product_price_snapshot
WHERE is_latest_snapshot;

SELECT
    cohort_id,
    brand_id,
    listing_count,
    median_price_usd,
    price_gap_vs_naturehike_usd
FROM mart_brand_comparison
ORDER BY cohort_id, brand_id;
