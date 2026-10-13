import { PageIntro, Badge } from "@/components/primitives";
const experiments = [
  {
    id: "E1",
    claim: "I1",
    title: "Make both weights understandable",
    hypothesis:
      "A dual-weight card may help visitors understand the component boundary and make a more informed shortlist.",
    treatment:
      "Show minimum and packed weights together, with component definitions and uncertainty.",
    kpi: "Qualified consideration rate: eligible exposed users who save or request details for a correctly understood variant / eligible exposed users.",
    design:
      "Randomize eligible consented participants between the existing card and a dual-weight card. Keep product, price, offer and traffic source fixed.",
    guardrail:
      "Definition comprehension, task completion, accessibility and mistaken component assumptions.",
  },
  {
    id: "E2",
    claim: "I2",
    title: "Compare the features behind the price",
    hypothesis:
      "An aligned feature comparison may improve informed consideration without assuming that equal area means equal performance.",
    treatment:
      "Present selected variants with price, floor area, doors, construction, weight and missing fields.",
    kpi: "Informed shortlist rate, conditional on correctly identifying at least one verified difference and one uncertainty.",
    design:
      "Define eligibility and allocation before recruitment. Compare task completion and informed shortlisting between current presentation and the feature table.",
    guardrail:
      "False equivalence, decision confidence without comprehension, and missing-field misunderstanding.",
  },
  {
    id: "E3",
    claim: "I3",
    title: "Show what the offer includes",
    hypothesis:
      "An inclusion checklist may reduce confusion about footprints and optional accessories.",
    treatment:
      "Separate included items, optional items and unknown delivered costs. Never present incomplete totals as savings.",
    kpi: "Inclusion comprehension: participants correctly identifying included versus optional or unknown items / eligible participants.",
    design:
      "Predefine checklist variants, comprehension questions, sampling and stopping rules before collecting consented responses.",
    guardrail:
      "Incorrect delivered-cost assumptions and inferred included accessories.",
  },
];
export const metadata = { title: "Proposed growth experiments" };
export default function Page() {
  return (
    <>
      <PageIntro
        number="07"
        kicker="STRATEGY / PROPOSED TESTS"
        title="Turn an observation into a test."
      >
        <p>
          Three experiment blueprints. No campaign was run, no participants
          recruited, and no uplift, ROI, CAC or ROAS was measured.
        </p>
        <Badge tone="proposed">PROPOSED / NOT EXECUTED</Badge>
      </PageIntro>
      {experiments.map((e, i) => (
        <article className="experiment" id={e.id} key={e.id}>
          <div className="experiment-number">0{i + 1}</div>
          <div>
            <p className="eyebrow">
              {e.id} / LINKED TO <a href={`/insights/#${e.claim}`}>{e.claim}</a>
            </p>
            <h2>{e.title}</h2>
            <p className="insight-lead">{e.hypothesis}</p>
            <div className="experiment-flow">
              <span>Evidence</span>
              <span>Hypothesis</span>
              <span>Allocation</span>
              <span>Measurement</span>
              <span>Decision</span>
            </div>
            <div className="two-column">
              <div>
                <h3>Treatment</h3>
                <p>{e.treatment}</p>
                <h3>Design before execution</h3>
                <p>{e.design}</p>
              </div>
              <div>
                <h3>Primary measure</h3>
                <p>{e.kpi}</p>
                <h3>Guardrail</h3>
                <p>{e.guardrail}</p>
              </div>
            </div>
            <details>
              <summary>Assumptions, sample planning and decision rule</summary>
              <p>
                Requires an authorized eligible population, consent where
                needed, known baseline, predefined minimum detectable effect and
                a justified sample size. No baseline is available, so no
                sample-size result or expected uplift is calculated.
              </p>
              <p>
                Pre-register allocation, exclusions, analysis window, stopping
                rule and practical effect threshold. Report uncertainty and
                adverse comprehension effects; do not choose a winner from
                product specifications alone.
              </p>
              <p>
                Paid campaigns, recruitment and external customer messaging
                require separate authorization. These plans are not evidence of
                customer preference.
              </p>
            </details>
          </div>
        </article>
      ))}
    </>
  );
}
