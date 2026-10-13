# Public web experience

The static Next.js site under `web/` extends the existing Python/Polars/DuckDB research workbench. It is implemented locally and prepared for review; no public hosting release has occurred.

## Routes
`/`, `/explore/`, `/products/[id]/` (all 30 stable IDs), `/compare/`, `/insights/`, `/demand/`, `/strategy/`, `/methodology/`, `/about/`. Pages explain the current dated dataset and independent project status. Demand is intentionally empty; strategy is proposed; Power BI runtime is unverified.

## Serializable state
`Scope` in `web/lib/analysis.ts` includes dataset, brand IDs, exact cohort, price types, availability, selected weight, USD bounds, selected IDs, compare IDs and view. URLSearchParams encodes it. Unknown/invalid values show a notice; unknown datasets reset. Browser back/forward and reload are tested.

Empty brand/type/availability arrays mean all. Brand selection is a native multiple select with its keyboard convention stated. Filter changes clear selection; selection highlights without redefining the population. The tray holds up to four public product IDs; 2–4 enable comparison. Arrow buttons provide reorder. The localStorage record includes version and dataset; incompatible records are ignored. No visitor preferences/research are collected.

## Analysis boundary
Canonical latest/source/time selection happens in Python/SQL. All 30 records, including three unpriced Tarptent variants, are exported. Small TypeScript aggregation functions calculate filtered count/median/gap/frontier. DuckDB/Python vectors test exact parity, including hidden and absent baselines, empty scope and packed exclusions.

Naturehike reference uses the same complete cohort, price type, availability and USD bounds but ignores the visible brand restriction; n and scope are shown. The broad all-offers view has no controlled gap/frontier. Singleton eligible populations have no frontier badge. Comparisons show raw facts; mixed/unknown cohorts have warnings and no controlled ranking. Missing values never become zero.

Chart click/brush and table checkboxes synchronize selection. CSV exports include units via metadata, date, source identifiers and missing reasons; string fields are protected against spreadsheet formula interpretation. The data manifest contains deterministic inputs/outputs and no deployment timestamp.

## Publication gate
Ship only reviewed `web/out/`, after `scripts/verify_web_release.py --artifact web/out` and Gitleaks. Read the release checklist before hosting. No private audit, local handoff, transcripts or source captures belong in the repository or hosting artifact.
