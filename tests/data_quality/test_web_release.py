import json
from pathlib import Path

import pytest

from naturehike_intel.export.web import export_web
from naturehike_intel.export.web_release import inspect_public_file, verify_web_release

ROOT = Path(__file__).resolve().parents[2]


def test_deterministic_web_export(tmp_path):
    a = export_web(ROOT, tmp_path / "a")
    b = export_web(ROOT, tmp_path / "b")
    assert a == b
    assert a["rows"] == {"products": 30, "sources": 30, "priced": 27}
    rows = json.loads((tmp_path / "a/products.json").read_text())
    assert sum(p["packed_weight_g"] is None for p in rows) == 4
    assert sum(p["floor_area_m2"] is None for p in rows) == 6
    assert sum(p["cohort_id"] is None for p in rows) == 9


def test_web_public_inputs():
    assert verify_web_release(ROOT)["status"] == "passed"


@pytest.mark.parametrize(
    "content",
    [
        '{"is_test_data":true}',
        '{"path":"/Users/owner/private/capture"}',
        '{"price":NaN}',
        '{"path":"ResearchVault/capture"}',
    ],
)
def test_public_artifact_rejects_private_fixture_and_nonfinite(tmp_path, content):
    path = tmp_path / "leak.json"
    path.write_text(content)
    with pytest.raises(ValueError):
        inspect_public_file(path)


def test_unexpected_file_and_symlink_rejected(tmp_path):
    source = tmp_path / "x.json"
    source.write_text("{}")
    link = tmp_path / "link.json"
    link.symlink_to(source)
    with pytest.raises(ValueError, match="symlink"):
        inspect_public_file(link)
    path = tmp_path / "capture.map"
    path.write_text("{}")
    with pytest.raises(ValueError, match="type"):
        inspect_public_file(path)
