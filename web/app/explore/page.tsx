import { PageIntro } from "@/components/primitives";
import { Explorer } from "@/components/explorer";
export const metadata = { title: "Explore the offers" };
export default function Page() {
  return (
    <>
      <PageIntro
        number="02"
        kicker="EXPLORER"
        title="Find the trade-off. Inspect the evidence."
      >
        <p>
          One population across chart, table, cards and statistics. Choose an
          exact cohort for controlled comparisons; all offers remain useful as a
          descriptive catalog.
        </p>
      </PageIntro>
      <Explorer />
    </>
  );
}
