"use client";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  products,
  brands,
  money,
  grams,
  cohortLabel,
  manifest,
} from "@/lib/data";
import { analyze, exportCsv, serialize, type Scope } from "@/lib/analysis";
import type { Product } from "@/lib/schema";
import { useAtlas } from "./atlas-provider";
import { Evidence } from "./evidence";
import { PinButton } from "./shortlist";
import { ProductCard } from "./primitives";
const PriceChart = dynamic(() => import("./price-chart"), {
  ssr: false,
  loading: () => (
    <p>Loading linked chart… The full data table is available below.</p>
  ),
});
function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
export function Explorer() {
  const { scope, update, reset, notice } = useAtlas();
  const stats = useMemo(() => analyze(products, scope), [scope]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [share, setShare] = useState("");
  const [chartVisible, setChartVisible] = useState(false);
  const updateSelection = useCallback(
    (ids: string[]) => update({ selected: ids }),
    [update],
  );
  const columns: ColumnDef<Product>[] = [
    {
      id: "selected",
      header: "Select",
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label={`Select ${row.original.product_id}`}
          checked={scope.selected.includes(row.original.product_id)}
          onChange={(e) =>
            update({
              selected: e.target.checked
                ? [...scope.selected, row.original.product_id]
                : scope.selected.filter((id) => id !== row.original.product_id),
            })
          }
        />
      ),
    },
    {
      accessorKey: "product_name",
      header: "Product / variant",
      cell: ({ row }) => (
        <>
          <a href={`/products/${row.original.product_id}/`}>
            {row.original.product_name}
          </a>
          <small>
            {brands[row.original.brand_id]} · {row.original.product_variant}
          </small>
        </>
      ),
    },
    {
      accessorKey: "price_usd",
      header: "Price / USD",
      cell: ({ row }) => (
        <>
          {money(row.original.price_usd)}
          <small>{row.original.price_type.replaceAll("_", " ")}</small>
        </>
      ),
    },
    {
      accessorKey: scope.weight,
      header:
        scope.weight === "minimum_weight_g" ? "Minimum / g" : "Packed / g",
      cell: ({ row }) => grams(row.original[scope.weight]),
    },
    {
      accessorKey: "floor_area_m2",
      header: "Floor / m²",
      cell: ({ row }) =>
        row.original.floor_area_m2 === null
          ? "Not verified"
          : row.original.floor_area_m2.toFixed(2),
    },
    {
      accessorKey: "doors_count",
      header: "Doors",
      cell: ({ row }) => row.original.doors_count ?? "Not verified",
    },
    {
      accessorKey: "season_rating",
      header: "Season",
      cell: ({ row }) => row.original.season_rating ?? "Not verified",
    },
    {
      accessorKey: "freestanding_status",
      header: "Structure",
      cell: ({ row }) => row.original.freestanding_status ?? "Not verified",
    },
    {
      accessorKey: "construction",
      header: "Walls",
      cell: ({ row }) => row.original.construction ?? "Not verified",
    },
    {
      accessorKey: "footprint_included",
      header: "Footprint",
      cell: ({ row }) =>
        row.original.footprint_included === null
          ? "Not verified"
          : row.original.footprint_included
            ? "Included"
            : "Excluded",
    },
    {
      id: "status",
      header: "Scope / status",
      cell: ({ row }) => (
        <>
          {row.original.cohort_id ? "Complete cohort" : "Incomplete cohort"}
          <small>
            {row.original.availability.replaceAll("_", " ")}
            {stats.frontier?.includes(row.original.product_id)
              ? " · Cohort efficient"
              : ""}
          </small>
        </>
      ),
    },
    {
      id: "evidence",
      header: "Actions",
      cell: ({ row }) => (
        <>
          <Evidence product={row.original} />
          <PinButton id={row.original.product_id} />
        </>
      ),
    },
  ];
  const table = useReactTable({
    data: stats.rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  const cohorts = [
    ...new Set(products.flatMap((p) => (p.cohort_id ? [p.cohort_id] : []))),
  ].sort();
  const groups = Object.keys(brands)
    .map((id) => ({
      id,
      rows: stats.rows.filter((p) => p.brand_id === id && p.price_usd !== null),
    }))
    .filter((g) => g.rows.length);
  function filter<K extends keyof Scope>(key: K, value: Scope[K]) {
    update({ [key]: value, selected: [] });
  }
  return (
    <>
      <section className="filter-panel" aria-label="Analysis filters">
        <div>
          <label htmlFor="brands">Brands (none selected = all)</label>
          <select
            id="brands"
            multiple
            size={3}
            value={scope.brands}
            onChange={(e) =>
              filter(
                "brands",
                Array.from(e.target.selectedOptions, (o) => o.value),
              )
            }
          >
            {Object.entries(brands).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          <small>Use Ctrl / Command for multiple brands.</small>
        </div>
        <div>
          <label htmlFor="cohort">Comparison cohort</label>
          <select
            id="cohort"
            value={scope.cohort}
            onChange={(e) => filter("cohort", e.target.value)}
          >
            <option value="all">All offers · descriptive</option>
            {cohorts.map((c) => (
              <option key={c} value={c}>
                {cohortLabel(c)}
              </option>
            ))}
          </select>
          <label htmlFor="weight">Weight definition</label>
          <select
            id="weight"
            value={scope.weight}
            onChange={(e) =>
              filter("weight", e.target.value as Scope["weight"])
            }
          >
            <option value="minimum_weight_g">Minimum / trail (g)</option>
            <option value="packed_weight_g">Packed / packaged (g)</option>
          </select>
        </div>
        <div>
          <label htmlFor="price-type">Price type</label>
          <select
            id="price-type"
            value={scope.price_types[0] || "all"}
            onChange={(e) =>
              filter(
                "price_types",
                e.target.value === "all" ? [] : [e.target.value],
              )
            }
          >
            <option value="all">All observed types</option>
            {["regular", "sale", "displayed_unclassified", "unavailable"].map(
              (p) => (
                <option key={p} value={p}>
                  {p.replaceAll("_", " ")}
                </option>
              ),
            )}
          </select>
          <label htmlFor="availability">Availability</label>
          <select
            id="availability"
            value={scope.availability[0] || "all"}
            onChange={(e) =>
              filter(
                "availability",
                e.target.value === "all" ? [] : [e.target.value],
              )
            }
          >
            <option value="all">All advertised listings</option>
            {[...new Set(products.map((p) => p.availability))].map((v) => (
              <option key={v} value={v}>
                {v.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="min-price">Minimum USD</label>
          <input
            id="min-price"
            type="number"
            min="0"
            value={scope.min ?? ""}
            onChange={(e) =>
              filter(
                "min",
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
          />
          <label htmlFor="max-price">Maximum USD</label>
          <input
            id="max-price"
            type="number"
            min="0"
            value={scope.max ?? ""}
            onChange={(e) =>
              filter(
                "max",
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
          />
        </div>
        <div className="filter-actions">
          <button onClick={reset}>Reset scope</button>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  location.origin + location.pathname + serialize(scope),
                );
                setShare("Link copied.");
              } catch {
                setShare(
                  location.origin + location.pathname + serialize(scope),
                );
              }
            }}
          >
            Copy share link
          </button>
        </div>
      </section>
      {notice && <p role="status">{notice}</p>}
      {share && (
        <p role="status" className="hash">
          {share}
        </p>
      )}
      <div className="scope-strip" aria-live="polite">
        <strong data-testid="filtered-count">
          {stats.count} variants in scope
        </strong>
        <span>
          {stats.priced} priced · {stats.count - stats.priced} unpriced
        </span>
        <span>
          {stats.missing_weight} missing selected weight ·{" "}
          {products.length - stats.count} filtered out
        </span>
        <span>USD · grams · observed 13 Oct 2026</span>
      </div>
      <p className="note">
        Active price scope:{" "}
        {scope.price_types.length
          ? scope.price_types.join(", ").replaceAll("_", " ")
          : "all observed types"}
        . Availability:{" "}
        {scope.availability.length
          ? scope.availability.join(", ").replaceAll("_", " ")
          : "all advertised listings"}
        . Cohort: {cohortLabel(scope.cohort)}.
      </p>
      <section className="analysis-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">01 / POSITIONING</p>
              <h2>What does lighter cost?</h2>
            </div>
            <span className="legend">△ Naturehike · ○ other offers</span>
          </div>
          {stats.count === 0 ? (
            <p>
              No matching records. Reset scope or broaden brands, cohort or
              price bounds. Your filters are retained.
            </p>
          ) : (
            <>
              <p className="note">
                Only{" "}
                {
                  stats.rows.filter(
                    (p) => p.price_usd !== null && p[scope.weight] !== null,
                  ).length
                }{" "}
                records have both plotted values. Selection highlights records;
                it does not change the population.
              </p>
              {chartVisible ? (
                <PriceChart
                  rows={stats.rows}
                  weight={scope.weight}
                  selected={scope.selected}
                  onSelect={updateSelection}
                />
              ) : (
                <button
                  className="button"
                  onClick={() => setChartVisible(true)}
                >
                  Load linked scatterplot
                </button>
              )}
              <p>
                {scope.cohort === "all"
                  ? "Mixed / unknown cohorts: efficiency badges disabled. Choose a complete cohort to compare cheaper-and-lighter positions."
                  : stats.frontier === null
                    ? "At least two priced records with the selected weight are needed for efficiency labels."
                    : "Efficiency means only cheaper-and-lighter within this filtered cohort; it is not quality or overall value."}
              </p>
            </>
          )}
        </article>
        <article className="panel stats-panel">
          <p className="eyebrow">02 / SAME SCOPE</p>
          <h2>Read the population</h2>
          <div className="stat-value">{money(stats.median)}</div>
          <p>Median of {stats.priced} bound prices in the visible set</p>
          <hr />
          <dl>
            <div>
              <dt>Naturehike reference</dt>
              <dd>{money(stats.baseline)}</dd>
            </div>
            <div>
              <dt>Baseline n</dt>
              <dd>{stats.baseline_n}</dd>
            </div>
            <div>
              <dt>Median gap / USD</dt>
              <dd>{money(stats.gap)}</dd>
            </div>
          </dl>
          <p className="note">
            Reference uses the canonical Naturehike sample in this exact cohort
            with the same price type, availability and bounds, even when that
            brand is hidden. No exact cohort or no matching baseline →
            unavailable.
          </p>
          <p>
            Selection:{" "}
            {
              scope.selected.filter((id) =>
                stats.rows.some((p) => p.product_id === id),
              ).length
            }{" "}
            records.{" "}
            <button
              className="text-button"
              onClick={() => update({ selected: [] })}
            >
              Clear selection
            </button>
          </p>
        </article>
      </section>
      <section className="panel distribution">
        <p className="eyebrow">03 / ASSORTMENT</p>
        <h2>Observed price spread</h2>
        <p>
          Same active scope. A single dot is a listing, not a distribution
          estimate. Brands and selected assortment are not representative of
          market share.
        </p>
        {groups.map((g) => (
          <div className="dot-row" key={g.id}>
            <strong>{brands[g.id]}</strong>
            <svg
              viewBox="0 0 640 32"
              role="img"
              aria-label={`${brands[g.id]}, ${g.rows.length} prices from ${money(Math.min(...g.rows.map((p) => p.price_usd!)))} to ${money(Math.max(...g.rows.map((p) => p.price_usd!)))}`}
            >
              <line x1="5" x2="635" y1="16" y2="16" stroke="#d4e1e8" />
              {g.rows.map((p) => (
                <circle
                  key={p.product_id}
                  cx={
                    5 +
                    (p.price_usd! /
                      Math.max(...stats.rows.map((p) => p.price_usd || 0), 1)) *
                      620
                  }
                  cy="16"
                  r="6"
                  fill={g.id === "naturehike" ? "#157a80" : "#486276"}
                >
                  <title>{`${p.product_name}: ${money(p.price_usd)}`}</title>
                </circle>
              ))}
            </svg>
            <span>n={g.rows.length}</span>
          </div>
        ))}
      </section>
      <section className="records">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">04 / FIELD RECORDS</p>
            <h2>Inspect the trade-offs</h2>
          </div>
          <div className="button-group">
            <button
              aria-pressed={scope.view === "table"}
              onClick={() => update({ view: "table" })}
            >
              Feature table
            </button>
            <button
              aria-pressed={scope.view === "cards"}
              onClick={() => update({ view: "cards" })}
            >
              Product cards
            </button>
            <button
              onClick={() =>
                download(
                  "atlas-scope.csv",
                  exportCsv(stats.rows, scope),
                  "text/csv",
                )
              }
            >
              Download scoped CSV
            </button>
            <button
              onClick={() =>
                download(
                  "atlas-scope.metadata.json",
                  JSON.stringify(
                    {
                      dataset: manifest.dataset_version,
                      dataset_hash: manifest.dataset_hash,
                      scope,
                      source_ids: stats.rows.map((p) => p.source_id),
                      units: { price: "USD", weight: "g", area: "m²" },
                      count: stats.count,
                      null_policy:
                        "Unknown remains null; missing reasons in CSV; no imputation.",
                    },
                    null,
                    2,
                  ),
                  "application/json",
                )
              }
            >
              Download metadata
            </button>
          </div>
        </div>
        {scope.view === "cards" ? (
          <div className="product-grid">
            {stats.rows.map((p) => (
              <ProductCard
                key={p.product_id}
                product={p}
                selected={scope.selected.includes(p.product_id)}
              />
            ))}
          </div>
        ) : (
          <div
            className="table-scroll"
            tabIndex={0}
            aria-label="Scrollable product feature table"
          >
            <table>
              <caption>
                Filtered product specifications. Checkboxes provide the chart
                selection alternative. Click column names to sort.
              </caption>
              <thead>
                {table.getHeaderGroups().map((group) => (
                  <tr key={group.id}>
                    {group.headers.map((header) => (
                      <th key={header.id} scope="col">
                        {header.column.getCanSort() ? (
                          <button
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}{" "}
                            {header.column.getIsSorted() === "asc"
                              ? "↑"
                              : header.column.getIsSorted() === "desc"
                                ? "↓"
                                : "↕"}
                          </button>
                        ) : (
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={
                      scope.selected.includes(row.original.product_id)
                        ? "selected"
                        : ""
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
