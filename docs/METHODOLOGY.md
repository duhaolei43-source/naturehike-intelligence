# Methodology

## Collection and provenance
Individual official product pages were reviewed through ordinary public web access on 2026-10-13. Naturehike selected material and USD price were checked in a live browser. Other pages were reviewed through retrieved official web content, which may be cached. The retrieval timestamp is not a guarantee of live checkout pricing. Concise factual records, field-level extraction notes, missing reasons and URLs are public; private structured extraction evidence stays outside Git.

A verified record means its populated fields were checked against the identified source. It does not mean every field is present, the retailer has stock, the tent has been physically tested, or the manufacturer's claim is independently validated. Confidence applies to source attribution, not performance. Derived construction classifications are disclosed in field evidence.

## Normalization
Prices remain USD and preserve regular, sale, displayed-unclassified or unavailable status. A generic UI "Sale price" label without a higher verified original price is unclassified. Promotional codes, membership rewards, tax and shipping are not deducted. A standalone footprint price is not a tent price.

Minimum/trail weight and packed/packaged/total weight remain separate columns. Metric source values take precedence over rounded imperial equivalents; disagreements are recorded. Where only imperial values exist, convert ounces using 28.349523125 g/oz and area using 0.09290304 m²/ft². No exterior dimensions are substituted for interior floor area. Nulls require reasons and never become zero. Minimum component equivalence across manufacturers remains a limitation.

## Grain and deterministic transformations
A raw product row is one variant/listing/source/UTC observation. Stable product IDs do not mix material variants. Duplicate snapshots are rejected; history is preserved in the price fact. SQL selects one latest canonical observation per product, breaking equal timestamps deterministically by source and URL. Brand summaries use current offers, not repeated price observations. Price bands are declared in configs/analysis.yaml and applied in SQL.

Dimensions: brand → product, source, date and search term. Facts: product price snapshots and search interest. Product dimensions describe the latest attributes; historical specifications remain on snapshot facts. Historical segmentation should use snapshot attributes rather than current dimension attributes. All analytical tables export as CSV and Parquet; the local DuckDB file is ignored by Git.

## Comparison and statistics
Broad brand price distributions are descriptive assortment views. Controlled gaps and Pareto frontiers require known season, structure, wall construction and footprint inclusion, plus the same selected weight definition. Material differences still limit causal interpretation. Frontier efficiency only means no observed cohort member is simultaneously cheaper and lighter with at least one strict improvement. Equal points are retained. Unknown attributes are not grouped into a comparable cohort.

Median, range, interquartile spread and missingness summarize the convenience sample. Sensitivity checks change minimum/packed weight, exclude the observed sale listing, and vary cohort/accessory assumptions. No weighted objective value score, significance test, population confidence interval or machine-learning prediction is justified.

## Search demand
The manual Trends CSV adapter requires metadata for geography, dates, category, search type, exact columns, term/topic semantics, export UTC date and joint comparison batch. Less-than-one observations remain censored/null; zero is retained. Monthly periods receive explicit month-end dates. Do not compare independently normalized batches or join brand search interest to product sales.

No real export is present, so demand findings and seasonality remain incomplete. Synthetic fixtures test only the adapter. The dashboard never displays them as research observations.

The expanded sample includes official REI retailer listings for other manufacturers; their publisher and listing_type are explicit. Retailer values are verified against the retailer page and do not imply independent manufacturer corroboration. Tarptent 3+ ratings remain a separate segment; a price range is never substituted for an unbound variant price, and Typical weight is not converted to a packed-weight claim. Trekking-pole exclusions remain visible.
