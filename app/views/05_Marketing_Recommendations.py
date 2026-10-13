import streamlit as st

from naturehike_intel.dashboard import ROOT, header

header(
    "RQ3 · Proposed growth experiments",
    "Translate evidence into measurable hypotheses",
    "All initiatives below are proposed and NOT EXECUTED. No uplift, conversion performance or acquisition cost has been observed.",
)
st.markdown((ROOT / "docs/MARKETING_STRATEGY.md").read_text())
