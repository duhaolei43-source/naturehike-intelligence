import type { Metadata } from "next";
import "@fontsource-variable/ibm-plex-sans";
import "@fontsource-variable/newsreader";
import "./globals.css";
import { AtlasProvider } from "@/components/atlas-provider";
import { CompareTray } from "@/components/shortlist";
export const metadata: Metadata = {
  title: {
    default: "Naturehike / U.S. Research Atlas",
    template: "%s / Research Atlas",
  },
  description:
    "An independent, evidence-linked study of two-person backpacking tent positioning, specifications and proposed growth experiments.",
};
const links = [
  ["Explore", "/explore/"],
  ["Compare", "/compare/"],
  ["Insights", "/insights/"],
  ["Demand", "/demand/"],
  ["Strategy", "/strategy/"],
  ["Method", "/methodology/"],
  ["About", "/about/"],
];
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#content">
          Skip to content
        </a>
        <AtlasProvider>
          <header className="site-header">
            <a href="/" className="identity" aria-label="Research Atlas home">
              <span className="identity-mark">△</span>
              <span>
                NATUREHIKE
                <span className="identity-sub">U.S. RESEARCH ATLAS</span>
              </span>
            </a>
            <nav aria-label="Main navigation">
              {links.map(([label, url]) => (
                <a key={url} href={url}>
                  {label}
                </a>
              ))}
            </nav>
            <span className="edition">FIELD EDITION / 01</span>
          </header>
          <main id="content" tabIndex={-1}>
            {children}
          </main>
          <footer>
            <div className="footer-title">Evidence before conviction.</div>
            <p>
              Independent, AI-assisted portfolio research. No Naturehike
              affiliation. Observed listings, not sales or physical test
              results.
            </p>
            <div>
              <a href="https://github.com/duhaolei43-source/naturehike-intelligence">
                Code & reproduction ↗
              </a>
              <a href="/methodology/">Sources & limitations</a>
              <span>Dataset / 2026-10-13-v1</span>
            </div>
          </footer>
          <CompareTray />
        </AtlasProvider>
      </body>
    </html>
  );
}
