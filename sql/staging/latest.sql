CREATE OR REPLACE TABLE latest_products AS
SELECT * EXCLUDE (row_num) FROM (
    SELECT -- noqa: AM04
        *,
        ROW_NUMBER() OVER (
            PARTITION BY product_id ORDER BY price_observed_at_utc DESC, source_id ASC, product_url ASC
        ) AS row_num
    FROM raw_products
)
WHERE row_num = 1;
