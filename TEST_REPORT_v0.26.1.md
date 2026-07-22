# Test Report — ZEKE v0.26.1

**Build:** 2026.07.22.2  
**Release:** Fitness Navigation & Evidence Hotfix

## Package verification completed

The staged package was tested after implementation and metadata reconciliation.

### Static and deterministic checks

- `node --check assets/app.js` — passed.
- 16 package-local JavaScript regression files — passed.
- Protected real-workbook tests were not run because their external fixture was not supplied; this remains an environment check.

### Rendered Chromium workflow smoke

Passed on Dashboard, Fitness, Health, Questions for You, Discover, mobile Dashboard, and mobile Fitness.

The rendered test verified:

- Activity Library opens with Favorites selected.
- Approved selector order is Favorites, Recent, Strength, Cardio, Mobility/PT, Sports, Custom, All.
- The old Activity Library chip row is absent.
- Selector controls and the Activity Library panel do not overflow at 1440 px or 390 px viewport widths.
- Search filters to Seated Row.
- Activity details expand.
- Review relationships opens a Seated Row-specific modal and gives a specific insufficient-data explanation rather than a generic destination.
- Coach evidence opens direct PubMed sources and explains the personal trigger.
- A Dashboard trend remains open after a range change forces a full application rerender.
- Existing workflow, medication, sleep, goal, question, search, and mobile logging interactions remain functional.
- No page errors, unnamed visible controls, or visibly unbound controls were detected in the tested routes.

### Governance and package integrity

- Governance negative controls — passed.
- Project audit — passed with 0 errors and 0 warnings.
- SHA-256 manifest — regenerated and verified after final files were written.
- Final ZIP — reopened and compared against staging during packaging.

## Research sources wired into the application

- 2026 ACSM resistance-training overview, PMID 41843416.
- 2009 ACSM progression models position stand, PMID 19204579.
- 2022 acute sleep-loss and physical-performance meta-analysis, PMID 35708888.

ZEKE displays these as group-level research context, separately from the user’s records and from product-level conservative rules.

## Environment verification outstanding

This package does not establish live Google Drive, Google Calendar, AI-provider, deployed cache/service-worker, protected real-workbook, accessibility-device, or physical-device behavior.
