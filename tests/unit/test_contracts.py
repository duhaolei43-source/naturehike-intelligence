import json
from copy import deepcopy
from datetime import timedelta
from pathlib import Path

import pytest
from pydantic import ValidationError

from naturehike_intel.ingestion.products import load_products
from naturehike_intel.ingestion.trends import read_trends
from naturehike_intel.transformation.units import pounds_ounces_to_g, square_feet_to_m2
from naturehike_intel.validation.models import Product, Source

ROOT = Path(__file__).resolve().parents[2]


@pytest.mark.parametrize("price", [0, -1, float("nan"), float("inf")])
def test_invalid_prices(product, price):
    product["price_usd"] = price
    with pytest.raises(ValidationError):
        Product.model_validate(product)


def test_null_is_not_zero_and_needs_reason(product):
    product["price_usd"] = None
    product["price_type"] = "unavailable"
    with pytest.raises(ValidationError):
        Product.model_validate(product)
    product["missing_reasons"]["price_usd"] = "No current verified price"
    assert Product.model_validate(product).price_usd is None


def test_units():
    assert pounds_ounces_to_g(1) == pytest.approx(453.59237)
    assert pounds_ounces_to_g(4, 10) == pytest.approx(2097.86471125)
    assert square_feet_to_m2(31.8) == pytest.approx(2.954316672)
    with pytest.raises(ValueError):
        pounds_ounces_to_g(1, 16)


def test_weight_order_and_utc(product):
    product["minimum_weight_g"] = 9999
    with pytest.raises(ValidationError):
        Product.model_validate(product)
    product["minimum_weight_g"] = 1380
    product["price_observed_at_utc"] = "2026-10-13T10:00:00-05:00"
    with pytest.raises(ValidationError):
        Product.model_validate(product)


def test_source_contract():
    source = json.loads((ROOT / "data/public/raw/sources.json").read_text())[0]
    assert Source.model_validate(source).tier == "A"
    source.pop("restriction_review")
    with pytest.raises(ValidationError):
        Source.model_validate(source)


def test_duplicate_and_variant_identity(raw_copy):
    path = raw_copy / "products.json"
    rows = json.loads(path.read_text())
    rows.append(deepcopy(rows[0]))
    path.write_text(json.dumps(rows))
    with pytest.raises(ValueError, match="duplicate listing"):
        load_products(raw_copy)
    rows[-1]["product_variant"] = "different material"
    path.write_text(json.dumps(rows))
    with pytest.raises(ValueError, match="mixes variants"):
        load_products(raw_copy)


def test_product_foreign_key_and_test_data(raw_copy):
    path = raw_copy / "products.json"
    rows = json.loads(path.read_text())
    rows[0]["source_id"] = "unknown-source"
    path.write_text(json.dumps(rows))
    with pytest.raises(ValueError, match="foreign key"):
        load_products(raw_copy)
    rows[0]["is_test_data"] = True
    path.write_text(json.dumps(rows))
    with pytest.raises(ValueError, match="TEST DATA"):
        load_products(raw_copy)


def test_later_snapshot_is_permitted(raw_copy):
    from naturehike_intel.validation.models import Product

    path = raw_copy / "products.json"
    rows = json.loads(path.read_text())
    older = Product.model_validate(rows[0])
    rows.append(
        {
            **rows[0],
            "price_observed_at_utc": (older.price_observed_at_utc - timedelta(days=1)).isoformat(),
        }
    )
    path.write_text(json.dumps(rows))
    assert len(load_products(raw_copy)[1]) == 31


def test_trends_censoring_and_fixture_exclusion():
    fixtures = ROOT / "data/public/fixtures"
    with pytest.raises(ValueError, match="TEST DATA"):
        read_trends(fixtures / "trends_test.csv", fixtures / "trends_test.metadata.json")
    df, _ = read_trends(
        fixtures / "trends_test.csv", fixtures / "trends_test.metadata.json", allow_test_data=True
    )
    assert df.height == 6
    assert df["interest_index"].null_count() == 1
    assert df["censored_below_one"].sum() == 1
    assert 0 in df["interest_index"].to_list()


@pytest.mark.parametrize(
    "change",
    [
        {"geography": "CA"},
        {"normalization_scope": "arbitrary"},
        {"semantics": {}},
        {"date_end": "2024-01-01"},
    ],
)
def test_trends_scope_metadata(tmp_path, change):
    fixtures = ROOT / "data/public/fixtures"
    meta = json.loads((fixtures / "trends_test.metadata.json").read_text())
    meta.update(change)
    path = tmp_path / "meta.json"
    path.write_text(json.dumps(meta))
    with pytest.raises(ValidationError):
        read_trends(fixtures / "trends_test.csv", path, allow_test_data=True)
