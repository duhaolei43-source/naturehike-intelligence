# Reviewed toolchain sources

Selection date: 2026-10-13. Exact versions and integrity hashes are in `web/package-lock.json`; npm 10.9.2 / Node 24.21.0 LTS is the documented environment. Local Node 23 was not used for final frontend checks. Python remains uv 0.10.12 / 3.12.6 with `uv.lock`.

| Choice | Reviewed source | Decision |
|---|---|---|
| Next 16.4.0 / React 19.3.0 | [static exports](https://nextjs.org/docs/app/guides/static-exports), [React security](https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components), package-bundled Next guides | Static export, generated product routes, no server actions/API or RSC runtime endpoint |
| Tailwind 4.3.3 | [theme guide](https://tailwindcss.com/docs/theme) | Tokens plus domain CSS; no second styling system |
| shadcn/ui Dialog / Radix 1.3.1 | [manual installation](https://ui.shadcn.com/docs/installation/manual), [Dialog](https://ui.shadcn.com/docs/components/radix/dialog) | One Radix base, copied official registry source; retrieval/hash in SHADCN_REGISTRY_REVIEW.json; license retained |
| TanStack Table 8.21.3 | [maintainer docs](https://tanstack.com/table/v8/docs/guide/introduction) | Supported v8 API; latest v9 not required to implement 30 rows |
| ECharts 6.1.0 | [SVG comparison](https://echarts.apache.org/handbook/en/best-practices/canvas-vs-svg/), installed BrushView/BrushModel source | SVG scatter with click/brush, loaded only on request. Successful real-data slice; retained as web engine. Existing offline Plotly outputs remain separate and are not loaded by this site |
| Zod 4.6.7 | [official JSON Schema docs](https://zod.dev/json-schema) | Strict typed web boundary and generated public schema |
| Playwright 1.64.0 / axe 4.13.0 | [accessibility testing](https://playwright.dev/docs/accessibility-testing) | Exported production pages, all three engines; serious/critical failures block |
| Vitest 5.0.4 / ESLint 10.12.0 | npm registry and advisory metadata | Initial Vitest4 selection was vulnerable; upgraded. Next lint glob chain had an unpatched braces advisory, so explicit TS/React-hook lint replaced eslint-config-next. Final npm audit must pass |

The installed Sites skill was read for presentation-led local development and preview guidance; no Sites identity, account, source sync or deployment was created. Repository domain skills were applied. The pinned shadcn skill at SHA `30a58d4498f270af1c1e981a7d78a15cf5740841` was inspected as a reference, not adopted/installed as an agent workflow. No generic skill bundle or remote scripts were installed. No “SOTA” benchmark claim is made.

One package manager and lockfile are used. npm audit is a known-advisory check, not proof of total security. Browser engines are installed through the official Playwright distribution. Hosting-only output is static, source maps disabled. Production publishing requires explicit user authorization.
