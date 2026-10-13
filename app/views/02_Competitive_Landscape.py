import plotly.express as px
import polars as pl
import streamlit as st

from naturehike_intel.dashboard import BRAND_NAMES, brand_filter, header, scope, sources, table

header(
    "RQ1 · Competitive landscape",
    "Understand the offers behind the prices",
    "Start with price distributions, then control for structure and accessories before interpreting brand gaps.",
)
data = brand_filter(table("mart_competitor_pricing"))
show_sale = st.checkbox("Include observed sale prices", value=True)
if not show_sale:
    data = data.filter(pl.col("price_type") != "sale")
if data.height:
    fig = px.box(
        data.to_dicts(),
        x="brand_id",
        y="price_usd",
        points="all",
        hover_data=["product_name", "price_type", "product_variant"],
        title="Observed product price by brand (USD)",
        labels={"brand_id": "Brand", "price_usd": "Display price (USD)"},
    )
    fig.update_layout(showlegend=False)
    fig.update_xaxes(tickvals=list(BRAND_NAMES), ticktext=list(BRAND_NAMES.values()))
    st.plotly_chart(fig, width="stretch")
    scope(data)
    st.caption(
        "Descriptive distributions mix offers and reflect assortment selection. They do not establish population brand positioning or comparable performance."
    )
    st.dataframe(
        data.select(
            "brand_id",
            "product_name",
            "price_usd",
            "price_type",
            "original_price_usd",
            "sale_discount_usd",
            "price_band",
            "season_rating",
            "freestanding_status",
            "footprint_included",
        ),
        hide_index=True,
    )
else:
    st.info("No observations match these filters.")
st.subheader("Controlled brand comparison")
st.caption(
    "Same season, structure, wall construction and footprint inclusion. Unknown attributes are excluded. Price gap is brand median minus Naturehike median in that cohort; null means no matching Naturehike baseline."
)
st.dataframe(table("mart_brand_comparison"), hide_index=True)
sources(data)
