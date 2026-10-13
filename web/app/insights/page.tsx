import { findings, products } from "@/lib/data";
import { PageIntro, Badge, DualWeight } from "@/components/primitives";
import { Evidence } from "@/components/evidence";
export const metadata = { title: "Three evidence-linked insights" };
export default function Page() {
  return (
    <>
      <PageIntro
        number="05"
        kicker="OBSERVATIONS → QUESTIONS"
        title="Make the inference visible."
      >
        <p>
          Three observations from the reviewed pilot. Source values support the
          arithmetic; customer response and commercial outcomes still need
          measurement.
        </p>
      </PageIntro>
      {findings.map((f, i) => {
        const selected = f.product_ids.slice(0, i === 2 ? 4 : 2);
        return (
          <article className="insight-section" id={f.id} key={f.id}>
            <div className="insight-label">
              <span>{f.id}</span>
              <Badge>{f.class}</Badge>
            </div>
            <div>
              <h2>{f.title}</h2>
              <p className="insight-lead">
                {i === 0
                  ? `${f.metrics.minimum_difference_g} g less minimum weight; ${f.metrics.packed_difference_g} g less packed weight; USD ${f.metrics.price_difference_usd} more for the selected Cloud Up Pro offer.`
                  : i === 1
                    ? `USD ${f.metrics.price_difference_usd} price difference. Both selected REI offers report 31.8 ft², two doors and footprint inclusion.`
                    : `${f.metrics.included_count} recorded offers include a footprint; ${f.metrics.excluded_count} exclude it. Unknown inclusion flags remain unknown.`}
              </p>
              {i === 0 ? (
                <div className="two-column">
                  {selected.map((id) => (
                    <DualWeight
                      key={id}
                      product={products.find((p) => p.product_id === id)!}
                    />
                  ))}
                </div>
              ) : i === 1 ? (
                <div className="area-diagram">
                  <span>31.8 ft²</span>
                  <div>Trailmade 2 · $199</div>
                  <div>Half Dome 2 · $329</div>
                  <p>
                    Same reported area / different reported product
                    configurations
                  </p>
                </div>
              ) : (
                <div className="accessory-diagram">
                  <span>△ Tent</span>
                  <span>＋ Footprint?</span>
                  <span>＋ Shipping?</span>
                  <span>＋ Tax?</span>
                  <strong>Complete-kit cost: unavailable</strong>
                </div>
              )}
              <div className="two-column">
                <div>
                  <h3>Reproducible observation</h3>
                  <p>{f.method}</p>
                  <p>
                    Method output:{" "}
                    <a href="/data/findings.json">{f.id} claim record</a>
                  </p>
                  <div className="evidence-links">
                    {selected.map((id) => (
                      <Evidence
                        key={id}
                        product={products.find((p) => p.product_id === id)!}
                      >
                        {
                          products.find((p) => p.product_id === id)!
                            .product_name
                        }{" "}
                        source
                      </Evidence>
                    ))}
                  </div>
                </div>
                <div>
                  <h3>Alternative explanation & limit</h3>
                  <p>{f.alternative}</p>
                  <p className="note">{f.limitation}</p>
                </div>
              </div>
              <div className="button-group">
                <a
                  className="button"
                  href={
                    "/explore/?dataset=2026-10-13-v1&selected=" +
                    selected.join(",") +
                    (i < 2
                      ? "&cohort=3-season%7Cfreestanding%7Cdouble-wall%7Ctrue"
                      : "")
                  }
                >
                  Reproduce this view →
                </a>
                {i < 2 && (
                  <a
                    href={
                      "/compare/?dataset=2026-10-13-v1&compare=" +
                      selected.join(",")
                    }
                  >
                    Compare the exact variants →
                  </a>
                )}
                <a href={`/strategy/#${f.recommendation_id}`}>
                  Proposed test {f.recommendation_id} →
                </a>
              </div>
            </div>
          </article>
        );
      })}
    </>
  );
}
