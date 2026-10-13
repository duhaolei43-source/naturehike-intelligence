import argparse
from pathlib import Path

from naturehike_intel.export.web_release import verify_web_release

parser = argparse.ArgumentParser()
parser.add_argument("--artifact", type=Path)
args = parser.parse_args()
print(verify_web_release(Path(__file__).resolve().parents[1], args.artifact))
