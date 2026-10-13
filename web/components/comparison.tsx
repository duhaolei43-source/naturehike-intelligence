"use client";
import { useAtlas } from "./atlas-provider";
import { products, brands, money, grams } from "@/lib/data";
import { DualWeight, Badge } from "./primitives";
import { Evidence } from "./evidence";
export function Comparison() {
  const { scope, update } = useAtlas();
  const rows = scope.compare.flatMap((id) =>
    products.find((p) => p.product_id === id)
      ? [products.find((p) => p.product_id === id)!]
      : [],
  );
  const mixed =
    rows.some((p) => !p.cohort_id) ||
    new Set(rows.map((p) => p.cohort_id)).size > 1;
  const fields = [
    ["price_usd", "Observed / USD"],
    ["minimum_weight_g", "Minimum / g"],
    ["packed_weight_g", "Packed / g"],
    ["floor_area_m2", "Floor / m²"],
    ["doors_count", "Doors"],
    ["footprint_included", "Footprint"],
    ["season_rating", "Season"],
    ["freestanding_status", "Structure"],
    ["construction", "Wall construction"],
    ["availability", "Availability"],
  ] as const;
  function move(index: number, direction: number) {
    const ids = [...scope.compare];
    [ids[index], ids[index + direction]] = [ids[index + direction], ids[index]];
    update({ compare: ids });
  }
  return (
    <>
      <section className="comparison-controls panel">
        <label htmlFor="add-product">Add a product (2–4 for comparison)</label>
        <select
          id="add-product"
          value=""
          disabled={rows.length >= 4}
          onChange={(e) => {
            if (e.target.value)
              update({ compare: [...scope.compare, e.target.value] });
          }}
        >
          <option value="">Choose a variant…</option>
          {products
            .filter((p) => !scope.compare.includes(p.product_id))
            .map((p) => (
              <option key={p.product_id} value={p.product_id}>
                {brands[p.brand_id]} / {p.product_name} / {p.product_variant}
              </option>
            ))}
        </select>
        <button onClick={() => update({ compare: [] })}>
          Reset comparison
        </button>
      </section>
      {rows.length < 2 ? (
        <section className="empty-state">
          <Badge tone="missing">Selection needed</Badge>
          <h2>Pin at least two variants.</h2>
          <p>
            Choose up to four products here or in the explorer. Your shortlist
            is separate from the analysis population.
          </p>
          <a href="/explore/">Browse all variants →</a>
        </section>
      ) : (
        <>
          <p
            className={`comparison-warning ${mixed ? "warning" : ""}`}
            role="status"
          >
            {mixed
              ? "Mixed or incomplete cohorts — controlled rankings and efficiency labels disabled. Raw facts can still be compared."
              : "Same complete cohort. Raw fact comparison only; no automatic overall quality ranking."}
          </p>
          <div
            className="table-scroll"
            tabIndex={0}
            aria-label="Scrollable comparison"
          >
            <table className="comparison-table">
              <caption>
                Variant-bound facts; not a composite value score. Unknown values
                are preserved.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Reported attribute</th>
                  {rows.map((p, i) => (
                    <th key={p.product_id} scope="col">
                      <span>{brands[p.brand_id]}</span>
                      <a href={`/products/${p.product_id}/`}>
                        {p.product_name}
                      </a>
                      <small>{p.product_variant}</small>
                      <div className="reorder">
                        <button
                          disabled={i === 0}
                          aria-label={`Move ${p.product_id} left`}
                          onClick={() => move(i, -1)}
                        >
                          ←
                        </button>
                        <button
                          disabled={i === rows.length - 1}
                          aria-label={`Move ${p.product_id} right`}
                          onClick={() => move(i, 1)}
                        >
                          →
                        </button>
                        <button
                          aria-label={`Remove ${p.product_id} from comparison`}
                          onClick={() =>
                            update({
                              compare: scope.compare.filter(
                                (id) => id !== p.product_id,
                              ),
                            })
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map(([key, label]) => (
                  <tr key={key}>
                    <th scope="row">{label}</th>
                    {rows.map((p) => (
                      <td key={p.product_id}>
                        {p[key] === null
                          ? "Not verified"
                          : key === "price_usd"
                            ? money(p.price_usd)
                            : key === "minimum_weight_g" ||
                                key === "packed_weight_g"
                              ? grams(p[key])
                              : key === "footprint_included"
                                ? p[key]
                                  ? "Included"
                                  : "Excluded"
                                : typeof p[key] === "number"
                                  ? Number(p[key]).toFixed(2)
                                  : String(p[key]).replaceAll("_", " ")}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <th scope="row">Evidence</th>
                  {rows.map((p) => (
                    <td key={p.product_id}>
                      <Evidence product={p} />
                      <details>
                        <summary>Missing reasons</summary>
                        {Object.entries(p.missing_reasons).map(([k, v]) => (
                          <p key={k}>
                            {k}: {v}
                          </p>
                        ))}
                      </details>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="two-column">
            {rows.map((p) => (
              <DualWeight key={p.product_id} product={p} />
            ))}
          </div>
        </>
      )}
      <p className="note">
        Different reported minimum components can limit cross-brand weight
        equivalence. Price excludes tax, shipping and optional accessories.
        Reorder using the arrow buttons; share the current URL to restore your
        selection.
      </p>
    </>
  );
}
