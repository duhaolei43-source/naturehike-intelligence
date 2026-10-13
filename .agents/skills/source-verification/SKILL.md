---
name: source-verification
description: Verify official product or statistical source observations before ingestion.
---

# source-verification

## Required inputs
The relevant public raw records, source registry, current code/SQL/config, and research question. Use private evidence only at the external AUDIT_ROOT when needed; never publish it.

## Procedure
Review the original source and access conditions. Bind price/specs to the exact material variant and currency; record UTC retrieval, field labels, conflicting values and missing reasons. Retain permitted structured evidence outside Git, hash it and link source_id. Publish only concise factual observations.

## Expected outputs
Updated public source registry, factual product records and exclusion log; private evidence manifest.

## Failure conditions
Unavailable source, unclear variant binding, access restrictions, unreviewed reuse conditions or conflicting specifications requiring judgment. Leave unresolved fields null; exclude unresolved products rather than estimate.

## Verification
Run the relevant contract/unit/integration checks and inspect the resulting records against the source and requested scope. Record uncertainty and failed checks in the external audit ledger. Read [methodology](../../../docs/METHODOLOGY.md) and [source policy](../../../docs/SOURCE_POLICY.md) when analytical definitions or publication scope change.
