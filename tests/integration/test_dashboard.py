from pathlib import Path

import pytest
from streamlit.testing.v1 import AppTest

ROOT = Path(__file__).resolve().parents[2]


@pytest.mark.parametrize("page", sorted((ROOT / "app/views").glob("*.py")))
def test_each_page_renders(page):
    at = AppTest.from_file(str(page), default_timeout=30).run()
    assert not at.exception, str(at.exception)
    assert at.title


def test_navigation_renders():
    at = AppTest.from_file(str(ROOT / "app/streamlit_app.py"), default_timeout=30).run()
    assert not at.exception, str(at.exception)


def test_competitive_scope_changes_all_brand_rows_and_baseline():
    at = AppTest.from_file(
        str(ROOT / "app/views/02_Competitive_Landscape.py"), default_timeout=30
    ).run()
    at.multiselect[0].set_value(["naturehike"]).run()
    assert not at.exception
    controlled = at.dataframe[1].value
    assert set(controlled["brand_id"]) == {"naturehike"}
    assert controlled["listing_count"].sum() == 2
    at.checkbox[0].uncheck().run()
    assert len(at.dataframe[0].value) == 2
    assert at.dataframe[1].value["listing_count"].sum() == 2
    assert at.dataframe[1].value["naturehike_n"].sum() == 2
