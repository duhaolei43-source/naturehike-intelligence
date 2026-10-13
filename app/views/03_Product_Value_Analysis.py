import plotly.express as px
import polars as pl
import streamlit as st

from naturehike_intel.analytics.positioning import pareto_frontier
from naturehike_intel.dashboard import header, scope, sources, table

header(
    "RQ1 · Product engineering",
    "Price and weight are only part of the decision",
    "The frontier minimizes price and the selected weight definition within one cohort. It does not measure quality, reliability or comfort.",
)
data = table("mart_weight_price_positioning")
complete = data.filter(
    pl.all_horizontal(
        [
            pl.col(k).is_not_null()
            for k in ["season_rating", "freestanding_status", "construction", "footprint_included"]
        ]
    )
)
cohorts = sorted(complete["cohort_id"].unique().to_list())
if not cohorts:
    st.info("No complete comparison cohorts are available.")
    st.stop()


def cohort_label(value):
    season, structure, walls, footprint = value.split("|")
    return f"{season} · {structure} · {walls} · Footprint {'included' if footprint == 'true' else 'not included'}"


focal_cohorts = (
    complete.filter(pl.col("brand_id") == "naturehike")["cohort_id"].unique().sort().to_list()
)
default_cohort = focal_cohorts[0] if focal_cohorts else cohorts[0]
cohort = st.selectbox(
    "Comparable product group",
    cohorts,
    index=cohorts.index(default_cohort),
    format_func=cohort_label,
)
weight = st.selectbox(
    "Weight definition",
    ["minimum_weight_g", "packed_weight_g"],
    format_func=lambda value: {
        "minimum_weight_g": "Minimum / trail weight (g)",
        "packed_weight_g": "Packed / total weight (g)",
    }[value],
)
selected = complete.filter(pl.col("cohort_id") == cohort)
position = pareto_frontier(selected, weight)
if position.height:
    fig = px.scatter(
        position.to_dicts(),
        x=weight,
        y="price_usd",
        color="brand_id",
        symbol="pareto_efficient",
        hover_name="product_name",
        title="Price versus declared weight — selected cohort",
        labels={
            weight: "Declared weight (g)",
            "price_usd": "Display price (USD)",
            "brand_id": "Brand",
            "pareto_efficient": "Pareto efficient",
        },
    )
    st.plotly_chart(fig, width="stretch")
    scope(selected)
    st.caption(
        "Sensitivity check: switch minimum/packed weight and cohort. Accessory contents and manufacturer definitions can change the frontier; no objective value score is used."
    )
else:
    st.info("This cohort has no verified values for the selected weight definition.")
st.subheader("Specification matrix")
st.dataframe(position, hide_index=True)
st.subheader("Price versus published floor area")
area = selected.filter(pl.col("floor_area_m2").is_not_null())
if area.height:
    st.plotly_chart(
        px.scatter(
            area.to_dicts(),
            x="floor_area_m2",
            y="price_usd",
            color="brand_id",
            hover_name="product_name",
            title="Price versus published interior floor area — selected cohort",
            labels={
                "floor_area_m2": "Published floor area (m²)",
                "price_usd": "Display price (USD)",
                "brand_id": "Brand",
            },
        ),
        width="stretch",
    )
    scope(area)
else:
    st.info(
        "No published floor-area values in this cohort; expanded exterior dimensions are not substituted."
    )
sources(selected)
