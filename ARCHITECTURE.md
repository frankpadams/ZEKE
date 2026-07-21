# ZEKE Architecture — Current v0.24.0 Baseline

**Build:** 2026.07.21.1  
**Release:** Trust, Conversation & Workflow

## Authoritative runtime
ZEKE is intentionally shipped as a directly editable static web application. There is **no compilation step** for the current release and no required `src/`, `package.json`, Vite, React, or bundler project.

The authoritative runtime files are:

- `index.html`
- `version.js`
- `assets/app.js`
- `assets/data-layer.js`
- `assets/parser.js`
- `assets/ai-router.js`
- `assets/workflow-engine.js`
- `assets/styles.css`
- `xlsx-bundle.js`
- `sw.js`

`index.html` is the source of truth for load order. `assets/workflow-engine.js` must load before `assets/app.js`.

## Legacy assets
Hashed files such as `assets/index-*.js`, `assets/Dashboard-*.js`, and `assets/index-*.css`, plus older versioned ZEKE scripts, are historical remnants from prior build systems. They are not loaded by the current `index.html`, must not be edited as the active application, and may be removed only through a separately reviewed cleanup release. The root-level `app.js` and `style.css` are also historical unless the active `index.html` explicitly references them.

## Core boundary
ZEKE is a private, user-owned personal-management system. Raw inputs, imported source material, provenance, corrections, and canonical records remain distinguishable. Missing data stays unknown. AI proposes; deterministic application code commits.

## Workflow engine
Every meaningful interaction can have one durable workflow transaction containing:

- user goal and original source;
- intended destination;
- known and missing information;
- proposed change;
- save, duplicate, and AI status;
- available next actions;
- status history and explicit outcome.

Terminal outcomes are `completed`, `not_saved`, `duplicate`, `dismissed`, `superseded`, or `failed`. A user-visible status explains whether anything was saved.

Full workflow content is mirrored into the user-owned ZEKE repository as `workflow_state` factors. Browser-local persistence contains only minimized operational metadata, not the personal source text or proposed health record. This preserves refresh continuity without creating a hidden local personal database.

## Conversation and review flow
1. Preserve the original input.
2. Attach it to the active workflow before interpreting a new standalone task.
3. Use deterministic interpretation first and connected AI only when useful.
4. Ask a purpose-driven clarification when a material decision is missing.
5. Show source, ZEKE’s understanding, proposed consequence, why it matters, and what ZEKE will do.
6. Commit only after the required confirmation.
7. detect duplicates before creation;
8. close with a visible saved, not-saved, duplicate, dismissed, or failed result.

The Review Queue and Conversation Memory are views of the same durable decision state rather than separate disconnected systems.

## Diagnostics and support
Settings → Diagnostics & Exports creates a privacy-filtered multi-tab Support & Improvement Report. It combines runtime errors, unresolved interactions, AI consultation history, corrections, UX feedback, potential health events, audit history, metrics, workflow history, and developer notes. Credential-like fields are excluded.

## Health and fitness boundaries
Measurements and labs store observations, not diagnoses. Potential Health Events preserve meaningful unstructured context provisionally. Calendar events can trigger follow-up but never prove attendance. Fitness recommendations use shared evidence, injury context when available, and explicit insufficiency language.

## Verification boundary
Local package verification cannot establish live credentials, external-service behavior, protected user fixtures, deployed cache behavior, or physical-device accessibility. Those remain environment verification items.

## v0.25 adaptive-context extension
The static runtime continues to use the existing event/factor/action stores and shared rendering system. The release adds no parallel data silo.

### Fitness capture
- `openWorkoutEntryModal(repeatLast)` supports a fast gym workflow and preloads the most recent same-day workout group when requested.
- Activity taxonomy determines visible entry fields and history columns. Strength, cardio, rehabilitation/PT, mobility, recovery, sport, and functional activities render relevant metrics only.
- Existing provenance, duplicate review, transaction grouping, confirmation, and user-owned storage boundaries remain intact.

### Provider presentation
- `providerPageHTML()` is a read-only presentation layer over existing records.
- PT, primary-care, and orthopedic focus tabs change emphasis, not source data.
- Provider View may be printed or saved as PDF by the browser. It labels limitations and does not create diagnoses, causality claims, or treatment directives.

### Progressive profile model
The local profile separates preferred name, pronouns, gender identity, sex assigned at birth, and optional clinically relevant anatomy/physiology context. These fields are optional and are not automatically substituted for one another in clinical logic.

### Beta boundary
The current package is still a directly editable static application. Shared centrally managed AI keys for multiple beta accounts require a protected server-side proxy or equivalent secret-bearing execution layer; they must not be embedded in the public browser bundle.
