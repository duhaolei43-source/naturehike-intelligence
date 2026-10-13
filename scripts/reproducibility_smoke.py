import tempfile
from pathlib import Path

from naturehike_intel.transformation.pipeline import build

root = Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory() as temporary:
    a = build(root, Path(temporary) / "first", audit=False)
    b = build(root, Path(temporary) / "second", audit=False)
    if a != b:
        raise RuntimeError("offline outputs are not reproducible")
print("Two isolated offline builds produced identical manifests and export hashes.")
