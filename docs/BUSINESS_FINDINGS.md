# Business findings — research pilot

## Executive summary
The observed offers support transparent price/weight/accessory messaging. They do not establish demand, sales, market share or causal marketing effectiveness. The competitive dataset contains 30 source-verified specification records across 9 brands, including 27 verified display prices; three unbound Tarptent option prices remain null. All observations were collected on 2026-10-13. Real Trends exports are absent. Power BI model design is UNVERIFIED.

## Research questions and dataset coverage
RQ1 compares advertised two-person backpacking offers. RQ2 needs documented real Google Trends exports and remains incomplete. RQ3 turns observed differences into proposed experiments. The convenience sample contains 3 Naturehike, 3 Kelty, 3 REI Co-op, 1 The North Face, 4 MSR, 5 Big Agnes, 5 NEMO, 3 Mountain Hardwear and 3 Tarptent variants. Official retailer specifications are distinguished from brand-owned pages. Tarptent 3+ ratings are preserved separately; its unbound prices and non-comparable Typical weights are excluded from pricing/packed-weight analysis. Null fields and unresolved candidates appear in the raw records and exclusion log. Sold-out advertised listings are not assumed to be purchasable.

## Competitive landscape and opportunity I1: weight-definition clarity
**Question:** Is the Cloud Up upgrade mainly a minimum-weight change?
**Evidence:** nh-cloud-up-20d-source and nh-cloud-up-pro-standard-source; [Cloud Up](https://www.naturehike.com/products/cloud-up-2-person-ultralight-backpacking-tent), [Pro](https://www.naturehike.com/products/cloud-up-pro-2-person-ultralight-backpacking-tent).
**Method:** Subtract Pro weights/prices from base values, then divide changes by base. Minimum: 1380 − 1360 = 20 g, 1.45%; packed: 1800 − 1530 = 270 g, 15.00%; price: 159 − 119 = \$40, 33.61%.
**Finding:** The stated packed-weight improvement is substantially larger than the stated minimum-weight improvement.
**Interpretation:** A single "lighter" claim could obscure the buying trade-off. Communicating both definitions may improve informed consideration.
**Alternative explanation:** Changed included components or reporting conventions may explain some of the difference; manufacturer specifications are approximate.
**Limitations:** No physical weighing or customer response data; original Cloud Up option is sold out; no claim of equivalent durability or livability.
**Recommendation:** Test a side-by-side minimum/packed specification card against generic lifestyle copy.
**KPI:** Product-detail click-through rate with specification comprehension and qualified visits as secondary diagnostics.

## Competitive landscape and opportunity I2: explain the premium
**Question:** Does the published floor area explain the Half Dome premium over Trailmade?
**Evidence:** rei-half-dome-2-source and rei-trailmade-2-source; [Half Dome](https://www.rei.com/product/243702/rei-co-op-half-dome-2-tent-with-footprint), [Trailmade](https://www.rei.com/product/243611/rei-co-op-trailmade-2-tent-with-footprint).
**Method:** Same-brand, 3-season, freestanding, double-wall, footprint-included comparison. Price gap: 329 − 199 = \$130; relative gap: 130 / 199 = 65.33%. Both report 31.8 ft², two doors and footprint inclusion.
**Finding:** These three recorded features alone do not explain the price premium. Minimum and packed weight order also differ: Half Dome minimum is approximately 93.6 g higher, while packed weight is approximately 138.9 g lower.
**Interpretation:** Naturehike messaging can explain the actual product trade-offs rather than imply a generic value score.
**Alternative explanation:** Pole geometry, fabric, ventilation, warranty, customer support or perceived brand value may contribute; the small feature table does not measure them all.
**Limitations:** Current displayed color options are sold out; this comparison is not a causal decomposition of price or a recommendation that one tent is better.
**Recommendation:** Prototype a buyer decision card emphasizing declared specification differences and unmeasured factors.
**KPI:** Qualified comparison-to-product click-through and feature comprehension, measured only in a future authorized test.

## Competitive landscape and opportunity I3: disclose accessory scope
**Question:** Are headline prices complete-kit costs?
**Evidence:** nh-cloud-up-20d-source, nh-cloud-up-pro-standard-source, rei-trailmade-2-source, kelty-late-start-2-source; [Late Start](https://kelty.com/products/late-start-2p) explicitly sells its footprint separately.
**Method:** Compare documented footprint flags. Cloud Up and Pro: true; sampled REI tents: true; Late Start: false. Grand Mesa inclusion is unverified and remains null.
**Finding:** Accessory inclusion differs. Shipping and many complete-kit costs are missing, so a landed-cost ranking is not supported.
**Interpretation:** "What's included" disclosure may reduce comparison friction for beginners who do not know what a footprint is.
**Alternative explanation:** Some buyers already own a footprint or intentionally omit it, so inclusion may not increase willingness to pay.
**Limitations:** No consumer interviews, checkout data or accessory-use measurements.
**Recommendation:** Test concise included/optional accessory explanations; avoid claiming unverified total savings.
**KPI:** Accessory clarification interaction and informed product-detail engagement; no expected uplift is asserted.

## Consumer demand findings
Incomplete: no real Google Trends observations were provided. No seasonal campaign timing, brand demand ranking or market share statement is supported. The working CSV adapter and synthetic fixtures are engineering evidence only.

## Marketing recommendations
See MARKETING_STRATEGY.md for three NOT EXECUTED initiatives with customer hypotheses, design, metrics and decision criteria. Channels and segments are hypotheses rather than discovered customer behavior.

## Sensitivity, limitations and next research
Switching minimum to packed weight changes which sampled REI offer is lighter. Excluding the only verified sale listing (Mongar 210T, \$113 versus \$119 regular) changes the Naturehike assortment; it is not a population brand discount rate. Controlled gaps exclude incomplete cohort attributes; broad brand medians should not be interpreted as controlled comparisons. Resolve the three unbound variant prices and missing structures/component definitions, broaden the convenience assortment without replicating colors, obtain real Trends exports, and conduct independent usage and customer research before campaigns.
