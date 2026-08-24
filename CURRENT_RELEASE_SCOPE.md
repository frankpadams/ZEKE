# ZEKE v0.47.0 — Current Release Scope

**Runtime build:** 2026.08.24.1  
**Governance revision:** 2026.08.24.6  
**Current authority review:** 2026-08-24 · runtime v0.47.0 build 2026.08.24.1 · governance 2026.08.24.6  
**Status:** implementation complete; package verification in progress; live-provider environment verification outstanding.

## Release purpose
v0.47.0 is a controlled UI recovery that **preserves functional progress**. It starts from the stable v0.45.1 recovery baseline and the reconciled v0.46.0 build 2026.08.24.2 functional donor, while excluding the failed later v0.46 presentation experiments. The approved 2026-08-24 desktop mockup is the visual authority for the Dashboard.

## Must preserve
- Unified Talk to ZEKE; explicit close/compact/expanded behavior; no stale scroll locks.
- Questions for You durable decisions plus immediate saving/selection/error feedback.
- Adaptive workout proposals, accepted proposal → editable active workout, workout-order/fatigue context, and adaptation of remaining work only.
- Browse-first exercise discovery; optional search; body-area links; injury/PT relationships; versioned anatomy/body-structure knowledge.
- Variation histories ordered by recency with load, reps, **sets**, date, and independent shared-axis chart series; missing load remains unknown.
- Short decision-relevant workout **Why this** first, deeper reasoning on demand.
- Generic PDF/image document intake, embedded text before OCR, classification/confidence/source preview, DEXA support, review-before-commit.
- Illness/injury intervals, medication reconciliation, staged Calendar privacy/consent, PT movement-specific visual guide gates, manual/connected AI paths, and provider-backed persistence boundaries.
- Purpose-built mobile workout/health flows and the v0.45.1 mobile Save Workout protection.

## Desktop visual recovery
- `docs/design-authority/ZEKE-desktop-dashboard-reference-2026-08-24.png` is the approved visual reference incorporated by `DESIGN_AUTHORITY.md`.
- Desktop uses one coherent dark-blue shell and a disciplined shared grid: **Today’s Status / Next Up / Quick Actions**, then **Recent Activity / ZEKE Insights / Health at a Glance**, then **Timeline Snapshot / Goals**, with a compact contextual tip.
- External gutters, card spacing, icon boxes, typography hierarchy, and density are controlled by the page visual system, not arbitrary component margins.
- Dashboard summaries are bounded by item count. Full histories remain in their domain pages.
- UI icons use controlled explicit SVG boxes. Generic or unconstrained SVG sizing rules are prohibited.
- Weekly workout planning remains available in Fitness rather than distorting Dashboard composition.

## Mobile continuity
Desktop geometry is not forced onto phones. v0.47.0 keeps a separate proven mobile Dashboard composition and existing mobile domain flows while the new desktop presentation layer is isolated behind desktop breakpoints.

## Verification required before packaging
- deep authority/continuity audit and negative controls;
- all active JavaScript syntax checks;
- package-local functional regression suite, including v0.45.1 and v0.46 carry-forward tests;
- Chromium renders of major desktop and mobile routes;
- Dashboard renders at representative desktop widths and 320/375/390/430/768 mobile widths;
- sparse/normal/dense/long-text adversarial Dashboard states;
- explicit oversized-SVG regression check;
- cold-load reachability and no horizontal overflow;
- final manifest/hash verification and clean ZIP re-extraction.

## Rejected forward presentation baselines
The v0.46.0 build 2026.08.24.3 and later failed mockup/UI experiments are retained only as failure evidence. Their presentation rules must not be merged forward.

## Environment boundary
Live Google Drive/Calendar and connected AI-provider behavior require the authorized deployed environment. Those checks are separate from the package-local UI/functional release gate.

## Preserved release contracts
- Generated spreadsheets are reports; canonical records and provenance remain governed by ZEKE's durable data model.
- Medication occurrence history remains part of the longitudinal record and reconciliation workflow.
- Package continuity requires verified functional carry-forward, governance reconciliation, and clean package re-extraction before release.
