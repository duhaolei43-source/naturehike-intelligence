import streamlit as st

from naturehike_intel.dashboard import ROOT, header, manifest, table

header(
    "Independent research · Executive brief",
    "An evidence-led view of the backpacking tent market",
    "**How can Naturehike strengthen its U.S. positioning?** Compare documented product offers, expose important trade-offs, and turn observations into testable marketing hypotheses.",
)
quality = table("mart_data_quality").row(0, named=True)
a, b, c, d = st.columns(4)
a.metric("Observed variants", quality["product_count"])
b.metric("Brands", quality["brand_count"])
c.metric("Verified source records", quality["verified_count"])
d.metric("Real search-demand batches", table("fact_search_interest")["batch_id"].n_unique())
st.caption(
    f"Latest data observation: {quality['latest_observation_utc']} · Dataset {manifest()['dataset_version']}"
)
st.divider()
st.subheader("What the data supports")
st.markdown((ROOT / "docs/EXECUTIVE_FINDINGS.md").read_text())
st.warning(
    "Convenience sample: 30 source-verified specification records; 27 verified display prices. Missing option prices remain null. Prices and manufacturer claims are observations, not transaction data or independent performance tests. Google Trends analysis is incomplete. Power BI: UNVERIFIED."
)
st.subheader("Research questions")
st.markdown(
    "1. **Positioning:** What do price, declared weight and included features reveal within comparable cohorts?\n2. **Demand:** How does U.S. search interest vary within documented Trends batches?\n3. **Growth:** Which evidence-linked messaging experiments should be tested next?"
)
