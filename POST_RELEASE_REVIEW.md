# Package Review — ZEKE v0.41.0 RC1

**Build:** 2026.08.07.1  
**Parent deployed runtime:** v0.40.5 · 2026.08.06.5  
**Status:** package verified; not yet user-deployed/accepted

## What changed

The approved iteration focused on making ZEKE more useful at the moment of action and less dependent on internal/technical concepts:

- Exercise records distinguish movement family from exact variation/equipment/load basis.
- Old workout names can be reviewed non-destructively rather than silently rewritten.
- PT exercises use readable names plus familiar abbreviations, support distinct ER/IR logging, and expose richer rehab fields/form-guide help.
- Workout logging includes explainable exact-variation progressive-overload guidance and evidence access.
- Discover surfaces screened findings directly; Pattern Lab is secondary.
- Trends emphasizes current/recent momentum; Dashboard ranges live with the sections they control.
- Today, duplicate review, and medication adherence workflows were simplified around the user's actual decision/action.

## Verification completed

- Syntax and v0.41 structural checks passed.
- Rendered desktop/mobile workflow smoke passed without page errors or tested control/overflow defects.
- Support-report browser smoke passed.
- Governance negative controls passed.
- Broader JavaScript suite results are fully classified in `TEST_REPORT_v0.41.0.md`; no protected-fixture or obsolete historical assertion is represented as a pass.

## Verification still required after deployment

- Live Google Drive authentication plus durable write/readback.
- Physical mobile interaction acceptance.
- Real-history review of exact exercise variations and progressive-overload recommendations.
- User acceptance of revised Discover/Trends, duplicate review, Today, and medication adherence behavior.
- Remote exercise-media availability/fidelity in the deployed environment.

## Continuity instruction

Future work begins at `00_AI_START_HERE.md`. v0.41.0 RC1 is the current package candidate; v0.40.5 remains the rollback/deployed reference until the user verifies v0.41.0 in the live environment.
