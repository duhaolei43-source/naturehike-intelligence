import streamlit as st

st.set_page_config(page_title="Naturehike | Market Intelligence", page_icon="🌲", layout="wide")
st.sidebar.title("MARKET INTELLIGENCE")
st.sidebar.caption("U.S. · Two-person backpacking tents")
st.sidebar.info(
    "Independent case study. Not affiliated with, sponsored by, or endorsed by Naturehike."
)
st.sidebar.caption("Research pilot · Source-linked observations")
pages = [
    st.Page("views/01_Executive_Overview.py", title="Executive Overview", default=True),
    st.Page("views/02_Competitive_Landscape.py", title="Competitive Landscape"),
    st.Page("views/03_Product_Value_Analysis.py", title="Product Value Analysis"),
    st.Page("views/04_Consumer_Search_Demand.py", title="Consumer Search Demand"),
    st.Page("views/05_Marketing_Recommendations.py", title="Marketing Recommendations"),
    st.Page("views/06_Methodology_Data_Sources.py", title="Methodology & Data Sources"),
]
st.navigation(pages).run()
