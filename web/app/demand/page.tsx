import { PageIntro, Badge } from "@/components/primitives";
export const metadata = { title: "Search demand: missing input" };
export default function Page() {
  return (
    <>
      <PageIntro
        number="06"
        kicker="CONSUMER SEARCH"
        title="An honest gap in the map."
      >
        <p>Search demand is a research question. It is not yet a finding.</p>
      </PageIntro>
      <section className="demand-empty">
        <div className="empty-map" aria-hidden="true">
          <span>NO REVIEWED BATCH</span>
          <div>—</div>
          <span>UNITED STATES / GOOGLE TRENDS</span>
        </div>
        <article>
          <Badge tone="missing">Missing input / INCOMPLETE</Badge>
          <h2>No real export has been imported.</h2>
          <p>
            The adapter is tested. The public time-series table is empty. No
            simulated curve, brand ranking, seasonal peak or sales estimate is
            shown.
          </p>
          <a href="/data/demand.json">Inspect the empty demand contract →</a>
        </article>
      </section>
      <section className="two-column">
        <article className="panel">
          <p className="eyebrow">ACCEPTANCE ROUTE</p>
          <h2>What would make this usable?</h2>
          <ol className="steps">
            <li>Choose precise terms/topics and the research question.</li>
            <li>
              Export at most five jointly compared terms in one batch, with U.S.
              geography, category, search type and period.
            </li>
            <li>
              Record original CSV, export UTC time, term semantics, source and
              permitted use.
            </li>
            <li>
              Validate period endpoints and preserve zero; “&lt;1” is
              censored/null.
            </li>
            <li>
              Review and import real data before exposing batch or date
              controls.
            </li>
          </ol>
        </article>
        <article className="panel">
          <p className="eyebrow">NORMALIZATION BOUNDARY</p>
          <h2>One batch, one relative scale.</h2>
          <p>
            Independently normalized exports cannot be combined into a brand
            ranking. A value of 100 is a within-batch relative peak, not a
            search count or purchase count.
          </p>
          <p>
            Several complete comparable annual cycles are preferred for
            seasonality. Short periods describe only their own period.
          </p>
          <p>
            Fixtures remain outside public data. Real demand findings require a
            reviewed Tier C source and genuine-data integration checks.
          </p>
          <a href="https://github.com/duhaolei43-source/naturehike-intelligence/blob/codex/market-intelligence-implementation/docs/GOOGLE_TRENDS.md">
            Import protocol ↗
          </a>
        </article>
      </section>
    </>
  );
}
