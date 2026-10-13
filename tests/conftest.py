import json
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]


@pytest.fixture
def product():
    return json.loads((ROOT / "data/public/raw/products.json").read_text())[0]


@pytest.fixture
def raw_copy(tmp_path):
    folder = tmp_path / "raw"
    folder.mkdir()
    for name in ["products.json", "sources.json"]:
        (folder / name).write_bytes((ROOT / "data/public/raw" / name).read_bytes())
    return folder
