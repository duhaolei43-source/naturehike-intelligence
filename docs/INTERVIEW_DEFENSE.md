# Interview defense

## What is this project and why Naturehike?
An independent case study of a backpacking brand's U.S. product positioning. The subject creates a concrete product-level marketing question. This is not employment, commissioned consulting, a Naturehike endorsement or access to internal business data. Do not invent a personal motivation beyond the owner's stated project interest.

## Why these competitors and category?
The requested four brands offer recognizable U.S. comparison candidates. MSR adds an explicitly semi-freestanding lightweight offer. Two-person backpacking tents narrow capacity/use differences. They still differ by season, materials, architecture, included accessories and price date; segmentation is essential. No claim of a representative competitive universe is made.

## How was data collected and why are sources credible?
Codex assisted individual official-page review, structured extraction and a live Naturehike variant check. URLs, publisher, UTC time, selected variant, source ID and field notes are public. Official specifications reduce third-party transcription ambiguity but remain manufacturer claims. Cached retrieval and incomplete permission checks are disclosed. No bulk crawler or review harvesting is used.

## How do normalization and missingness work?
Product schemas separate minimum from packed weight, material variants and sale/list/display-unclassified prices. Example: current Trailmade 2 minimum 4 lb 10 oz converts to 2097.86471125 g; 31.8 ft² converts to 2.954316672 m². Naturehike exterior expanded dimensions are not floor area. A missing season/structure/area remains null with a reason. Grand Mesa footprint inclusion is unknown rather than inferred from a separately sold accessory.

## Why these SQL queries?
`staging/latest.sql` keeps snapshot history while producing one deterministic current row per variant. `mart_brand_comparison.sql` controls season/structure/walls/footprint and computes the median gap relative to Naturehike only where that cohort has a baseline. It avoids treating repeated source observations as independent products. `mart_search_demand.sql` preserves batch, term semantics and time grain rather than generating a sales proxy.

## Why Polars and DuckDB?
Polars supports typed columnar validation and Parquet export; DuckDB executes small local analytical SQL with explicit tables and no hosted database. Pydantic validates observation-level semantic constraints; Pandera adds column-level constraints. The modest dataset does not justify Spark, cloud services, orchestration infrastructure or vector databases.

## Why descriptive analytics rather than ML?
The sample is small, manually selected and lacks customer outcomes. Forecasts or sales prediction would have no defensible target variable. Medians, observed ranges, missing-data counts and a carefully scoped Pareto comparison answer the evidence-supported product question more directly.

## How is Pareto efficiency interpreted?
An offer is dominated when another member of the selected cohort is no more expensive and no heavier, with at least one strict improvement. Ties remain efficient. Minimum and packed-weight frontiers can differ. Neither efficiency nor lower weight implies better quality, durability or comfort. The function rejects mixed cohorts.

## What does Google Trends support?
Relative interest within a documented joint comparison batch, U.S. geography, category, search type and period. It does not identify search counts, sales or market share. Term and topic semantics must be explicit. <1 is censored rather than zero. No real export currently exists; the fixture only proves parser behavior. Do not claim a seasonal demand finding.

## How were findings verified?
Source-linked raw records are validated, SQL marts are materialized, numerical changes are recalculated, and golden tests protect key aggregates. Example: Pro minimum-weight difference is 20 g but packed-weight difference is 270 g. The source data and observation date are visible. Tests support code correctness, not representative market inference.

## How does Power BI work and were DAX measures validated?
The proposed star model uses brand → product → price snapshots plus date/source relationships, and a separately scoped search-term fact. CSV/Parquet exports and explicit DAX definitions are prepared. The current dimension describes latest attributes; historical comparisons must use snapshot attributes. No supported Power BI runtime was available. DAX measures and report pages are UNVERIFIED; no functioning Power BI dashboard or cross-tool numerical parity can be claimed.

## How can someone reproduce it?
Clone, `uv sync --locked`, validate/build public inputs, run tests and launch Streamlit. Public Parquet/CSV and a hash manifest reproduce the published observations without the private audit vault. Offline CI never requests retailer pages or secrets.

## What are the main weaknesses?
30 source-verified specifications but only 27 bound prices; incomplete cohort/area fields; uncertain manufacturer weight component equivalence; one price date; sold-out advertised offers; no real Trends data; no consumer responses; no tested Power BI report; no transaction data. These weaken consumer/market inference, even if the pipeline runs correctly.

## What should be tested next?
M1: a dual-weight specification card versus lifestyle messaging for an available product. First collect baseline traffic and define eligibility, a practical effect threshold, duration and sample size. Only an authorized real test can produce marketing outcomes. There are no invented participants, uplifts, acquisition costs or ROAS.

## Which work was assisted by AI?
Codex assisted source review, schema design, pipeline/SQL, test writing, dashboard authoring, documentation and proposed marketing reasoning. The owner should independently review and be able to explain each component before claiming personal competence. This document does not assert that the owner manually coded, collected, ran or validated anything that the evidence does not establish.

## What is a legitimate résumé statement?
"Built an independent, AI-assisted market intelligence case study with source-linked product observations, Python/Polars/DuckDB transformations, validation tests and a Streamlit dashboard; proposed evidence-linked marketing experiments."
Add verified sample and test counts only after checking the release. Do not claim Naturehike employment, revenue impact, 30 verified prices, measured campaign results, completed consumer research or a validated Power BI dashboard.

## Public web walkthrough
Start at the atlas home, open I1, compare the exact Cloud Up variants, inspect a source drawer, then use the explorer to switch minimum/packed weight. Explain the canonical Naturehike baseline scope and missing inputs. Show the demand and Power BI statuses honestly. Describe the AI-assisted implementation accurately; demonstrate reproducibility and diagnosis of real failed checks without treating generated code as unaided authorship. No customer behavior, campaign execution or uplift is claimed.
