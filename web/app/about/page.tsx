import { PageIntro, Badge } from "@/components/primitives";
export const metadata = { title: "Independent project and contribution" };
export default function Page() {
  return (
    <>
      <PageIntro
        number="09"
        kicker="ABOUT THE PROJECT"
        title="Engineering questions. Commercial context."
      >
        <p>
          An independent, AI-assisted portfolio project connecting precise
          specification analysis to market research and testable strategy.
        </p>
      </PageIntro>
      <section className="about-layout">
        <article>
          <Badge>Independent personal research</Badge>
          <h2>What this project demonstrates</h2>
          <p>
            A repeatable workflow for reviewing official sources, preserving
            variant and weight definitions, modeling missing data, querying
            controlled comparisons and translating observations into proposed
            marketing tests.
          </p>
          <p>
            The project is not Naturehike employment, an internship,
            commissioned work or an internal business dashboard. There are no
            verified customer, sales or campaign outcomes.
          </p>
          <h3>Role and AI assistance</h3>
          <p>
            The repository documents project decisions, reviewed factual inputs,
            methods and limitations. Codex assisted with implementation and
            documentation. Human ownership and any independently performed work
            must be described accurately; code generation is not a claim of
            unaided authorship.
          </p>
        </article>
        <aside className="panel">
          <p className="eyebrow">RESUME-SAFE SCOPE</p>
          <h2>Show the work.</h2>
          <ul>
            <li>Marketing research: source review and comparison design</li>
            <li>Analytics: Python, Polars, DuckDB and SQL</li>
            <li>BI: reproducible exports and Streamlit workbench</li>
            <li>Web: static Next.js, TypeScript and interactive evidence</li>
            <li>Strategy: proposed, measurable experiment designs</li>
          </ul>
          <a
            className="button"
            href="https://github.com/duhaolei43-source/naturehike-intelligence"
          >
            Inspect the repository ↗
          </a>
          <p className="note">
            Power BI model/report design remains runtime unverified. Demand
            remains incomplete.
          </p>
        </aside>
      </section>
    </>
  );
}
