from pathlib import Path

from naturehike_intel.transformation.pipeline import build

build(Path(__file__).resolve().parents[1])
