CREATE OR REPLACE TABLE comparable AS
SELECT -- noqa: AM04
    p.*,
    CASE
        WHEN
            p.season_rating IS NOT NULL AND p.freestanding_status IS NOT NULL
            AND p.construction IS NOT NULL AND p.footprint_included IS NOT NULL
            THEN CONCAT(p.season_rating, '|', p.freestanding_status, '|', p.construction, '|', p.footprint_included)
    END AS cohort_id,
    CASE
        WHEN p.price_usd < a.low_edge THEN a.low_label
        WHEN p.price_usd < a.mid_edge THEN a.mid_label
        WHEN p.price_usd < a.high_edge THEN a.high_label
        ELSE a.premium_label
    END AS price_band,
    p.price_usd / p.floor_area_m2 AS price_per_floor_m2
FROM latest_products AS p CROSS JOIN analysis_settings AS a
WHERE p.verification_status = 'verified' AND NOT p.is_test_data AND p.price_usd IS NOT NULL;
