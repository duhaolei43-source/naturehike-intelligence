# Claims register

| ID | Class | Claim | Evidence / calculation | Status |
|---|---|---|---|---|
| C1 | Observation | 30 source-verified specification records across 9 brands; 27 prices | raw product IDs; mart_data_quality | Verified pilot |
| C2 | Observation | Cloud Up Pro reports 20 g less minimum and 270 g less packed weight | nh-cloud-up-20d-source; nh-cloud-up-pro-standard-source; subtraction | Verified source values, approximate specs |
| C3 | Observation | Half Dome and Trailmade report same floor area but \$130 price gap | rei-half-dome-2-source; rei-trailmade-2-source | Verified source values |
| C4 | Observation | Footprint inclusion differs by sampled offer | I3 source flags; Grand Mesa unknown excluded | Verified populated flags |
| C5 | Interpretation | Clear component definitions can make comparisons more understandable | I1–I3; no customer evidence | Plausible, untested |
| H1 | Hypothesis | Dual-weight card improves qualified consideration | M1 design | Proposed, not executed |
| H2 | Hypothesis | Feature comparison improves consideration | M2 design | Proposed, not executed |
| H3 | Hypothesis | Inclusion checklist improves comprehension | M3 design | Proposed, not executed |
| X1 | Unsupported | Naturehike has higher sales or market share | No sales data | Prohibited |
| X2 | Unsupported | Brand search rankings or seasonal demand peaks | No real Trends export | Incomplete |
| X3 | Unsupported | Functioning Power BI report / DAX parity | No supported runtime validation | UNVERIFIED |
| X4 | Unsupported | Marketing uplift, CAC or ROAS | No executed campaign | Prohibited |

The report and dashboard use these classifications. Review new claims against raw field evidence, current marts, cohort boundaries and alternative explanations before publication. Review changes to sources, product coverage or extraction rules as new observations, not silent edits to history.

## Public website extension
The static web experience implements the existing claims and missing-input statuses; it adds no market-share, demand or realized marketing-outcome claim. Price-weight labels use one complete filtered cohort and one weight definition. Broad descriptive views and singleton eligible sets have no efficiency badge. The source-verification badge does not certify performance or completeness. See WEB_EXPERIENCE_SPEC.md and WEB_QA_REPORT.md for bounded implementation evidence.
