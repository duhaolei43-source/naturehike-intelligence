from pathlib import Path

from naturehike_intel.transformation.pipeline import build

manifest = build(Path(__file__).resolve().parents[1])
print("Validated CSV/Parquet exports ready; Power BI model remains UNVERIFIED.")
