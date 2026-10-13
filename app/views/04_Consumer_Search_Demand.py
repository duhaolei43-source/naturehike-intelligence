import plotly.express as px
import polars as pl
import streamlit as st

from naturehike_intel.dashboard import header, table

header(
    "RQ2 · Consumer search demand",
    "A relative signal, with a defined scope",
    "Google Trends measures normalized interest. It does not report search counts, sales, revenue or market share.",
)
data = table("mart_search_demand")
if data.is_empty():
    st.warning(
        "INCOMPLETE — No real Google Trends CSV exports have been supplied. The adapter and tests work; no synthetic trend is displayed or used in recommendations."
    )
    st.markdown(
        "Export a U.S. time series from Google Trends, keep the comparison terms in one batch, and document geography, dates, category, search type, term/topic semantics and export UTC timestamp. See docs/GOOGLE_TRENDS.md for the import contract."
    )
else:
    batch = st.selectbox("Normalization batch", sorted(data["batch_id"].unique().to_list()))
    selected = data.filter(pl.col("batch_id") == batch)
    terms = st.multiselect(
        "Terms in this batch",
        selected["term"].unique().to_list(),
        default=selected["term"].unique().to_list(),
    )
    selected = selected.filter(pl.col("term").is_in(terms))
    if selected.height:
        fig = px.line(
            selected.to_dicts(),
            x="date",
            y="interest_index",
            color="term",
            markers=True,
            title="U.S. relative search interest — selected joint comparison batch",
            labels={
                "date": "Observation period start",
                "interest_index": "Interest index (0–100)",
                "term": "Search term / topic",
            },
        )
        fig.update_yaxes(range=[0, 100])
        st.plotly_chart(fig, width="stretch")
        st.caption(
            f"Period: {selected['date'].min()} to {selected['period_end'].max()}. Batch: {batch}. Source: Google Trends; metadata in raw inputs. <1 remains censored/null, not zero."
        )
        st.dataframe(selected, hide_index=True)
    st.info(
        "Only within-batch comparison is supported. Seasonality requires repeated calendar cycles and consistent sampling; a short export is not sufficient evidence of seasonality."
    )
