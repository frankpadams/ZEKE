# ZEKE v0.30.0 Feature Status

## Implemented in this release

- Mobile bottom-navigation Gym entry
- Mobile workout entry with editable date
- Fitness logging action menu
- Common exercise chooser and library search
- One-at-a-time activity addition
- Provider-backed custom activity definitions
- Provider-backed routine templates and routine manager
- Dedicated condition entry and management path
- All-time chart range retained

## Partially implemented / content dependent

- Form Guide media sequences: reviewed lead images and written guidance exist for selected exercises; fully curated multi-image sequences remain incomplete.
- Secure cross-device AI vault remains architectural work.
- Additional storage-provider adapters beyond the current implementation remain future work.

---

## Prior continuity content

# ZEKE Feature Status — v0.29.0

**Runtime build:** 2026.07.25.1  
**Governance revision:** 2026.07.25.2

## Implemented in the v0.29.0 runtime

| Area | Status | Evidence / limitation |
|---|---|---|
| Mobile-focused Gym Mode shell | Implemented, package-tested | Structural/contract tests passed; physical-device acceptance outstanding. |
| Visible editable workout date | Implemented in Gym Mode | Cross-domain effective-date requirement remains incomplete. |
| Routine/manual/custom exercise start | Implemented as starter behavior | Provider-backed routine library and revisions are not implemented. |
| Explicit exercise states | Implemented | Suggested, Not started, In progress, Saved; deployed behavior still needs acceptance. |
| Primary-field prefill | Implemented | Uses most recent confirmed entry; optional details begin blank. |
| Per-set strength entry | Implemented | Load and reps editable per set; zero load/reps rejected. |
| Cardio-specific fields | Implemented for current profiles | Duration required; intensity may be blank or a range. Broader activity schema coverage remains incomplete. |
| Qualitative readiness UI | Implemented as heuristic | Numberless gauge and written categories exist; methodology is not yet research-reviewed. |
| Apply Recommended Progression | Implemented | Changes current unsaved form only. |
| Gym-contained history | Implemented structurally | Full rendered phone acceptance outstanding. |
| Save language | Implemented | Saving to storage → Saved; no Gym Mode Synced claim. |
| Local unfinished-entry recovery | Implemented for Gym Mode | Uses local browser storage; noncanonical and not guaranteed in private browsing. |
| Form Guide bottom sheet | Partially implemented | Reviewed-image subset and truthful fallback exist; true image sequence and complete media review manifest remain outstanding. |

## Governance locked but not implemented or not complete

- Provider-agnostic storage adapters and one-contract substitution beyond the current Google-oriented data layer.
- Secure cross-device AI credential vault, PIN service, and recovery flow.
- Multiple sleep segments per sleep day across Talk to ZEKE and direct entry.
- Visible editable effective dates on every workout, lab, vital, medication, sleep, symptom, and comparable entry screen.
- Separate spacious desktop Workout Entry experience.
- Provider-backed routine creation, editing, revision, and reuse.
- Research-supported versioned readiness methodology.
- Complete Form Guide movement sequences and human-reviewed media manifest.
- Physical iPhone 8-and-newer, representative Android, desktop, accessibility, and deployed-provider acceptance.

## Explicit non-claims

The v0.29.0 package is not evidence that non-Google storage works, AI keys are securely portable, sleep segmentation is complete, every Form Guide image/sequence is correct, or Gym Mode has passed real-device acceptance.

See `RELEASE_NOTES_v0.29.0.md` and `TEST_REPORT_v0.29.0.md`.
