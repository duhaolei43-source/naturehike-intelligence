import json
import shutil
from pathlib import Path

import polars as pl
import pytest

from naturehike_intel.analytics.positioning import pareto_frontier
from naturehike_intel.transformation.pipeline import build

ROOT = Path(__file__).resolve().parents[2]


def test_offline_build_golden_and_stability(tmp_path):
    a = build(ROOT, tmp_path / "a", audit=False)
    b = build(ROOT, tmp_path / "b", audit=False)
    assert a == b
    actual = pl.read_parquet(tmp_path / "a/mart_competitor_pricing.parquet")
    assert actual.height == 27
    quality = pl.read_parquet(tmp_path / "a/mart_data_quality.parquet").row(0, named=True)
    expected = json.loads((ROOT / "tests/golden/quality.json").read_text())
    for key, value in expected.items():
        assert quality[key] == value
    assert pl.read_parquet(tmp_path / "a/mart_search_demand.parquet").is_empty()
    brands = pl.read_parquet(tmp_path / "a/mart_brand_comparison.parquet")
    assert "the-north-face" not in brands["brand_id"].to_list()
    rei = brands.filter(pl.col("brand_id") == "rei").row(0, named=True)
    assert rei["median_price_usd"] == 259
    assert rei["price_gap_vs_naturehike_usd"] == 120
    fact = pl.read_parquet(tmp_path / "a/fact_product_price_snapshot.parquet")
    assert set(fact["product_id"]) <= set(
        pl.read_parquet(tmp_path / "a/dim_product.parquet")["product_id"]
    )


def test_temporal_latest_selection(tmp_path):
    root = tmp_path / "repo"
    for name in ["data/public/raw", "configs", "sql", "src"]:
        shutil.copytree(ROOT / name, root / name)
    path = root / "data/public/raw/products.json"
    rows = json.loads(path.read_text())
    older = {**rows[0], "price_usd": 99, "price_observed_at_utc": "2025-01-01T00:00:00Z"}
    rows.append(older)
    path.write_text(json.dumps(rows))
    build(root, tmp_path / "out", audit=False)
    fact = pl.read_parquet(tmp_path / "out/fact_product_price_snapshot.parquet")
    assert fact.height == 31
    mart = pl.read_parquet(tmp_path / "out/mart_competitor_pricing.parquet")
    assert mart.filter(pl.col("product_id") == older["product_id"])["price_usd"][0] == 119


def test_pareto_ties_and_missing_values():
    # TEST DATA: minimum-price/weight dominance is independent of input order.
    df = pl.DataFrame(
        {
            "product_id": ["a", "b", "c", "d", "e"],
            "price_usd": [100.0, 120.0, 100.0, 80.0, 10.0],
            "minimum_weight_g": [1000.0, 1200.0, 1000.0, 1500.0, None],
            "cohort_id": ["test"] * 5,
        }
    )
    result = pareto_frontier(df)
    assert dict(zip(result["product_id"], result["pareto_efficient"], strict=True)) == {
        "a": True,
        "b": False,
        "c": True,
        "d": True,
    }
    mixed = df.with_columns(pl.Series("cohort_id", ["test", "other", "test", "test", "test"]))
    with pytest.raises(ValueError, match="cohort"):
        pareto_frontier(mixed)
