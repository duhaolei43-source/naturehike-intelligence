import json
import subprocess
from pathlib import Path

from naturehike_intel.ingestion.products import load_products
from naturehike_intel.provenance.audit import sha256

PRIVATE_COMPONENTS = {
    ".audit",
    ".audit_private",
    "private",
    "ResearchVault",
    "raw_private",
    ".venv",
    "__pycache__",
}


def unsafe_path(path: str):
    parts = Path(path).parts
    return (
        bool(set(parts) & PRIVATE_COMPONENTS)
        or any(part.startswith(".env") and part != ".env.example" for part in parts)
        or path.endswith(
            (".duckdb", ".duckdb.wal", "secrets.toml", "localSettings.json", "cache.abf")
        )
    )


def verify_release(root: Path):
    tracked = subprocess.check_output(["git", "ls-files", "-z"], cwd=root).decode().split("\0")
    failures = [p for p in tracked if p and (unsafe_path(p) or (root / p).is_symlink())]
    if failures:
        raise ValueError(f"private or unsafe tracked paths: {failures}")
    _, _, sources = load_products(root / "data/public/raw")
    for s in sources:
        if s.public_use not in {"concise_facts_only", "authorized_export"}:
            raise ValueError("source lacks public-use review")
    manifest = json.loads((root / "data/public/processed/manifest.json").read_text())
    for name, expected in manifest["input_hashes"].items():
        if sha256(root / name) != expected:
            raise ValueError(f"stale input manifest: {name}")
    for name, expected in manifest["outputs"].items():
        if sha256(root / "data/public/processed" / name) != expected:
            raise ValueError(f"output hash mismatch: {name}")
    for path in (root / "data/public/processed").glob("*.parquet"):
        import polars as pl

        data = pl.read_parquet(path)
        if "is_test_data" in data.columns and data["is_test_data"].any():
            raise ValueError("synthetic data in public processed outputs")
    return {
        "tracked_files": len([p for p in tracked if p]),
        "source_records": len(sources),
        "status": "passed",
    }
