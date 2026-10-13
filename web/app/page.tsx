import { Coverage, Badge } from "@/components/primitives";
import { findings, products } from "@/lib/data";
import { Evidence } from "@/components/evidence";
export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">INDEPENDENT MARKET RESEARCH / UNITED STATES</p>
          <h1>
            Carry less.
            <br />
            <em>Understand more.</em>
          </h1>
          <p className="hero-description">
            A field guide to Naturehike’s place in the two-person backpacking
            tent market. Follow the evidence from a specification to a
            commercial question.
          </p>
          <a
            className="button"
            href="/explore/?dataset=2026-10-13-v1&cohort=3-season%7Cfreestanding%7Cdouble-wall%7Ctrue"
          >
            Explore the trade-off <span>↗</span>
          </a>
          <a className="secondary-link" href="/insights/">
            Start with the findings →
          </a>
          <p className="fine-print">
            Reported specifications · observed USD offers
            <br />
            No sales, customer preferences or campaign results
          </p>
        </div>
        <figure className="hero-art">
          <img
            src="/media/atlas-tent.svg"
            width="640"
            height="470"
            alt="Original generic tent schematic showing inner tent, fly and separate groundsheet; not an exact product"
          />
          <figcaption>
            <span>PLATE 01 / THE WEIGHT QUESTION</span>
            <strong>What is included in the number?</strong>
            <p>
              Minimum and packed weight tell different stories. The comparison
              begins with definitions.
            </p>
          </figcaption>
        </figure>
      </section>
      <Coverage />
      <section className="editorial-section">
        <div className="section-heading">
          <p className="eyebrow">THREE OBSERVATIONS / THREE OPEN QUESTIONS</p>
          <h2>
            Specifications are the start.
            <br />
            Strategy is the next test.
          </h2>
          <p>
            Each story connects a verified source observation to an
            interpretation and a proposed experiment. None reports measured
            business impact.
          </p>
        </div>
        <div className="story-grid">
          {findings.map((f, i) => (
            <article className="story-card" key={f.id}>
              <span className="story-index">0{i + 1}</span>
              <Badge>Observed</Badge>
              <h3>{f.title}</h3>
              <div className="story-number">
                {i === 0 ? "20 g / 270 g" : i === 1 ? "$130" : "Included?"}
              </div>
              <p>
                {i === 0
                  ? "The minimum-weight difference is small. The packed-weight difference is larger."
                  : i === 1
                    ? "Shared floor area and doors do not explain a price premium."
                    : "An accessory flag changes what the displayed offer contains."}
              </p>
              <a href={`/insights/#${f.id}`}>Read the evidence →</a>
              <Evidence
                product={
                  products.find((p) => p.product_id === f.product_ids[0])!
                }
              >
                Inspect first source
              </Evidence>
            </article>
          ))}
        </div>
      </section>
      <section className="route-band">
        <div>
          <p className="eyebrow">YOUR RESEARCH ROUTE</p>
          <h2>
            Move from a number
            <br />
            to a defensible decision.
          </h2>
        </div>
        <ol>
          <li>
            <strong>Observe</strong>
            <span>30 variant-bound records</span>
          </li>
          <li>
            <strong>Control</strong>
            <span>Season, structure, walls, footprint</span>
          </li>
          <li>
            <strong>Inspect</strong>
            <span>Field evidence and missing reasons</span>
          </li>
          <li>
            <strong>Propose</strong>
            <span>Experiments awaiting execution</span>
          </li>
        </ol>
      </section>
      <section className="missing-banner">
        <Badge tone="missing">Missing input</Badge>
        <div>
          <h2>Search demand is still an open question.</h2>
          <p>
            No real Google Trends batch has been imported. A method is ready; a
            demand curve is not.
          </p>
        </div>
        <a href="/demand/">See the evidence gate →</a>
      </section>
    </>
  );
}
