from pathlib import Path

from naturehike_intel.ingestion.products import load_products

_, products, sources = load_products(Path(__file__).resolve().parents[1] / "data/public/raw")
print(f"Validated {len(products)} observations and {len(sources)} sources")
