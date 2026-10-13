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
