import type { Product } from "./schema";
export type Weight = "minimum_weight_g" | "packed_weight_g";
export type Scope = {
  dataset: string;
  brands: string[];
  cohort: string;
  price_types: string[];
  availability: string[];
  weight: Weight;
  min: number | null;
  max: number | null;
  selected: string[];
  compare: string[];
  view: "table" | "cards";
};
export const DATASET = "2026-10-13-v1";
export const initial: Scope = {
  dataset: DATASET,
  brands: [],
  cohort: "all",
  price_types: [],
  availability: [],
  weight: "minimum_weight_g",
  min: null,
  max: null,
  selected: [],
  compare: [],
  view: "table",
};
export function filterProducts(
  all: Product[],
  scope: Scope,
  ignoreBrands = false,
) {
  return all.filter(
    (p) =>
      (ignoreBrands ||
        !scope.brands.length ||
        scope.brands.includes(p.brand_id)) &&
      (scope.cohort === "all" || p.cohort_id === scope.cohort) &&
      (!scope.price_types.length || scope.price_types.includes(p.price_type)) &&
      (!scope.availability.length ||
        scope.availability.includes(p.availability)) &&
      (scope.min === null ||
        (p.price_usd !== null && p.price_usd >= scope.min)) &&
      (scope.max === null ||
        (p.price_usd !== null && p.price_usd <= scope.max)),
  );
}
export function median(values: number[]) {
  if (!values.length) return null;
  const a = [...values].sort((a, b) => a - b),
    n = a.length;
  return n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2;
}
export function analyze(all: Product[], scope: Scope) {
  const rows = filterProducts(all, scope),
    prices = rows.flatMap((p) => (p.price_usd === null ? [] : [p.price_usd]));
  const baseline =
    scope.cohort === "all"
      ? []
      : filterProducts(all, scope, true).filter(
          (p) => p.brand_id === "naturehike" && p.price_usd !== null,
        );
  const m = median(prices),
    b = median(baseline.map((p) => p.price_usd!));
  const eligible = rows.filter(
    (p) => p.price_usd !== null && p[scope.weight] !== null,
  );
  const frontier =
    scope.cohort === "all" || eligible.length < 2
      ? null
      : eligible
          .filter(
            (p) =>
              !eligible.some(
                (q) =>
                  q.price_usd! <= p.price_usd! &&
                  q[scope.weight]! <= p[scope.weight]! &&
                  (q.price_usd! < p.price_usd! ||
                    q[scope.weight]! < p[scope.weight]!),
              ),
          )
          .map((p) => p.product_id)
          .sort();
  return {
    rows,
    count: rows.length,
    priced: prices.length,
    median: m,
    baseline: b,
    baseline_n: baseline.length,
    gap: m === null || b === null ? null : m - b,
    missing_weight: rows.filter((p) => p[scope.weight] === null).length,
    frontier,
  };
}
export function restore(
  query: string,
  all: Product[],
): { scope: Scope; notice: string } {
  const q = new URLSearchParams(query),
    scope: Scope = {
      ...initial,
      brands: [],
      price_types: [],
      availability: [],
      selected: [],
      compare: [],
    };
  let bad = false;
  const known = new Set(all.map((p) => p.product_id));
  for (const key of [
    "brands",
    "price_types",
    "availability",
    "selected",
    "compare",
  ] as const) {
    const input = q.get(key);
    if (input !== null) {
      const allowed =
        key === "brands"
          ? new Set(all.map((p) => p.brand_id))
          : key === "price_types"
            ? new Set(all.map((p) => p.price_type))
            : key === "availability"
              ? new Set(all.map((p) => p.availability))
              : known;
      const a = [...new Set(input.split(",").filter(Boolean))];
      scope[key] = a.filter((v) => allowed.has(v));
      if (scope[key].length !== a.length) bad = true;
    }
  }
  if (scope.compare.length > 4) {
    scope.compare = scope.compare.slice(0, 4);
    bad = true;
  }
  const c = q.get("cohort");
  if (c) {
    if (c === "all" || all.some((p) => p.cohort_id === c)) scope.cohort = c;
    else bad = true;
  }
  const w = q.get("weight");
  if (w) {
    if (w === "minimum_weight_g" || w === "packed_weight_g") scope.weight = w;
    else bad = true;
  }
  for (const key of ["min", "max"] as const) {
    const v = q.get(key);
    if (v !== null) {
      if (v.trim() !== "" && Number.isFinite(Number(v)) && Number(v) >= 0)
        scope[key] = Number(v);
      else bad = true;
    }
  }
  if (scope.min !== null && scope.max !== null && scope.min > scope.max) {
    scope.min = null;
    scope.max = null;
    bad = true;
  }
  const view = q.get("view");
  if (view) {
    if (view === "cards" || view === "table") scope.view = view;
    else bad = true;
  }
  if (q.get("dataset") && q.get("dataset") !== DATASET) {
    return {
      scope: { ...initial },
      notice: "Dataset version changed. Filters reset to the reviewed dataset.",
    };
  }
  const keys = new Set([
    "dataset",
    "brands",
    "cohort",
    "price_types",
    "availability",
    "weight",
    "min",
    "max",
    "selected",
    "compare",
    "view",
  ]);
  if ([...q.keys()].some((k) => !keys.has(k))) bad = true;
  return {
    scope,
    notice: bad
      ? "Some unrecognized or invalid URL values were reset. Review the active scope."
      : "",
  };
}
export function serialize(scope: Scope) {
  const q = new URLSearchParams();
  q.set("dataset", DATASET);
  for (const key of [
    "brands",
    "price_types",
    "availability",
    "selected",
    "compare",
  ] as const)
    if (scope[key].length) q.set(key, scope[key].join(","));
  if (scope.cohort !== "all") q.set("cohort", scope.cohort);
  if (scope.weight !== initial.weight) q.set("weight", scope.weight);
  if (scope.min !== null) q.set("min", String(scope.min));
  if (scope.max !== null) q.set("max", String(scope.max));
  if (scope.view !== "table") q.set("view", scope.view);
  return "?" + q.toString();
}
export function safeCsv(value: unknown) {
  const s = value === null || value === undefined ? "" : String(value),
    safe = typeof value === "string" && /^[\s]*[=+@-]/.test(s) ? "'" + s : s;
  return '"' + safe.replaceAll('"', '""') + '"';
}
export function exportCsv(rows: Product[], scope: Scope) {
  const keys = [
    "product_id",
    "product_name",
    "product_variant",
    "brand_id",
    "price_usd",
    "price_type",
    scope.weight,
    "floor_area_m2",
    "footprint_included",
    "cohort_id",
    "source_id",
    "product_url",
    "price_observed_at_utc",
    "missing_reasons",
  ] as (keyof Product)[];
  return [
    keys.join(","),
    ...rows.map((p) =>
      keys
        .map((k) =>
          safeCsv(k === "missing_reasons" ? JSON.stringify(p[k]) : p[k]),
        )
        .join(","),
    ),
  ].join("\r\n");
}
