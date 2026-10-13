import { describe, it, expect } from "vitest";
import { products } from "../lib/data";
import {
  analyze,
  initial,
  restore,
  serialize,
  safeCsv,
  type Scope,
} from "../lib/analysis";
import { productsSchema } from "../lib/schema";
import vectors from "../public/data/parity-vectors.json";
import findings from "../public/data/findings.json";
describe("Canonical Python / DuckDB parity", () => {
  for (const vector of vectors)
    it(vector.scope.name, () => {
      const actual = analyze(products, {
        ...initial,
        ...vector.scope,
      } as Scope);
      const { rows, ...summary } = actual;
      void rows;
      expect(summary).toEqual(vector.expected);
    });
  it("claim arithmetic", () => {
    const p = Object.fromEntries(products.map((p) => [p.product_id, p]));
    expect(findings[0].metrics.minimum_difference_g).toBe(
      p["nh-cloud-up-20d"].minimum_weight_g! -
        p["nh-cloud-up-pro-standard"].minimum_weight_g!,
    );
    expect(findings[0].metrics.packed_difference_g).toBe(270);
    expect(findings[1].metrics.price_difference_usd).toBe(
      p["rei-half-dome-2"].price_usd! - p["rei-trailmade-2"].price_usd!,
    );
  });
  it("ties survive; singleton cannot get efficiency labels", () => {
    const p = products.find((p) => p.product_id === "nh-cloud-up-20d")!;
    const scope = { ...initial, cohort: p.cohort_id! };
    expect(analyze([p, { ...p, product_id: "tied" }], scope).frontier).toEqual([
      "nh-cloud-up-20d",
      "tied",
    ]);
    expect(analyze([p], scope).frontier).toBeNull();
    expect(
      analyze([{ ...p, packed_weight_g: null }], {
        ...scope,
        weight: "packed_weight_g",
      }).missing_weight,
    ).toBe(1);
  });
  it("typed numbers, fixture isolation and missing prices", () => {
    expect(products.filter((p) => p.price_usd === null)).toHaveLength(3);
    expect(() =>
      productsSchema.parse([{ ...products[0], price_usd: Infinity }]),
    ).toThrow();
    expect(() =>
      productsSchema.parse([{ ...products[0], price_usd: "119" }]),
    ).toThrow();
    expect(() =>
      productsSchema.parse([{ ...products[0], is_test_data: true }]),
    ).toThrow();
  });
});
describe("State and exports", () => {
  it("round-trips filter/selection/compare state", () => {
    const scope: Scope = {
      ...initial,
      brands: ["rei", "naturehike"],
      cohort: products[0].cohort_id!,
      weight: "packed_weight_g",
      price_types: ["sale"],
      min: 10,
      max: 400,
      selected: [products[0].product_id],
      compare: [products[0].product_id, products[1].product_id],
      view: "cards",
    };
    expect(restore(serialize(scope), products).scope).toEqual(scope);
  });
  it("invalid URL values reset with notice", () => {
    const r = restore(
      "?weight=bogus&selected=secret&min=NaN&max=Infinity&brands=bad&cohort=unknown",
      products,
    );
    expect(r.notice).toBeTruthy();
    expect(r.scope).toEqual(initial);
    expect(restore("?min=400&max=10", products).scope.min).toBeNull();
    expect(restore("?dataset=old", products).notice).toContain(
      "version changed",
    );
  });
  it("CSV formula guard preserves numeric negatives", () => {
    expect(safeCsv('=HYPERLINK("x")')).toBe('"\'=HYPERLINK(""x"")"');
    expect(safeCsv(" \t+SUM(1)")).toContain("'");
    expect(safeCsv(-20)).toBe('"-20"');
    expect(safeCsv(null)).toBe('""');
  });
});
