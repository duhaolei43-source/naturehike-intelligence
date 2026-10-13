import json
from pathlib import Path

import polars as pl
import streamlit as st

ROOT = Path(__file__).resolve().parents[2]
PROCESSED = ROOT / "data/public/processed"
BRAND_NAMES = {
    "naturehike": "Naturehike",
    "kelty": "Kelty",
    "rei": "REI Co-op",
    "the-north-face": "The North Face",
    "msr": "MSR",
    "big-agnes": "Big Agnes",
    "nemo": "NEMO",
    "mountain-hardwear": "Mountain Hardwear",
    "tarptent": "Tarptent",
}


def table(name):
    path = PROCESSED / f"{name}.parquet"
    if not path.exists():
        st.error("Data exports are missing. Run: uv run python scripts/build_data.py")
        st.stop()
    data = pl.read_parquet(path)
    if "is_test_data" in data.columns and data["is_test_data"].any():
        st.error("TEST DATA detected: dashboard refuses business display.")
        st.stop()
    return data


def header(kicker, title, description):
    st.caption(kicker.upper())
    st.title(title)
    st.markdown(description)


def scope(data):
    if data.height:
        dates = data["price_observed_at_utc"].str.slice(0, 10)
        st.caption(
            f"Observation period: {dates.min()} to {dates.max()} UTC. USD display prices before tax/shipping. Convenience sample; advertised listings may be sold out."
        )
    st.caption(
        "Sources: official product listings. Source-linked table below identifies every observation. Manufacturer weights may include different components; lighter is not a quality rating."
    )


def sources(data):
    columns = [
        k
        for k in [
            "product_name",
            "product_variant",
            "product_url",
            "source_id",
            "price_observed_at_utc",
        ]
        if k in data.columns
    ]
    st.dataframe(
        data.select(columns),
        hide_index=True,
        column_config={"product_url": st.column_config.LinkColumn("Official product source")},
        width="stretch",
    )


def brand_filter(data):
    values = sorted(data["brand_id"].unique().to_list())
    brands = st.multiselect(
        "Brands", values, default=values, format_func=lambda value: BRAND_NAMES.get(value, value)
    )
    return data.filter(pl.col("brand_id").is_in(brands))


def manifest():
    return json.loads((PROCESSED / "manifest.json").read_text())
