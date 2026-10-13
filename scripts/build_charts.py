"""Create reviewed descriptive artifacts from real current offers; never run in CI."""

import json
from pathlib import Path

import plotly.express as px
import polars as pl

from naturehike_intel.analytics.positioning import pareto_frontier, robust_summary

root = Path(__file__).resolve().parents[1]
processed = root / "data/public/processed"
charts = root / "outputs/public/charts"
reports = root / "outputs/public/reports"
charts.mkdir(parents=True, exist_ok=True)
reports.mkdir(parents=True, exist_ok=True)
data = pl.read_parquet(processed / "mart_weight_price_positioning.parquet")
pricing = pl.read_parquet(processed / "mart_competitor_pricing.parquet")
caption = "Observed 2026-10-13 UTC · USD before tax/shipping · Official product listings · Convenience sample, not sales. See source-linked tables."
fig = px.box(
    pricing.to_dicts(),
    x="brand_id",
    y="price_usd",
    points="all",
    hover_data=["product_name", "price_type"],
    title="Observed advertised tent prices by brand (USD)",
    labels={"brand_id": "Brand", "price_usd": "Display price (USD)"},
)
fig.add_annotation(
    text=caption, xref="paper", yref="paper", x=0, y=-0.2, showarrow=False, font_size=10
)
fig.update_layout(margin={"b": 100})
fig.write_html(
    charts / "brand_price_distribution.html",
    include_plotlyjs="directory",
    div_id="brand-price-distribution",
)
cohort = "3-season|freestanding|double-wall|true"
selected = data.filter(pl.col("cohort_id") == cohort)
for weight in ["minimum_weight_g", "packed_weight_g"]:
    points = pareto_frontier(selected, weight)
    fig = px.scatter(
        points.to_dicts(),
        x=weight,
        y="price_usd",
        color="brand_id",
        symbol="pareto_efficient",
        hover_name="product_name",
        title=f"Price versus {weight.replace('_', ' ')} — {cohort}",
        labels={
            weight: "Declared weight (g)",
            "price_usd": "Display price (USD)",
            "brand_id": "Brand",
            "pareto_efficient": "Pareto efficient",
        },
    )
    fig.add_annotation(
        text=caption
        + "<br>Component definitions/materials differ; efficiency does not measure quality or comfort.",
        xref="paper",
        yref="paper",
        x=0,
        y=-0.2,
        showarrow=False,
        font_size=10,
    )
    fig.update_layout(margin={"b": 100})
    fig.write_html(
        charts / f"price_{weight}.html", include_plotlyjs="directory", div_id=f"price-{weight}"
    )
    points.write_csv(reports / f"pareto_{weight}.csv")
summary = {
    "dataset_version": "2026-10-13-v1",
    "sample": "30 source-verified specifications across 9 brands; 27 verified prices; convenience sample",
    "observed_prices_usd": {
        "median": pricing["price_usd"].median(),
        "min": pricing["price_usd"].min(),
        "max": pricing["price_usd"].max(),
        **robust_summary(pricing["price_usd"].to_list()),
    },
    "naturehike_median_with_sale_usd": pricing.filter(pl.col("brand_id") == "naturehike")[
        "price_usd"
    ].median(),
    "naturehike_median_excluding_sale_usd": pricing.filter(
        (pl.col("brand_id") == "naturehike") & (pl.col("price_type") != "sale")
    )["price_usd"].median(),
    "strict_cohort_count": data["cohort_id"].drop_nulls().n_unique(),
    "demand_status": "incomplete_no_exports",
    "powerbi_status": "UNVERIFIED",
    "limitations": [
        "No transaction or population inference",
        "Minimum and packed component definitions can differ",
        "Material and floor-area controls remain incomplete",
    ],
}
(reports / "descriptive_summary.json").write_text(json.dumps(summary, indent=2) + "\n")
print(
    "Generated three real-data interactive charts and reviewed descriptive/sensitivity summaries."
)
