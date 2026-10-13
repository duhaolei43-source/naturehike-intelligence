from pathlib import Path

from naturehike_intel.export.release import verify_release

print(verify_release(Path(__file__).resolve().parents[1]))
