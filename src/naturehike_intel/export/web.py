"""Deterministic, public allowlist export. Python/SQL remain canonical."""

import hashlib
import json
from pathlib import Path

import duckdb
import polars as pl
from pydantic import BaseModel, ConfigDict

from naturehike_intel.analytics.positioning import pareto_frontier
from naturehike_intel.ingestion.products import load_products
from naturehike_intel.provenance.audit import sha256

BASELINE = "4d81e5c7c087a70b65152eea2ee118a2fe51bf32"
PRODUCT_FIELDS = "product_id brand_id product_name product_variant product_url price_usd original_price_usd price_type minimum_weight_g packed_weight_g floor_area_m2 doors_count season_rating freestanding_status construction footprint_included availability source_id price_observed_at_utc weight_definition fabric_material notes listing_type vendor_name missing_reasons field_evidence verification_status".split()
SOURCE_FIELDS = "source_id url publisher retrieved_at_utc identifier tier confidence access_method public_use limitations evidence_sha256 extracted_fields".split()


class WebContract(BaseModel):
    model_config = ConfigDict(extra="forbid")
    schema_version: int
    dataset_version: str
    products: list[dict]
    sources: list[dict]


def write_json(path, value):
    path.write_text(
        json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2, allow_nan=False) + "\n"
    )


def export_web(root: Path, output: Path | None = None):
    output = output or root / "web/public/data"
    output.mkdir(parents=True, exist_ok=True)
    _, records, sources = load_products(root / "data/public/raw")
    processed = root / "data/public/processed"
    manifest = json.loads((processed / "manifest.json").read_text())
    dim = {
        p["product_id"]: p for p in pl.read_parquet(processed / "dim_product.parquet").to_dicts()
    }
    # Canonical latest/source/time grain comes from the pipeline, not browser ETL.
    snapshots = pl.read_parquet(processed / "fact_product_price_snapshot.parquet").filter(
        pl.col("is_latest_snapshot")
    )
    latest = {
        (p["product_id"], p["source_id"], p["price_observed_at_utc"]) for p in snapshots.to_dicts()
    }
    products = []
    for record in records:
        p = record.model_dump(mode="json")
        if (p["product_id"], p["source_id"], p["price_observed_at_utc"]) not in latest:
            continue
        if p["is_test_data"] or p["verification_status"] != "verified":
            raise ValueError("unreviewed or TEST DATA in web export")
        products.append(
            {**{k: p[k] for k in PRODUCT_FIELDS}, "cohort_id": dim[p["product_id"]]["cohort_id"]}
        )
    products.sort(key=lambda p: p["product_id"])
    public_sources = [{k: s.model_dump(mode="json")[k] for k in SOURCE_FIELDS} for s in sources]
    public_sources.sort(key=lambda s: s["source_id"])
    source_ids = {p["source_id"] for p in products}
    public_sources = [s for s in public_sources if s["source_id"] in source_ids]
    for s in public_sources:
        if s["public_use"] != "concise_facts_only":
            raise ValueError("unreviewed source reuse")
    lookup = {p["product_id"]: p for p in products}
    cloud, pro = lookup["nh-cloud-up-20d"], lookup["nh-cloud-up-pro-standard"]
    half, trail = lookup["rei-half-dome-2"], lookup["rei-trailmade-2"]
    findings = [
        {
            "id": "I1",
            "class": "Observed",
            "status": "SOURCE_VERIFIED",
            "title": "Two weights. Two different stories.",
            "product_ids": [cloud["product_id"], pro["product_id"]],
            "source_ids": [cloud["source_id"], pro["source_id"]],
            "metrics": {
                "minimum_difference_g": cloud["minimum_weight_g"] - pro["minimum_weight_g"],
                "packed_difference_g": cloud["packed_weight_g"] - pro["packed_weight_g"],
                "price_difference_usd": pro["price_usd"] - cloud["price_usd"],
            },
            "method": "Subtract variant-bound reported specifications and observed USD offers.",
            "limitation": "Approximate manufacturer specifications; component equivalence is not established. Cloud Up selected listing was sold out. No preference or performance inference.",
            "alternative": "Different included components and material variants may explain differences.",
            "recommendation_id": "E1",
        },
        {
            "id": "I2",
            "class": "Observed",
            "status": "SOURCE_VERIFIED",
            "title": "The same area does not explain the price.",
            "product_ids": [trail["product_id"], half["product_id"]],
            "source_ids": [trail["source_id"], half["source_id"]],
            "metrics": {
                "price_difference_usd": half["price_usd"] - trail["price_usd"],
                "floor_area_ft2": 31.8,
                "doors_count": 2,
            },
            "method": "Compare the selected REI offers and reported shared features; subtract display prices.",
            "limitation": "Equal area, doors and footprint inclusion do not imply equal durability or customer value. No causal premium explanation.",
            "alternative": "Fabrics, design, brand assortment and other unmeasured attributes may differ.",
            "recommendation_id": "E2",
        },
        {
            "id": "I3",
            "class": "Observed",
            "status": "SOURCE_VERIFIED",
            "title": "Check what comes in the bag.",
            "product_ids": [
                p["product_id"] for p in products if p["footprint_included"] is not None
            ],
            "source_ids": [p["source_id"] for p in products if p["footprint_included"] is not None],
            "metrics": {
                "included_count": sum(p["footprint_included"] is True for p in products),
                "excluded_count": sum(p["footprint_included"] is False for p in products),
            },
            "method": "Count populated footprint flags; unknowns remain excluded from inclusion counts.",
            "limitation": "Shipping, tax and accessory costs are incomplete; no landed-cost ranking.",
            "alternative": "Separate accessories may be optional and vary by intended use.",
            "recommendation_id": "E3",
        },
    ]
    cohorts = [
        {
            "cohort_id": c,
            "product_ids": sorted(p["product_id"] for p in products if p["cohort_id"] == c),
        }
        for c in sorted({p["cohort_id"] for p in products if p["cohort_id"]})
    ]
    quality = pl.read_parquet(processed / "mart_data_quality.parquet").to_dicts()[0]
    media = json.loads((root / "web/media-registry.json").read_text())
    payloads = {
        "products.json": products,
        "sources.json": public_sources,
        "offers.json": [
            {
                k: p[k]
                for k in [
                    "product_id",
                    "source_id",
                    "price_observed_at_utc",
                    "price_usd",
                    "price_type",
                    "cohort_id",
                ]
            }
            for p in products
        ],
        "cohorts.json": cohorts,
        "findings.json": findings,
        "demand.json": {
            "status": "INCOMPLETE",
            "batches": [],
            "observations": [],
            "reason": "No reviewed real Google Trends export is available.",
        },
        "media.json": media,
        "web.schema.json": json.loads((root / "web/contracts/web.schema.json").read_text()),
        "exclusions.json": json.loads((root / "data/public/raw/exclusions.json").read_text()),
    }
    for name, payload in payloads.items():
        write_json(output / name, payload)
    contract = WebContract(
        schema_version=1,
        dataset_version=manifest["dataset_version"],
        products=products,
        sources=public_sources,
    )
    write_json(output / "boundary.schema.json", contract.model_json_schema())
    # Shared vectors: DuckDB medians, canonical Python frontier, arbitrary filter scenarios.
    vectors = []
    cases = [
        {
            "name": "all",
            "brands": [],
            "cohort": "all",
            "price_types": [],
            "availability": [],
            "weight": "minimum_weight_g",
        },
        {
            "name": "naturehike",
            "brands": ["naturehike"],
            "cohort": "3-season|freestanding|double-wall|true",
            "price_types": [],
            "availability": [],
            "weight": "minimum_weight_g",
        },
        {
            "name": "regular_no_baseline",
            "brands": [],
            "cohort": "3-season|freestanding|double-wall|true",
            "price_types": ["regular"],
            "availability": [],
            "weight": "packed_weight_g",
        },
        {
            "name": "packed",
            "brands": [],
            "cohort": "3-season|freestanding|double-wall|true",
            "price_types": [],
            "availability": [],
            "weight": "packed_weight_g",
        },
        {
            "name": "hidden_baseline",
            "brands": ["rei"],
            "cohort": "3-season|freestanding|double-wall|true",
            "price_types": [],
            "availability": [],
            "weight": "minimum_weight_g",
        },
        {
            "name": "empty",
            "brands": ["tarptent"],
            "cohort": "3-season|freestanding|double-wall|true",
            "price_types": [],
            "availability": [],
            "weight": "minimum_weight_g",
        },
    ]
    for case in cases:
        common = [
            p
            for p in products
            if (case["cohort"] == "all" or p["cohort_id"] == case["cohort"])
            and (not case["price_types"] or p["price_type"] in case["price_types"])
            and (not case["availability"] or p["availability"] in case["availability"])
        ]
        rows = [p for p in common if not case["brands"] or p["brand_id"] in case["brands"]]
        frame = pl.DataFrame(rows, schema=pl.DataFrame(products).schema)
        baseline = [
            p["price_usd"]
            for p in common
            if p["brand_id"] == "naturehike" and p["price_usd"] is not None
        ]
        prices = [p["price_usd"] for p in rows if p["price_usd"] is not None]
        with duckdb.connect() as db:
            db.register("v", pl.DataFrame({"price": prices}, schema={"price": pl.Float64}))
            median = db.sql("SELECT median(price) FROM v").fetchone()[0]
            db.register("b", pl.DataFrame({"price": baseline}, schema={"price": pl.Float64}))
            reference = (
                db.sql("SELECT median(price) FROM b").fetchone()[0]
                if case["cohort"] != "all"
                else None
            )
        frontier = None
        eligible = frame.filter(
            pl.col("price_usd").is_not_null() & pl.col(case["weight"]).is_not_null()
        )
        if case["cohort"] != "all" and eligible.height >= 2:
            frontier = sorted(
                pareto_frontier(eligible, case["weight"])
                .filter(pl.col("pareto_efficient"))["product_id"]
                .to_list()
            )
        vectors.append(
            {
                "scope": case,
                "expected": {
                    "count": len(rows),
                    "priced": len(prices),
                    "median": median,
                    "baseline": reference,
                    "baseline_n": len(baseline) if case["cohort"] != "all" else 0,
                    "gap": median - reference
                    if median is not None and reference is not None
                    else None,
                    "missing_weight": sum(p[case["weight"]] is None for p in rows),
                    "frontier": frontier,
                },
            }
        )
    write_json(output / "parity-vectors.json", vectors)
    input_paths = [
        root / "data/public/raw/products.json",
        root / "data/public/raw/sources.json",
        root / "data/public/raw/exclusions.json",
        processed / "manifest.json",
        root / "web/media-registry.json",
        root / "web/contracts/web.schema.json",
        Path(__file__),
        root / "configs/collection.yaml",
    ]
    inputs = {str(p.relative_to(root)): sha256(p) for p in input_paths}
    outputs = {
        p.name: sha256(p) for p in sorted(output.glob("*.json")) if p.name != "manifest.json"
    }
    web_manifest = {
        "schema_version": 1,
        "dataset_version": manifest["dataset_version"],
        "baseline_commit": BASELINE,
        "input_hashes": inputs,
        "output_hashes": outputs,
        "dataset_hash": hashlib.sha256(json.dumps(outputs, sort_keys=True).encode()).hexdigest(),
        "coverage": quality,
        "rows": {
            "products": len(products),
            "sources": len(public_sources),
            "priced": sum(p["price_usd"] is not None for p in products),
        },
        "statuses": {
            "demand": "INCOMPLETE",
            "powerbi": "UNVERIFIED",
            "experiments": "PROPOSED / NOT EXECUTED",
        },
    }
    write_json(output / "manifest.json", web_manifest)
    return web_manifest
