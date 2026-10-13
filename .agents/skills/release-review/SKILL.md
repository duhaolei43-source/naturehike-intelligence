---
name: release-review
description: Verify public repository releases while preserving external private audit records.
---

# release-review

## Required inputs
The relevant public raw records, source registry, current code/SQL/config, and research question. Use private evidence only at the external AUDIT_ROOT when needed; never publish it.

## Procedure
Inspect Git status, tracked/staged filenames and diff. Rebuild public exports, validate contracts, run Ruff/SQLFluff/tests/reproducibility, the release guard and Gitleaks. Confirm no private files, secrets, full captures or synthetic results. Inspect actual dashboard pages, state Power BI status and verify CI on the PR before claiming success.

## Expected outputs
Reviewable feature-branch commit/PR, verification summary and local audit checkpoint.

## Failure conditions
Any failed check, stale export, unsafe tracked file, unsupported claim, missing review or absent remote evidence for CI/release.

## Verification
Run the relevant contract/unit/integration checks and inspect the resulting records against the source and requested scope. Record uncertainty and failed checks in the external audit ledger. Read [methodology](../../../docs/METHODOLOGY.md) and [source policy](../../../docs/SOURCE_POLICY.md) when analytical definitions or publication scope change.
