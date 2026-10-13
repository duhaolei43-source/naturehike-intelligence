import polars as pl
from scipy.stats import iqr


def pareto_frontier(df: pl.DataFrame, weight="minimum_weight_g") -> pl.DataFrame:
    if "cohort_id" not in df.columns or df["cohort_id"].n_unique() > 1:
        raise ValueError("Pareto comparison requires one explicit cohort")
    cohort = df.filter(pl.col("price_usd").is_not_null() & pl.col(weight).is_not_null())
    rows = cohort.to_dicts()
    flags = []
    for p in rows:
        dominated = any(
            q["price_usd"] <= p["price_usd"]
            and q[weight] <= p[weight]
            and (q["price_usd"] < p["price_usd"] or q[weight] < p[weight])
            for q in rows
        )
        flags.append(not dominated)
    return cohort.with_columns(pl.Series("pareto_efficient", flags, dtype=pl.Boolean))


def robust_summary(values):
    if not values:
        return {"n": 0, "iqr": None}
    return {"n": len(values), "iqr": float(iqr(values))}
