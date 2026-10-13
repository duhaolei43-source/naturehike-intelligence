---
name: insight-audit
description: Audit marketing findings and recommendations against source evidence and reproducible calculations.
---

# insight-audit

## Required inputs
The relevant public raw records, source registry, current code/SQL/config, and research question. Use private evidence only at the external AUDIT_ROOT when needed; never publish it.

## Procedure
For each material claim record question, source IDs, method, finding, interpretation, alternative explanation, limitation, recommendation and KPI. Recalculate values from current inputs. Mark unexecuted initiatives as hypotheses and keep unsupported claims in CLAIMS_REGISTER.

## Expected outputs
Updated claims register and evidence-linked business/strategy reports.

## Failure conditions
Claim lacks provenance, experiment outcomes are invented, consumer preference is inferred from product specs, or source scope does not support the conclusion.

## Verification
Run the relevant contract/unit/integration checks and inspect the resulting records against the source and requested scope. Record uncertainty and failed checks in the external audit ledger. Read [methodology](../../../docs/METHODOLOGY.md) and [source policy](../../../docs/SOURCE_POLICY.md) when analytical definitions or publication scope change.
