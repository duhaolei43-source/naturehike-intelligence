# Reproduce the project

Python 3.12; uv.lock pins the Python packages. No private credentials or archive access are needed for the offline build.

```bash
uv sync --locked
uv run ruff check .
uv run ruff format --check .
uv run sqlfluff lint sql
uv run pytest -q
uv run python scripts/validate_data.py
uv run python scripts/build_data.py
uv run python scripts/reproducibility_smoke.py
uv run python scripts/verify_release.py
uv run streamlit run app/streamlit_app.py
```

Run from the repository root. The CLI also accepts `naturehike-intel build --root <clone-directory>`. Dataset version: 2026-10-13-v1. Public raw inputs and field evidence are in data/public/raw; sources.json is the source registry. Analytical definitions are in docs/METHODOLOGY.md and sql/. CSV and Parquet exports plus an input/output SHA-256 manifest are in data/public/processed/. A local ignored market.duckdb contains materialized dimensions, facts and marts.

Builds are offline. The reproducibility smoke performs two isolated builds and compares every public export hash and the manifest. Private audit timestamps and local database bytes are not published analytical outputs. Tests use temporary synthetic data; public build rejects TEST DATA. Live collection never runs in CI.

Reports are reviewed separately from builds; CI does not generate new marketing claims. Rebuild after code/raw/config changes to prevent stale exports. Chart artifacts are generated separately by scripts/build_charts.py. Gitleaks must be available for pre-commit and release scanning; CI installs its pinned version independently.

Local execution records default to ~/Documents/ResearchVault/naturehike-us-market-intelligence or AUDIT_ROOT. The archive must resolve outside the clone, including symlink resolution. Permissions are 0700 for folders and 0600 for private files. Audit records are append-only JSONL with canonical sorted-key compact UTF-8 JSON SHA-256 chaining. No tokens or arbitrary environment values are logged. `uv run python scripts/audit/verify_chain.py` validates the chain. `uv run python scripts/audit/backup.py` creates an AES-256-GCM encrypted archive using a prompted passphrase and Scrypt derivation; it never stores the passphrase. The owner must retain the passphrase and place copies on separate secure storage. The tool supports encrypted backups; no production backup is claimed before it is performed.

Dashboard views live in app/views and are registered by the single app entry point; using the automatic pages folder could bypass the shared navigation on a cold deep link. Restart Streamlit after changing installed helper modules during development.
