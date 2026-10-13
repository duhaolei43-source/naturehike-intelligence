from pathlib import Path

from naturehike_intel.provenance.audit import audit_root, verify_events

root = Path(__file__).resolve().parents[2]
print("Audit chain verified:", verify_events(audit_root(root) / "events/ledger.jsonl"))
