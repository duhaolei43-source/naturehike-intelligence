WITH summaries AS (
    SELECT
        cohort_id,
        brand_id,
        COUNT(*) AS listing_count,
        MEDIAN(price_usd) AS median_price_usd,
        MIN(price_usd) AS min_price_usd,
        MAX(price_usd) AS max_price_usd,
        MEDIAN(minimum_weight_g) AS median_minimum_weight_g,
        MEDIAN(packed_weight_g) AS median_packed_weight_g
    FROM comparable
    WHERE
        cohort_id IS NOT NULL AND season_rating IS NOT NULL
        AND freestanding_status IS NOT NULL AND construction IS NOT NULL
        AND footprint_included IS NOT NULL
    GROUP BY cohort_id, brand_id
)

SELECT
    s.*,
    n.median_price_usd AS naturehike_median_price_usd,
    s.median_price_usd - n.median_price_usd AS price_gap_vs_naturehike_usd
FROM summaries AS s LEFT JOIN summaries AS n
    ON s.cohort_id = n.cohort_id AND n.brand_id = 'naturehike'
ORDER BY s.cohort_id, s.brand_id;
