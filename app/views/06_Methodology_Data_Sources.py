import json

import streamlit as st

from naturehike_intel.dashboard import ROOT, header, manifest, table

header(
    "Methodology · Auditability",
    "Every observation has a source and a boundary",
    "Individual official pages were reviewed and reduced to concise factual records. No consumer reviews, copyrighted full pages or internal business data are published.",
)
st.markdown((ROOT / "docs/METHODOLOGY.md").read_text())
st.subheader("Source registry")
st.dataframe(
    table("dim_source"),
    hide_index=True,
    column_config={"url": st.column_config.LinkColumn("Original source")},
)
st.subheader("Missing fields and exclusions")
raw = json.loads((ROOT / "data/public/raw/products.json").read_text())
st.dataframe(
    [
        {
            "product_id": p["product_id"],
            "missing_reasons": str(p["missing_reasons"]),
            "notes": p["notes"],
        }
        for p in raw
    ],
    hide_index=True,
)
st.dataframe(json.loads((ROOT / "data/public/raw/exclusions.json").read_text()), hide_index=True)
st.subheader("Reproduction")
st.code(
    "uv sync --locked\nuv run python scripts/validate_data.py\nuv run python scripts/build_data.py\nuv run pytest -q\nuv run streamlit run app/streamlit_app.py",
    language="bash",
)
with st.expander("Public dataset manifest"):
    st.json(manifest())
