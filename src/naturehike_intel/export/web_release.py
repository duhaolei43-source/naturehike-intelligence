"""Check the exact public JSON and optional static hosting directory."""

import json
import re
from pathlib import Path

from naturehike_intel.provenance.audit import sha256

PUBLIC_JSON = {
    "products.json",
    "sources.json",
    "offers.json",
    "cohorts.json",
    "findings.json",
    "demand.json",
    "media.json",
    "manifest.json",
    "boundary.schema.json",
    "parity-vectors.json",
    "exclusions.json",
    "web.schema.json",
}
PRIVATE_TEXT = re.compile(
    r"/Users/|/home/[^ /]+/|ResearchVault|\.nhvault|BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY|github_pat_[A-Za-z0-9_]+|ghp_[A-Za-z0-9]+"
)
ALLOWED_SUFFIXES = {".html", ".txt", ".json", ".js", ".css", ".svg", ".woff2", ".ico"}


def inspect_public_file(path):
    if path.is_symlink():
        raise ValueError("public symlink rejected")
    if path.suffix not in ALLOWED_SUFFIXES:
        raise ValueError("disallowed public asset type")
    if path.suffix not in {".woff2", ".ico"}:
        content = path.read_text()
        if PRIVATE_TEXT.search(content):
            raise ValueError("private content in public artifact")
        if re.search(r'"is_test_data"\s*:\s*true', content, re.IGNORECASE):
            raise ValueError("TEST DATA in public artifact")
        if path.suffix == ".json":
            json.loads(
                content,
                parse_constant=lambda _: (_ for _ in ()).throw(
                    ValueError("non-finite public JSON")
                ),
            )


def verify_web_release(root: Path, artifact: Path | None = None):
    data = root / "web/public/data"
    names = {p.name for p in data.iterdir()}
    if names != PUBLIC_JSON:
        raise ValueError("unexpected or missing public JSON files")
    manifest = json.loads((data / "manifest.json").read_text())
    for name, expected in manifest["input_hashes"].items():
        if sha256(root / name) != expected:
            raise ValueError("stale web input manifest")
    for name, expected in manifest["output_hashes"].items():
        if sha256(data / name) != expected:
            raise ValueError("web output hash mismatch")
    products = json.loads((data / "products.json").read_text())
    if (
        len(products) != 30
        or len({p["brand_id"] for p in products}) != 9
        or sum(p["price_usd"] is None for p in products) != 3
    ):
        raise ValueError("unexpected reviewed pilot coverage")
    for p in products:
        if p.get("is_test_data") or p["verification_status"] != "verified":
            raise ValueError("unreviewed public product")
    files = list((root / "web/public").rglob("*"))
    if artifact:
        if not (artifact / "index.html").exists():
            raise ValueError("static build missing")
        for name in PUBLIC_JSON:
            if sha256(artifact / "data" / name) != sha256(data / name):
                raise ValueError("stale hosting data copy")
        for p in products:
            if not (artifact / "products" / p["product_id"] / "index.html").exists():
                raise ValueError("product route missing")
        files += list(artifact.rglob("*"))
    count = 0
    for path in files:
        if path.is_file() or path.is_symlink():
            inspect_public_file(path)
            count += 1
    return {"status": "passed", "checked_public_files": count, "hosting_artifact": bool(artifact)}
