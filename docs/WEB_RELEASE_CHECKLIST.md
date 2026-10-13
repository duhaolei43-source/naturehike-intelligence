# Static web release and rollback

## Build and verify

From repository root:
```sh
uv sync --locked
uv run python scripts/build_data.py
uv run python scripts/export_web.py
uv run ruff check .
uv run ruff format --check .
uv run sqlfluff lint sql powerbi/model_spec/reference_queries.sql
uv run python scripts/validate_data.py
uv run pytest -q
uv run python scripts/reproducibility_smoke.py
uv run python scripts/verify_release.py
cd web
npm ci
npm run typecheck
npm run lint
npm test
NEXT_TELEMETRY_DISABLED=1 npm run build
npx playwright install chromium webkit firefox
npm run test:e2e
npm audit
cd ..
uv run python scripts/verify_web_release.py --artifact web/out
gitleaks git --redact .
gitleaks dir --redact web/out
```

Node version is pinned in `web/.nvmrc`; use Node24 with npm10.9.2. No ResearchVault is needed for reproduction. CI records process events to an external temporary location only and uploads no private audit artifacts.

## Local preview
`python3 -m http.server 8510 --bind 127.0.0.1 --directory web/out`. This serves the reviewed static production output. It is a local preview, not a public deployment. Use a root-mounted static host supporting directory index routes; trailingSlash=true emits product/index.html. No server application is needed. Do not upload the repository root or `.next/`.

## Hosting readiness
`web/hosting.json` declares the portable artifact directory and route convention without registering a provider. Before an authorized public release, rebuild from the reviewed commit, verify dataset hash and exact output, scan for secrets/private content/symlinks/maps/unexpected data, review licensing, and verify CI on the exact commit. Record host, audience, real URL, deployment ID, commit, dataset hash and browser smoke results after deployment. There is no production URL in this release.

## Rollback
Retain a reviewed artifact externally with its output SHA manifest. If a release must be rolled back, select the previous approved immutable commit, rebuild locked inputs, verify the same dataset/artifact checks, and redeploy that artifact through the chosen host's supported version rollback. Do not reset branches or force push. A revert PR handles source changes. Hosting permissions and publication approval remain separate from a GitHub implementation PR.

## Honest constraints
No genuine Trends export; 3 prices unbound; 4 packed weights, 6 areas and 9 cohorts incomplete. Proposed experiments have no outcomes. Power BI runtime remains UNVERIFIED. CSS zoom and automated axe are bounded checks, not a full accessibility certification. Local LCP/CLS measures do not establish performance on a deployed slow mobile network.
