import json
import os
import tempfile
import time
from datetime import date
from pathlib import Path

import duckdb
import polars as pl
import yaml

from naturehike_intel.ingestion.products import load_products
from naturehike_intel.ingestion.trends import TREND_SCHEMA, read_trends
from naturehike_intel.provenance.audit import record_event, sha256


def build(root: Path, output: Path | None = None, *, audit=True):
    root = root.resolve()
    output = output or root / "data/public/processed"
    output.mkdir(parents=True, exist_ok=True)
    started = time.monotonic()
    inputs = (
        sorted((root / "data/public/raw").glob("*"))
        + sorted((root / "configs").glob("*.yaml"))
        + sorted((root / "sql").rglob("*.sql"))
        + sorted((root / "src").rglob("*.py"))
        + [root / "pyproject.toml", root / "uv.lock", root / ".python-version"]
    )
    inputs = [p for p in inputs if p.is_file()]
    hashes = {str(p.relative_to(root)): sha256(p) for p in inputs}
    try:
        products, _, sources = load_products(root / "data/public/raw")
        config = yaml.safe_load((root / "configs/analysis.yaml").read_text())
        edges = config["price_band_edges_usd"]
        if (
            len(edges) != 3
            or not all(isinstance(x, (int, float)) and x > 0 for x in edges)
            or edges != sorted(set(edges))
        ):
            raise ValueError("price bands require three increasing positive edges")
        settings = pl.DataFrame(
            {
                "low_edge": [float(edges[0])],
                "mid_edge": [float(edges[1])],
                "high_edge": [float(edges[2])],
                "low_label": [f"Under ${edges[0]:g}"],
                "mid_label": [f"${edges[0]:g} to <${edges[1]:g}"],
                "high_label": [f"${edges[1]:g} to <${edges[2]:g}"],
                "premium_label": [f"${edges[2]:g}+"],
            }
        )
        trends = pl.DataFrame(schema=TREND_SCHEMA)
        metas = []
        registry = {s.source_id: s for s in sources}
        for metadata in sorted((root / "data/public/raw").glob("trends_*.metadata.json")):
            csv_path = metadata.with_name(metadata.name.replace(".metadata.json", ".csv"))
            batch, meta = read_trends(csv_path, metadata)
            if meta.source_id not in registry or registry[meta.source_id].tier != "C":
                raise ValueError("Trends requires a registered Tier C source")
            if meta.batch_id in {m.batch_id for m in metas}:
                raise ValueError("duplicate Trends batch")
            metas.append(meta)
            trends = pl.concat([trends, batch])
        with tempfile.TemporaryDirectory(dir=output.parent) as temporary:
            temp = Path(temporary)
            with duckdb.connect(str(temp / "market.duckdb")) as db:
                db.register("raw_products", products)
                db.register("raw_trends", trends)
                db.register("analysis_settings", settings)
                for stage in ["staging", "intermediate"]:
                    for query in sorted((root / "sql" / stage).glob("*.sql")):
                        db.execute(query.read_text())
                latest = db.sql("SELECT * FROM latest_products ORDER BY product_id").pl()
                cohort_fields = [
                    "season_rating",
                    "freestanding_status",
                    "construction",
                    "footprint_included",
                ]
                latest = latest.with_columns(
                    pl.when(pl.all_horizontal([pl.col(k).is_not_null() for k in cohort_fields]))
                    .then(
                        pl.concat_str(
                            [pl.col(k).cast(pl.String) for k in cohort_fields], separator="|"
                        )
                    )
                    .otherwise(None)
                    .alias("cohort_id")
                )
                snapshot_keys = ["product_id", "price_observed_at_utc", "source_id"]
                snapshots = products.join(
                    latest.select(snapshot_keys).with_columns(
                        pl.lit(True).alias("is_latest_snapshot")
                    ),
                    on=snapshot_keys,
                    how="left",
                ).with_columns(
                    pl.col("is_latest_snapshot").fill_null(False),
                    pl.col("price_observed_at_utc").str.slice(0, 10).alias("observation_date"),
                    (
                        pl.all_horizontal([pl.col(k).is_not_null() for k in cohort_fields])
                        & pl.col("price_usd").is_not_null()
                        & (pl.col("verification_status") == "verified")
                    ).alias("is_comparable_snapshot"),
                )
                tables = {
                    "dim_brand": latest.select("brand_id")
                    .unique()
                    .sort("brand_id")
                    .with_columns(pl.col("brand_id").alias("brand_name")),
                    "dim_product": latest.select(
                        "product_id",
                        "brand_id",
                        "product_name",
                        "product_variant",
                        "product_url",
                        "season_rating",
                        "freestanding_status",
                        "footprint_included",
                        "construction",
                        "cohort_id",
                    ),
                    "dim_source": pl.DataFrame(
                        [
                            s.model_dump(mode="json", exclude={"extracted_fields", "limitations"})
                            for s in sources
                        ]
                    ).sort("source_id"),
                    "dim_search_term": trends.select("term_id", "term", "semantics", "batch_id")
                    .unique()
                    .sort("term_id"),
                    "fact_product_price_snapshot": snapshots.sort(
                        ["product_id", "price_observed_at_utc", "source_id"]
                    ),
                    "fact_search_interest": trends.sort(["batch_id", "term_id", "date"]),
                }
                dates = sorted(
                    set(
                        products["price_observed_at_utc"].str.slice(0, 10).to_list()
                        + trends["date"].to_list()
                    )
                )
                dates = (
                    pl.date_range(
                        date.fromisoformat(dates[0]), date.fromisoformat(dates[-1]), eager=True
                    )
                    .dt.strftime("%Y-%m-%d")
                    .to_list()
                )
                tables["dim_date"] = pl.DataFrame({"date": dates}).with_columns(
                    pl.col("date").str.to_date().dt.year().alias("year"),
                    pl.col("date").str.to_date().dt.month().alias("month"),
                )
                for query in sorted((root / "sql/marts").glob("*.sql")):
                    tables[query.stem] = db.sql(query.read_text()).pl()
                for name, table in tables.items():
                    # Materialize registered inputs before closing the database.
                    db.register("export_table", table)
                    db.execute(f'CREATE TABLE "{name}" AS SELECT * FROM export_table')
                    table.write_parquet(temp / f"{name}.parquet")
                    table.write_csv(temp / f"{name}.csv")
            manifest = {
                "dataset_version": yaml.safe_load((root / "configs/collection.yaml").read_text())[
                    "dataset_version"
                ],
                "input_hashes": hashes,
                "outputs": {
                    p.name: sha256(p)
                    for p in sorted(temp.glob("*"))
                    if p.suffix in {".parquet", ".csv"}
                },
                "rows": {name: table.height for name, table in sorted(tables.items())},
                "demand_status": "verified_export" if metas else "incomplete_no_exports",
                "powerbi_status": "UNVERIFIED",
            }
            (temp / "manifest.json").write_text(
                json.dumps(manifest, indent=2, sort_keys=True) + "\n"
            )
            for path in sorted(temp.glob("*")):
                os.replace(path, output / path.name)
        if audit:
            record_event(
                root,
                stage="analysis",
                action="Deterministic offline build",
                status="success",
                input_hashes=hashes,
                output_hashes=manifest["outputs"],
                limitations=[manifest["demand_status"], "Power BI runtime unverified"],
                duration_seconds=time.monotonic() - started,
            )
        return manifest
    except Exception as exc:
        if audit:
            record_event(
                root,
                stage="analysis",
                action="Offline build failed",
                status="failure",
                input_hashes=hashes,
                limitations=[type(exc).__name__],
                duration_seconds=time.monotonic() - started,
            )
        raise
