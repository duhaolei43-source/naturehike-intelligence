---
name: product-normalization
description: Normalize reviewed backpacking tent observations and prevent invalid comparisons.
---

# product-normalization

## Required inputs
The relevant public raw records, source registry, current code/SQL/config, and research question. Use private evidence only at the external AUDIT_ROOT when needed; never publish it.

## Procedure
Run typed contracts. Preserve regular/sale/unclassified prices, original prices, accessories and listing identity. Prefer official metric values; disclose rounding conflicts. Convert only source-provided imperial weight/area. Keep minimum/packed definitions separate. Enforce snapshot keys, variants, null reasons and source foreign keys.

## Expected outputs
Validated product observations and cohort eligibility with documented exclusions.

## Failure conditions
Zero imputation, mixed variants, unsupported floor-area estimation, missing evidence or invalid snapshot dates.

## Verification
Run the relevant contract/unit/integration checks and inspect the resulting records against the source and requested scope. Record uncertainty and failed checks in the external audit ledger. Read [methodology](../../../docs/METHODOLOGY.md) and [source policy](../../../docs/SOURCE_POLICY.md) when analytical definitions or publication scope change.
