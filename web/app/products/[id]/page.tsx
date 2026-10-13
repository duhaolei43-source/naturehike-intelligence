import { products, brands, money, cohortLabel } from "@/lib/data";
import { PageIntro, Badge, DualWeight } from "@/components/primitives";
import { Evidence } from "@/components/evidence";
import { PinButton } from "@/components/shortlist";
export const dynamicParams = false;
export function generateStaticParams() {
  return products.map((p) => ({ id: p.product_id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return {
    title:
      products.find((p) => p.product_id === id)?.product_name ||
      "Product dossier",
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = products.find((p) => p.product_id === id)!;
  return (
    <>
      <PageIntro
        number="03"
        kicker={`${brands[p.brand_id]} / PRODUCT DOSSIER`}
        title={p.product_name}
      >
        <p>
          {p.product_variant} · {p.product_id}
        </p>
        <Badge>Verified source attribution</Badge>{" "}
        <Badge
          tone={Object.keys(p.missing_reasons).length ? "missing" : "observed"}
        >
          {Object.keys(p.missing_reasons).length} incomplete fields
        </Badge>
      </PageIntro>
      <section className="dossier-grid">
        <div className="dossier-art">
          <img
            src="/media/atlas-tent.svg"
            width="640"
            height="470"
            alt="Generic illustrative tent system, not a photograph or exact SKU"
          />
          <p className="note">
            Original explanatory graphic. No brand product photography is
            redistributed. <a href="/data/media.json">Media rights registry</a>
          </p>
        </div>
        <article className="panel">
          <p className="eyebrow">VARIANT-BOUND OFFER</p>
          <div className="stat-value">{money(p.price_usd)}</div>
          <p>
            {p.price_type.replaceAll("_", " ")} ·{" "}
            {p.availability.replaceAll("_", " ")}
          </p>
          <p>
            Observed {p.price_observed_at_utc} UTC. Before tax and shipping;
            current checkout and stock are unverified.
          </p>
          <dl className="facts">
            <div>
              <dt>Floor area</dt>
              <dd>
                {p.floor_area_m2 === null
                  ? "Not verified"
                  : p.floor_area_m2.toFixed(3) + " m²"}
              </dd>
            </div>
            <div>
              <dt>Doors</dt>
              <dd>{p.doors_count ?? "Not verified"}</dd>
            </div>
            <div>
              <dt>Construction</dt>
              <dd>{p.construction ?? "Not verified"}</dd>
            </div>
            <div>
              <dt>Footprint</dt>
              <dd>
                {p.footprint_included === null
                  ? "Not verified"
                  : p.footprint_included
                    ? "Included"
                    : "Excluded"}
              </dd>
            </div>
            <div>
              <dt>Material</dt>
              <dd>{p.fabric_material ?? "Not verified"}</dd>
            </div>
          </dl>
          <div className="card-actions">
            <Evidence product={p} />
            <PinButton id={p.product_id} />
          </div>
        </article>
      </section>
      <section className="two-column">
        <DualWeight product={p} />
        <article className="panel">
          <p className="eyebrow">INTERPRET WITH CARE</p>
          <h2>The boundary of this record</h2>
          <p>{p.notes}</p>
          <p>{p.weight_definition}</p>
          <p>
            Comparison cohort:{" "}
            {p.cohort_id
              ? cohortLabel(p.cohort_id)
              : "Incomplete — controlled comparisons disabled"}
          </p>
          <details>
            <summary>Why some fields are missing</summary>
            {Object.entries(p.missing_reasons).map(([key, value]) => (
              <p key={key}>
                <strong>{key.replaceAll("_", " ")}:</strong> {value}
              </p>
            ))}
          </details>
          <a
            href={
              "/explore/?dataset=2026-10-13-v1&selected=" +
              id +
              (p.cohort_id ? "&cohort=" + encodeURIComponent(p.cohort_id) : "")
            }
          >
            Explore this record in context →
          </a>
        </article>
      </section>
    </>
  );
}
