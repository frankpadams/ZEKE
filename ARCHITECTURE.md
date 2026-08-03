# ZEKE Architecture — v0.40.0

**Runtime build:** 2026.08.03.1  
**Governance revision:** 2026.08.03.1

## Product and data boundary

ZEKE is a private, user-owned personal knowledge and management system. The active provider-backed JSON repository is canonical. Historical workbooks and imports remain provenance only. Raw observations, confirmed records, corrections, supersessions, quarantined artifacts, derived insights, and UI state remain distinct.

AI interprets and proposes. Deterministic code and explicit user action govern canonical writes. Missing is unknown, not zero. A save is complete only after the active provider acknowledges it.

## Runtime dependency chain

The readable static files loaded by `index.html` are the **authoritative runtime**. There is **no compilation step**. Unreferenced root-level or archived code is **legacy** evidence and must not be treated as active merely because it exists in the repository.

The static app is loaded by `index.html`; there is no build step. Active local runtime files are listed in `BUILD_MANIFEST_v0.40.0.json` and `DEVELOPMENT_SYSTEM/ARTIFACT_REGISTRY.json`. The service worker uses one release-specific cache and removes earlier ZEKE caches during activation.

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
