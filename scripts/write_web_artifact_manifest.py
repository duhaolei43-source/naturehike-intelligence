import hashlib
import json
from pathlib import Path

from naturehike_intel.export.web_release import verify_web_release
from naturehike_intel.provenance.audit import sha256

root = Path(__file__).resolve().parents[1]
artifact = root / "web/out"
verify_web_release(root, artifact)
files = {
    str(p.relative_to(artifact)): sha256(p) for p in sorted(artifact.rglob("*")) if p.is_file()
}
data = {
    "schema_version": 1,
    "dataset_hash": json.loads((artifact / "data/manifest.json").read_text())["dataset_hash"],
    "artifact_hash": hashlib.sha256(json.dumps(files, sort_keys=True).encode()).hexdigest(),
    "files": files,
    "status": "LOCAL_STATIC_OUTPUT_NOT_DEPLOYED",
}
output = root / "outputs/public/web/artifact-manifest.json"
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(data, sort_keys=True, indent=2) + "\n")
print({"files": len(files), "artifact_hash": data["artifact_hash"]})
