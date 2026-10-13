SELECT
    batch_id,
    term_id,
    term,
    semantics,
    geography,
    date,
    period_end,
    interest_index,
    censored_below_one,
    category,
    search_type,
    source_id
FROM raw_trends
WHERE NOT is_test_data
ORDER BY batch_id, term_id, date;
