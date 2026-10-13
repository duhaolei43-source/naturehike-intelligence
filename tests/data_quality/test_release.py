import json
import subprocess
from pathlib import Path

import pytest

from naturehike_intel.export.release import unsafe_path, verify_release

ROOT = Path(__file__).resolve().parents[2]


@pytest.mark.parametrize(
    "path",
    [
        "private/evidence.json",
        "ResearchVault/events.jsonl",
        "data/raw_private/x.csv",
        ".env",
        ".env.production",
        "data/public/processed/x.duckdb",
        ".streamlit/secrets.toml",
        "model/.pbi/cache.abf",
    ],
)
def test_private_path_detection(path):
    assert unsafe_path(path)


def test_allowed_public_paths():
    for path in [
        "docs/METHODOLOGY.md",
        "data/public/fixtures/trends_test.csv",
        ".env.example",
        "outputs/public/charts/overview.png",
    ]:
        assert not unsafe_path(path)


def test_guard_reads_tracked_git_paths(tmp_path):
    subprocess.run(["git", "init", "-q", str(tmp_path)], check=True)
    (tmp_path / "private").mkdir()
    (tmp_path / "private/secret.json").write_text("{}")
    subprocess.run(["git", "add", "private/secret.json"], cwd=tmp_path, check=True)
    with pytest.raises(ValueError, match="unsafe tracked"):
        verify_release(tmp_path)


def test_no_synthetic_public_observations():
    products = json.loads((ROOT / "data/public/raw/products.json").read_text())
    assert all(not p["is_test_data"] for p in products)
    assert len({p["product_id"] for p in products}) == 30
