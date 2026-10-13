import argparse
import json
from pathlib import Path

from naturehike_intel.ingestion.products import load_products
from naturehike_intel.transformation.pipeline import build


def main():
    parser = argparse.ArgumentParser(description="Reproducible independent market intelligence")
    parser.add_argument("command", choices=["build", "validate"])
    parser.add_argument("--root", type=Path, default=Path.cwd())
    args = parser.parse_args()
    if args.command == "build":
        print(json.dumps(build(args.root)["rows"], indent=2))
    else:
        _, products, sources = load_products(args.root / "data/public/raw")
        print(f"Validated {len(products)} observations and {len(sources)} sources")
