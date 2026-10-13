# Public web QA report

Scope: exported production site at dataset 2026-10-13-v1. This is a local implementation and review artifact, not a public deployment or an external usability study.

| Gate | Observed result |
|---|---|
| Existing Python checks | Locked install, Ruff lint/format, SQLFluff, typed data validation passed; 48 tests passed |
| Offline reproduction | Two isolated Python builds produced identical manifests and CSV/Parquet hashes; separate web export determinism test passed |
| Frontend | TypeScript, ESLint/React hooks, 12 Vitest parity/state/boundary cases passed; Next static export produced all 30 dossiers and all nine top-level routes |
| Browser production cases | 25 passed, 2 skipped. Seven original core flow cases plus touch case on Chromium, WebKit, Firefox; responsive screenshot suite only on Chromium |
| Accessibility | All nine route families and open evidence drawer had zero serious/critical axe findings on tested desktop states; focus trapping, Escape and focus return tested |
| Layout | 360, 390, 768, 1440px; 200% CSS-zoom proxy; keyboard/table alternatives, touch and reduced-motion state checked. No document-level horizontal overflow in tested states |
| Visual evidence | Actual screenshots: nine route families at four widths, all 30 dossiers, selected chart/table, source drawer, empty scope and zoom state. Reviewed representative full-size and contact-sheet layouts |
| Release boundary | Reviewed allowlisted JSON, original SVG/font rights, no source maps/private paths/symlinks/fixtures; exact static output scan and Gitleaks passed |
| Dependency audit | npm audit: 0 known vulnerabilities at verification. Original reported advisories were corrected before release |

## Local performance measurements

Cold Chromium contexts at 390x844, macOS, local unthrottled HTTP, charts not loaded initially. Compressed JS sums gzip bytes of actually requested first-party chunks; this is not a CDN transfer measurement.

- `/`: initial JS 202,669 bytes gzip; LCP 76 ms; CLS 0.000596.
- `/explore/`: initial JS 223,586 bytes gzip; LCP 48 ms; CLS 0.001886.

The homepage <=250KB and analysis <=500KB proposed initial JS budgets passed in this setup. Local LCP/CLS are below the proposed targets here; slow-network/public-host performance is unverified. The engine chunk loads only after the chart action. This is not a claim of real-user Core Web Vitals.

## Failures retained and corrected

1. Initial npm dependencies reported seven advisories; upgraded Vitest/ESLint and removed the unpatched Next lint glob chain. No forced downgrade/security waiver was used.
2. Initial state inference created never[]; explicit Scope typing fixed typecheck. The ECharts `use` import was aliased to avoid React-hook lint misclassification.
3. Initial browser run: 12 passed / 10 failed / 2 skipped. Proposed teal/amber failed contrast; shades were darkened. Brush initialization emitted selection events and caused rerender resets; only completed user brushes now update selection.
4. Second browser run: 16 passed / 6 failed / 2 skipped. Tests assumed three complete Naturehike and two REI offers; canonical data contain two and three respectively. SVG title multi-child text caused hydration mismatch; a single string fixed it, without suppressing warnings.
5. Python regression initially expected incomplete Mongar in the controlled cohort; corrected the data-aware assertion and tested offer table sale removal independently.
6. A stale hosting-data copy was rejected after export regeneration; rebuilding the static artifact resolved it. A performance-observer initialization issue was fixed before reporting LCP/CLS.

Private run records retain original failures. Public prose reports concise outcomes only, with no machine paths/transcripts/captures. This report does not claim exhaustive WCAG, customer research, supported Power BI runtime, real demand, public hosting or realized business impact.
