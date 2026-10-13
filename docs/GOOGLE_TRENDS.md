# Manual Google Trends ingestion

Status: **INCOMPLETE — no real exports**. No unofficial scraping is used. data/public/fixtures/trends_test.csv is synthetic TEST DATA and is rejected by the public builder.

1. In Google Trends, select United States, a documented period, category and search type. Compare at most five documented terms/topics together. Save the "Interest over time" CSV and document whether each is a search term or topic. Do not silently substitute a topic.
2. Review the current Google data/export-use conditions and register the export as a Tier C source in sources.json, with identifier, URL, UTC retrieval/export timestamp, permission review and SHA-256 for the retained evidence record.
3. Save a reviewed redistributable input as data/public/raw/trends_<batch>.csv and its sidecar as trends_<batch>.metadata.json. Copy the metadata shape from the TEST DATA sidecar, replace every field with actual metadata and set is_test_data=false. terms maps your term key to its exact CSV column label.
4. Preserve the export's original Week/Month/Day header and data. The adapter skips preamble lines, validates exact term columns, rejects duplicate/out-of-period observations and handles monthly date ranges and <1 censoring. Values outside 0–100 or undocumented normalization fail.
5. Rebuild and inspect the batch in the demand page. The empty current demand tables have valid typed schemas; no fabricated curve is substituted.

The pipeline never joins Trends to products as sales. It shows one comparison batch at a time. Independently exported batches cannot be ranked against each other. Normalization/sampling can vary across repeated exports; record each as a distinct batch. Do not infer seasonality from a few weeks; use several comparable annual cycles before a descriptive seasonal pattern is proposed.
