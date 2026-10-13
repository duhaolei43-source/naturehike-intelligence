import { PageIntro, Coverage, Badge } from "@/components/primitives";
import { SourceBrowser } from "@/components/source-browser";
import { manifest } from "@/lib/data";
import exclusions from "@/public/data/exclusions.json";
export const metadata = { title: "Method, sources and limitations" };
export default function Page() {
  const q = manifest.coverage;
  const missing = [
    ["Price", q.missing_price_count],
    ["Packed weight", q.missing_packed_weight_count],
    ["Floor area", q.missing_floor_area_count],
    ["Cohort metadata", q.incomplete_cohort_count],
  ] as const;
  return (
    <>
      <PageIntro
        number="08"
        kicker="METHODOLOGY"
        title="A trail you can retrace."
      >
        <p>
          Source review → typed validation → canonical snapshots → controlled
          analysis → public allowlist export. Private audit material is never a
          website input.
        </p>
      </PageIntro>
      <Coverage />
      <section className="provenance-panel">
        <svg
          viewBox="0 0 1040 130"
          role="img"
          aria-label="Official listings lead to validation, canonical Python and SQL analysis, then deterministic reviewed web JSON"
        >
          <path
            d="M140 65H900"
            stroke="#157a80"
            strokeWidth="3"
            strokeDasharray="8 7"
          />
          {[
            "Official source",
            "Typed validation",
            "Python / SQL",
            "Public web JSON",
          ].map((label, i) => (
            <g key={label}>
              <circle cx={130 + i * 260} cy="65" r="25" fill="#173247" />
              <text x={130 + i * 260} y="71" textAnchor="middle" fill="white">
                0{i + 1}
              </text>
              <text
                x={130 + i * 260}
                y="120"
                textAnchor="middle"
                fill="#173247"
              >
                {label}
              </text>
            </g>
          ))}
        </svg>
        <p>
          Evidence IDs identify source-attributed structured records. Their
          hashes do not certify physical performance or make the private archive
          publicly downloadable.
        </p>
      </section>
      <section className="two-column">
        <article className="panel">
          <Badge>Observed / source verified</Badge>
          <h2>Verification is not completeness.</h2>
          <p>
            A populated field was checked against its named official listing.
            Retailer-published values remain retailer-attributed. “Verified”
            does not guarantee stock, all fields, live checkout pricing or
            independent manufacturer testing.
          </p>
          <p>
            This convenience sample is not a market census. It cannot establish
            sales, customer preference, market share or objective product
            quality.
          </p>
          <p>
            Original observations are dated 13 October 2026. No source refresh
            is claimed in this frontend implementation.
          </p>
        </article>
        <article className="panel">
          <p className="eyebrow">MISSINGNESS / 30 VARIANTS</p>
          <h2>Keep the gaps in view.</h2>
          {missing.map(([label, n]) => (
            <div className="missing-row" key={label}>
              <span>{label}</span>
              <div className="missing-track">
                <span style={{ width: `${(n / 30) * 100}%` }} />
              </div>
              <strong>{n}/30</strong>
            </div>
          ))}
          <p>
            Missing fields stay null and carry reasons. Unpriced variants remain
            browsable. Unknown cohort attributes never create comparable groups.
          </p>
        </article>
      </section>
      <section className="two-column">
        <article className="panel">
          <h2>Comparison glossary</h2>
          <dl className="glossary">
            <dt>Minimum / trail weight</dt>
            <dd>
              Manufacturer-defined minimum configuration; included components
              may differ.
            </dd>
            <dt>Packed / packaged weight</dt>
            <dd>
              Separate manufacturer-reported packed configuration; “Typical” is
              not silently mapped to packed.
            </dd>
            <dt>Controlled cohort</dt>
            <dd>
              Known season + structure + wall construction + footprint
              inclusion. Material and component differences can remain.
            </dd>
            <dt>Price gap</dt>
            <dd>
              Visible-population median minus canonical Naturehike median,
              within one exact cohort and the same non-brand filters. Missing
              baseline yields null.
            </dd>
            <dt>Pareto efficiency</dt>
            <dd>
              No cheaper and lighter observed eligible record in the filtered
              exact cohort. Equal points are retained; no overall quality
              conclusion.
            </dd>
            <dt>Displayed price</dt>
            <dd>
              Variant-bound observed USD amount before tax, shipping or optional
              accessories. Unbound price ranges are unknown.
            </dd>
          </dl>
        </article>
        <article className="panel">
          <h2>Reproduction & downloads</h2>
          <p>
            Python/Polars/DuckDB own snapshot selection and analysis. Small
            browser aggregations are tested against Python/DuckDB vectors.
          </p>
          <ul>
            {[
              "products",
              "sources",
              "offers",
              "cohorts",
              "findings",
              "demand",
              "manifest",
              "boundary.schema",
              "parity-vectors",
              "media",
            ].map((name) => (
              <li key={name}>
                <a href={`/data/${name}.json`} download>
                  {name}.json
                </a>
              </li>
            ))}
          </ul>
          <p>
            Dataset hash: <code className="hash">{manifest.dataset_hash}</code>
          </p>
          <p>
            Power BI: <strong>UNVERIFIED</strong> — design prepared; supported
            runtime / DAX parity not completed.
          </p>
          <details>
            <summary>Excluded records and unresolved alternatives</summary>
            <pre className="json-block">
              {JSON.stringify(exclusions, null, 2)}
            </pre>
          </details>
          <a href="https://github.com/duhaolei43-source/naturehike-intelligence">
            Repository and reproducible commands ↗
          </a>
        </article>
      </section>
      <SourceBrowser />
    </>
  );
}
