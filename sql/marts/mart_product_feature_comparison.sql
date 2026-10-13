SELECT
    product_id,
    brand_id,
    product_name,
    season_rating,
    doors_count,
    freestanding_status,
    footprint_included,
    construction,
    fabric_material,
    pole_material,
    floor_area_m2,
    source_id,
    product_url,
    price_observed_at_utc
FROM latest_products
ORDER BY product_id;
