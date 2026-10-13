# Outdoor research atlas

Two directions were sketched in [design-directions.svg](docs/design-directions.svg): (A) an illustrated field atlas with light surfaces, a component schematic and evidence stories; (B) a compact gear bench with instrument-like panels. A was selected for the 90-second recruiter journey, while denser bench-style panels serve the analyst explorer. This is an original project identity, not Naturehike corporate branding.

## Tokens
- Ink `#173247`, paper `#FAFCFE`, mist `#E8F0F5`, muted `#486276`.
- Text teal `#12696E` and amber `#945308`. The proposed original teal/amber failed small-text contrast on mist/warm callouts and were darkened after the first axe run. Original teal may remain in chart marks and artwork; labels use ink.
- Self-hosted IBM Plex Sans Variable for UI; Newsreader Variable for editorial headings. SIL OFL licenses ship with the artifact.
- 1320px reading container; 4px control radius; 1px field-rule borders; tabular numeric cells.
- Original SVG illustrations explain components and weight definitions. Generic graphics are never exact-SKU photographs.

## Interaction and composition
Every panel answers a question: scatter = price/weight; dot spread = selected assortment; feature table = raw differences; dossier = variant evidence; comparison = aligned facts; missingness = absent inputs; strategy flow = proposed measurement. No decorative demand/geographic/funnel charts.

Small client islands own browser filters and evidence dialogs. Most narratives prerender. The scatter engine is explicitly loaded on request, with an SVG renderer and table/checkbox equivalent. No continuous motion; reduced-motion removes scrolling animation and transitions. Drawers use Radix focus management with Escape/return-to-trigger checks.

## Review
Desktop/mobile/zoom screenshots are in `outputs/public/web/screenshots/`. Automated checks cover 360, 390, 768, 1440px and a 200% CSS-zoom layout; CSS zoom is a layout proxy, not certification across every browser's native zoom implementation. Keyboard and touch cases are checked independently. No WCAG certification is claimed.
