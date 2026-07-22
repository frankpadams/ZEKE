# Test Report — ZEKE v0.26.0

**Build:** 2026.07.22.1  
**Package status:** Verification complete  
**Environment status:** Verification outstanding

## Verification summary

The staging directory and a freshly reopened ZIP were tested independently. The final ZIP was then reopened again, re-tested, checksum-verified, and byte-compared with staging.

### Syntax

- `node --check assets/app.js` — passed
- `node --check assets/parser.js` — passed

### Package-local JavaScript regressions

Fifteen regression files passed:

- activity foundation
- conversation security and editing
- Dashboard layout acceptance
- factor idempotency
- medication action status
- medication parser
- navigation/coaching/profile architecture
- release structure
- sleep and insight stabilization
- sleep data transaction
- trust workflow UX
- v0.26 regression contract (37 checks)
- workbook commit/verify
- workbook source replacement/backup
- workflow engine

The executable package-local total is fifteen after excluding the two protected real-data tests.

### Rendered Chromium workflow smoke

Passed on:

- Dashboard
- Fitness
- Health
- Questions for You
- Discover/Insights
- mobile-width Dashboard

Rendered interactions verified:

- open workflow resume
- explicit medication Taken/Missed/Not-yet choices and taken completion
- global sleep search
- Favorites default and activity detail opening
- goal structural review and provider-backed save
- workout RPE, pain, technique, and injury-context controls
- sleep selectors and sleep-specific editing
- monthly medication review
- reviewed medication backfill with existing-dose skip
- concrete review question content and Later preservation
- recurring medication schedule editor and save label
- visible controls had accessible names and bound interactions in the tested routes

### Other package checks

- Support & Improvement Report browser smoke — passed; anonymized workbook generated with 11 expected tabs and diagnostic-log clear behavior.
- Project audit — passed with 0 errors and 0 warnings.
- Governance negative controls — all passed, including stale identity, scope mismatch, constitutional conflict, wrong count, broken link, stale registry, contradictory gate, and lifecycle contradiction cases.
- SHA-256 manifest — verified for every package file except the manifest itself.
- ZIP extraction — one expected top-level release directory.
- Staging/reopened byte comparison — identical.

## Protected tests intentionally not run

- `tests/workbook-preflight.test.js`
- `tests/workbook-real-data-idempotency.test.js`

Both require an explicitly supplied protected fixture through `ZEKE_TEST_DATA_ROOT`. Their absence is not treated as a pass.

## Environment verification still required

Package-local evidence does not establish:

- live Google Drive persistence or cross-device refresh
- live Calendar integration
- live AI-provider routing, safety, quotas, or failover
- deployed service-worker cache replacement
- protected real-workbook behavior
- physical-device mobile save, sleep selectors, keyboard/zoom, or accessibility
- multi-account isolation or protected shared-AI infrastructure

## Release conclusion

The package is internally coherent and suitable for the owner’s next alpha deployment/test cycle, subject to the environment-verification boundary above.
