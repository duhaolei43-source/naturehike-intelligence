import { PageIntro } from "@/components/primitives";
import { Comparison } from "@/components/comparison";
export const metadata = { title: "Compare selected variants" };
export default function Page() {
  return (
    <>
      <PageIntro
        number="04"
        kicker="SIDE BY SIDE"
        title="Choose the questions, not a winner."
      >
        <p>
          Compare 2–4 exact variants. Put both weight definitions, accessories
          and missing fields on the same page.
        </p>
      </PageIntro>
      <Comparison />
    </>
  );
}
