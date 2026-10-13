import json
from pathlib import Path

import pandera.polars as pa
import polars as pl

from naturehike_intel.validation.models import Product, Source

NUMERIC_FIELDS = [
    "price_usd",
    "minimum_weight_g",
    "packed_weight_g",
    "floor_area_m2",
    "original_price_usd",
    "shipping_cost_usd",
    "floor_length_cm",
    "floor_width_cm",
    "peak_height_cm",
    "waterproof_rating_mm",
]


def load_products(raw: Path, *, allow_test_data: bool = False):
    sources = [Source.model_validate(x) for x in json.loads((raw / "sources.json").read_text())]
    if len({s.source_id for s in sources}) != len(sources):
        raise ValueError("duplicate source identifier")
    registry = {s.source_id: s for s in sources}
    products = [Product.model_validate(x) for x in json.loads((raw / "products.json").read_text())]
    if not products:
        raise ValueError("product observations must not be empty")
    keys = set()
    identities = {}
    for p in products:
        if p.is_test_data and not allow_test_data:
            raise ValueError("TEST DATA cannot enter public outputs")
        if p.source_id not in registry:
            raise ValueError("missing source foreign key")
        s = registry[p.source_id]
        if str(p.product_url) != str(s.url):
            raise ValueError("product/source URL mismatch")
        if p.price_observed_at_utc > s.retrieved_at_utc:
            raise ValueError("observation is later than retrieval")
        if not p.advertised_us or not p.backpacking_evidence:
            raise ValueError("outside product inclusion criteria")
        identity = (p.brand_id, p.product_name, p.product_variant)
        if p.product_id in identities and identities[p.product_id] != identity:
            raise ValueError("product identifier mixes variants")
        if identity in identities.values() and p.product_id not in identities:
            raise ValueError("same variant assigned multiple identifiers")
        identities[p.product_id] = identity
        key = (p.product_id, str(p.product_url), p.source_id, p.price_observed_at_utc)
        if key in keys:
            raise ValueError("duplicate listing snapshot")
        keys.add(key)
    rows = [
        p.model_dump(mode="json", exclude={"missing_reasons", "field_evidence"}) for p in products
    ]
    df = pl.DataFrame(rows, infer_schema_length=None).with_columns(
        [pl.col(k).cast(pl.Float64) for k in NUMERIC_FIELDS]
        + [pl.col("doors_count").cast(pl.Int64), pl.col("footprint_included").cast(pl.Boolean)]
    )
    pa.DataFrameSchema(
        {
            "price_usd": pa.Column(float, pa.Check.gt(0), nullable=True),
            "capacity_persons": pa.Column(int, pa.Check.eq(2)),
            "is_test_data": pa.Column(bool),
        }
    ).validate(df)
    return df, products, sources
