# Proposed Import semantic model — UNVERIFIED

## Import mapping and relationships
Import the validated CSV exports using a DataRoot parameter supplied by the reviewer; do not hard-code the owner's absolute path. Parse prices as fixed decimal currency, IDs as text, weight/area as decimal, flags as booleans, observation_date/date as date and UTC timestamps as datetime. Keep nulls. Disable automatic date tables and implicit numeric measures. Hide IDs and measure source columns.

| Export | Proposed display name | Grain / role |
|---|---|---|
| dim_brand.csv | Brand | One brand |
| dim_product.csv | Product | One latest product variant, including cohort_id |
| dim_source.csv | Source | One reviewed source record |
| dim_date.csv | Date | Contiguous date range across public observations |
| dim_search_term.csv | Search Term | One term/topic within one batch |
| fact_product_price_snapshot.csv | Product Price | One variant/source/UTC snapshot, including is_latest_snapshot and is_comparable_snapshot |
| fact_search_interest.csv | Search Interest | One batch/term/US/period observation |

Single-direction 1:* relationships from Brand[brand_id] to Product Price[brand_id], Product[product_id] to Product Price[product_id], Source[source_id] to Product Price[source_id], and Date[date] to Product Price[observation_date]. Brand is not additionally connected to Product; this avoids a second path. The Python dimensional product→brand key is retained as a data contract but need not create a snowflake relationship in the semantic model.

Search Term[term_id] → Search Interest[term_id], Source[source_id] → Search Interest[source_id], Date[date] → Search Interest[date]. Never create a Product→Search Interest relationship or treat search as product sales. Product/brand slicers control price facts; batch/term slicers control demand facts. A shared source/date filter can legitimately restrict each independently.

Product is a latest-attribute dimension, not an SCD2 history model. Historical price facts retain season/structure/accessory fields. Latest-offer measures use upstream is_latest_snapshot, whose selection is deterministic by UTC timestamp/source/URL; filtering an old date does not reinterpret that as a current offer. Historical segmentation needs snapshot attributes and separate historical measures.

## Filter and number validation plan
1. Confirm dimension keys are unique and all facts resolve to matching keys.
2. Confirm each dimension filter reaches only its intended fact through one direction. Test combinations of brand, cohort, source, product and date.
3. Check Current Offer counts against latest SQL outputs; historic rows must not inflate counts or medians.
4. Compare Product Count, Median Price, Minimum/Packed medians and Source Coverage against DuckDB. Test complete/incomplete cohorts, blank weight, no Naturehike baseline and empty filters.
5. DAX Price Gap must be blank for multiple/unknown cohorts or absent Naturehike baseline. It is selected brand median minus Naturehike median in the same complete cohort, not a global brand ranking.
6. Compare decimal import tolerances: USD ±0.005; grams ±0.001; floor area ±0.0001 m². Record any rounding differences and resolve before release.
7. Search Interest measures must be blank across multiple batches, incompatible terms or no real data; never aggregate into search counts. Confirm <1 does not become zero.

The reference targets are verified in Python/SQL; proposed DAX expressions remain unexecuted. Store actual DAX outputs, test differences and report screenshots privately only after a supported runtime runs them.
