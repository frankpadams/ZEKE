# AI / Developer Start Here — ZEKE v0.47.0

**Runtime build:** 2026.08.24.1  
**Governance revision:** 2026.08.24.6  
**Release:** Visual System Recovery + Preserved Functionality  
**Continuity review:** 2026-08-24 — deep recovery review complete before release verification.

This is the current Project ZEKE development baseline. v0.45.1 is the known stable recovery baseline; reconciled v0.46.0 build 2026.08.24.2 is the functional donor. The later failed v0.46 visual experiments are evidence only and are **not** forward presentation baselines. v0.47.0 preserves verified functional progress while replacing the desktop presentation layer with a mockup-authoritative, isolated visual system.

## Read in this order
1. `ZEKE_CONSTITUTION.md` — binding product principles.
2. `DEVELOPMENT_SYSTEM/AUTHORITY_AND_LIFECYCLE.md` — document authority/lifecycle rules.
3. `DEVELOPMENT_SYSTEM/GOVERNANCE_RULES.json` — machine-readable release invariants.
4. `DEVELOPMENT_MEMORY/PROJECT_STATE.json` — exact release/build/governance state.
5. `CURRENT_RELEASE_SCOPE.md` — what v0.47.0 must preserve and change.
6. `DESIGN_AUTHORITY.md` and `docs/design-authority/ZEKE-desktop-dashboard-reference-2026-08-24.png` — binding desktop visual direction.
7. `ARCHITECTURE.md` — runtime/data/presentation boundaries.
8. `DEVELOPMENT_MEMORY/ITERATION_HISTORY.md`, `CONTINUITY_HISTORY.md`, and `DEVELOPMENT_ERROR_LOG.md` — why this recovery exists and what must not recur.
9. `TEST_REPORT.md` and `DEVELOPMENT_MEMORY/RELEASE_GATE.md` — evidence and remaining boundaries.

## Non-negotiable recovery rule
Do **not** restore the failed v0.46 presentation experiments. Preserve the functional model and user-owned records, but treat the v0.47 desktop presentation layer as a replaceable view. Visual claims require actual browser renders; DOM presence, syntax, and overflow checks alone are insufficient.

## Current functional continuity
Carry forward the v0.45.1 integrated Fitness/adaptive-training/document/medication/calendar/PT foundation plus verified v0.46 improvements: Talk close/expand states, Questions feedback/persistence, browse-first exercise navigation, body-area/injury links, versioned anatomy knowledge, variation-aware shared-axis charts, and short-Why workout reasoning.

## Verification boundary
Package-local functional, governance, browser-rendered desktop/mobile, adversarial-layout, manifest, and archive checks must complete before this package is called release-ready. Live Google/AI-provider behavior remains an environment check.
