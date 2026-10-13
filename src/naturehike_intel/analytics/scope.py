import polars as pl


def controlled_prices(visible: pl.DataFrame, baseline: pl.DataFrame) -> pl.DataFrame:
    """Use the visible population; baseline retains canonical Naturehike under the same filters."""
    summaries = (
        visible.filter(pl.col("cohort_id").is_not_null())
        .group_by("cohort_id", "brand_id")
        .agg(
            pl.len().alias("listing_count"), pl.col("price_usd").median().alias("median_price_usd")
        )
    )
    reference = (
        baseline.filter((pl.col("brand_id") == "naturehike") & pl.col("cohort_id").is_not_null())
        .group_by("cohort_id")
        .agg(
            pl.len().alias("naturehike_n"),
            pl.col("price_usd").median().alias("naturehike_median_price_usd"),
        )
    )
    return (
        summaries.join(reference, on="cohort_id", how="left")
        .with_columns(
            (pl.col("median_price_usd") - pl.col("naturehike_median_price_usd")).alias(
                "price_gap_vs_naturehike_usd"
            )
        )
        .sort("cohort_id", "brand_id")
    )
