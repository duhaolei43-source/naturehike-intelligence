from pathlib import Path

from naturehike_intel.export.web import export_web
from naturehike_intel.provenance.audit import record_event

root = Path(__file__).resolve().parents[1]
manifest = export_web(root)
record_event(
    root,
    stage="web-export",
    action="Deterministic allowlisted public export",
    status="success",
    input_hashes=manifest["input_hashes"],
    output_hashes=manifest["output_hashes"],
)
print({"rows": manifest["rows"], "dataset_hash": manifest["dataset_hash"]})
