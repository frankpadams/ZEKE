# ZEKE Architecture — v0.41.0 RC1

**Runtime build:** 2026.08.07.1  
**Governance revision:** 2026.08.07.1

## Product and data boundary

ZEKE is a private, user-owned personal knowledge and management system. The active provider-backed JSON repository is canonical. Historical workbooks and imports remain provenance only. Raw observations, confirmed records, corrections, supersessions, quarantined artifacts, derived insights, and UI state remain distinct.

AI interprets and proposes. Deterministic code and explicit user action govern canonical writes. Missing is unknown, not zero. A save is complete only after the active provider acknowledges it.

## Runtime dependency chain

The readable static files loaded by `index.html` are the **authoritative runtime**. There is **no compilation step**. Unreferenced root-level or archived code is **legacy** evidence and must not be treated as active merely because it exists in the repository.

The static app is loaded by `index.html`; there is no build step. Active local runtime files are recorded in the current v0.41.0 build manifest/provenance artifacts; historical manifests remain audit evidence. The service worker uses one release-specific cache and removes earlier ZEKE caches during activation.

## Integrity architecture

`assets/integrity-engine.js` scans canonical JSON for narrowly defined candidates such as exact duplicates, known import artifacts, implausible sleep duration, zero-as-missing heart rate, malformed paddling fields, answered questions, and stale or duplicate discoveries.

`assets/data-layer.js` applies only user-approved repairs. Before mutation it creates a provider-backed integrity backup. Repairs preserve IDs, provenance, reason, supersession/quarantine state, and a correction audit record. Session undo restores the pre-repair event/factor/discovery state. No distance or other missing fact is invented.

## Dashboard and visual truth

The dashboard follows the approved lighter information-dense direction: story cards, Health at a Glance, weekly plan, Coach’s Eye, recent activity, and review status. Quantitative visuals are generated from recorded points. Unsupported routes, trends, or correlations are omitted or replaced with an explicit insufficient-data state.

## Mobile architecture

Mobile is the same application and information architecture, responsively prioritized for quick navigation, low-friction structured or natural-language entry, clear completion/exit paths, repairs, questions, coaching, and form guides. A workout can have contextual logging controls, but there is no separate gym-only application.

## Fitness knowledge architecture

`assets/knowledge-base.js` supplies shared equipment-aware exercise/activity objects and routines. Global knowledge is separate from user history. Each object can contain movement family, equipment, muscles, setup, execution, mistakes, breathing, mind-muscle cues, modifications, evidence metadata, and media provenance. High-use objects are manually curated; lower-priority objects use cautious normalized templates pending deeper evidence review.

User-specific load, reps, pain, technique notes, injury context, preferences, and progression remain in canonical user records. Machine, Bowflex, dumbbell, barbell, Smith, cable, and bodyweight variations remain distinct while sharing broader movement families.

## Storage and provider boundary

Google Drive remains the active implemented provider. Provider-neutral semantics remain binding, but adapters for OneDrive, Dropbox, and other providers are not implemented in this release. Temporary local UI recovery is noncanonical and excluded from analysis.

## Verification boundary

Automated package and rendered-browser evidence does not establish physical-device behavior, live provider permissions, remote-media availability, or clinical validity of personalized recommendations. Those remain explicitly labeled environment/content verification.


## v0.41.0 fitness identity and intelligence architecture

Workout identity now separates a broad movement/exercise family from the exact performed variation. New structured workout records may carry `exercise_family`, `variation_name`, `variation_id`, `equipment_type`, `load_basis`, `identity_schema_version`, and identity confidence. The original `exercise` value remains the human-entered/displayed record and is not destructively normalized.

Progression histories and next-session targets operate on exact variations. Cross-equipment loads are never automatically converted or merged. Historical records without sufficient equipment evidence remain unspecified until the user reviews a proposed mapping; accepted mappings are applied as corrections/metadata while preserving raw/provenance history.

The progressive-overload planner is deterministic and explainable. It considers comparable load/repetition history, RPE/RIR when available, pain/injury/PT context, and long gaps. Research evidence can support the rule but does not replace user performance or clinician guidance.

Discover applies a screening layer after mathematical association calculation. Tiny samples, cross-exercise workout correlations, same-activity metric artifacts, and strong shared time trends are suppressed from the primary user-facing feed unless a conceptually meaningful relationship justifies surfacing them. The advanced pattern view remains available for inspection.

Medication adherence assumptions are opt-in per medication schedule. Generated expected-dose records use a distinct assumed interpretation/provenance state and can be converted to explicit confirmation or corrected/undone when the user reports a missed, delayed, changed, or extra dose.
