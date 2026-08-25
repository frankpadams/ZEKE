# ZEKE v0.48.0 Design Authority — Development Continuity

**Current authority review:** 2026-08-25 · runtime v0.48.0 build 2026.08.25.1 · governance 2026.08.25.2

The approved 2026-08-24 desktop mockup and v0.47 visual recovery remain the current presentation authority while v0.48 develops. Visual continuity may be refined, but the clean grid, compact information density, bounded iconography, and purpose-built mobile composition must not regress.

# ZEKE Design Authority — Whole Product UX

**Current authority review:** 2026-08-24 · runtime v0.47.0 build 2026.08.24.1 · governance 2026.08.24.6
**Status:** Binding visual/composition/interaction contract.

## v0.47.0 binding desktop visual reference

The exact reference image is `docs/design-authority/ZEKE-desktop-dashboard-reference-2026-08-24.png`. It is not sample decoration; it defines the desired **spatial grammar** for the desktop Dashboard. Functional data remains real and may differ, but the composition, spacing rhythm, icon language, compact density, hierarchy, blue/navy identity, and repeated alignment lines must remain recognizably faithful.

Required desktop Dashboard structure:
- first row: **Today’s Status · Next Up · Quick Actions**;
- second row: **Recent Activity · ZEKE Insights · Health at a Glance**;
- third row: **Timeline Snapshot · Goals**;
- compact contextual ZEKE tip/notice below when supported by real data.

The visual system must use recurring column guides and uniform gutters. Recent Activity and other summaries are bounded; empty/sparse modules consume less content internally rather than exploding in height. Health at a Glance uses a compact 2×2 metric unit when four metrics exist. Icons are controlled graphical UI components with explicit boxes and may never scale to container size.

**Rendered acceptance is binding.** A UI release does not pass merely because elements exist, CSS parses, or no horizontal overflow is detected. Representative browser screenshots must be inspected against this reference for alignment, spacing, density, icon size, typography, wrapping, dead space, and hierarchy.

Desktop and mobile may use different purpose-built compositions while preserving the same semantics and capabilities. Desktop presentation rules must not override the proven mobile presentation layer.


## v0.47.0 binding desktop visual reference

The exact reference image is `docs/design-authority/ZEKE-desktop-dashboard-reference-2026-08-24.png`. It is not sample decoration; it defines the desired **spatial grammar** for the desktop Dashboard. Functional data remains real and may differ, but the composition, spacing rhythm, icon language, compact density, hierarchy, blue/navy identity, and repeated alignment lines must remain recognizably faithful.

Required desktop Dashboard structure:
- first row: **Today’s Status · Next Up · Quick Actions**;
- second row: **Recent Activity · ZEKE Insights · Health at a Glance**;
- third row: **Timeline Snapshot · Goals**;
- compact contextual ZEKE tip/notice below when supported by real data.

The visual system must use recurring column guides and uniform gutters. Recent Activity and other summaries are bounded; empty/sparse modules consume less content internally rather than exploding in height. Health at a Glance uses a compact 2×2 metric unit when four metrics exist. Icons are controlled graphical UI components with explicit boxes and may never scale to container size.

**Rendered acceptance is binding.** A UI release does not pass merely because elements exist, CSS parses, or no horizontal overflow is detected. Representative browser screenshots must be inspected against this reference for alignment, spacing, density, icon size, typography, wrapping, dead space, and hierarchy.

Desktop and mobile may use different purpose-built compositions while preserving the same semantics and capabilities. Desktop presentation rules must not override the proven mobile presentation layer.


## 1. Whole-screen composition

The **screen is the unit of quality**. Components do not get to choose arbitrary page geometry. Layout primitives own column tracks, rails, readable widths, spacing, responsive behavior, and collapse/reflow rules.

Required behavior:
- no text-heavy card may collapse into an unreadably narrow column;
- no primary region may reserve large dead areas merely because a sibling is tall;
- empty/sparse states collapse to the information they actually contain;
- page content remains vertically reachable on cold load, navigation, resize, and refresh;
- whitespace is intentional, not leftover grid allocation;
- desktop and mobile share data/interaction semantics but may use purpose-built compositions.

## 2. Desktop Dashboard

Dashboard is a **cross-domain daily briefing**, not a compact Health page and not a wall of equally weighted cards. It should quickly answer:
1. How am I / what matters now?
2. What changed?
3. What should I do next?
4. What needs attention or clarification?

Preferred composition is a stable desktop shell with navigation rail, flexible main workspace, and optional bounded context rail. The main region uses deliberate rows/columns rather than free masonry. Health gets a selective snapshot; Fitness, Recent Activity, ZEKE Insights, Timeline/Upcoming, and Questions/Next Up receive appropriate weight.

### Visual language
- blue/navy is the structural brand backbone;
- restrained supporting colors distinguish domains/statuses;
- thin rules/dividers and aligned edges organize content without wrapping everything in oversized cards;
- varied card sizes reflect importance and content volume;
- stable icons, small status cues, and compact graphics help recognition before reading;
- sparklines answer “up/down/flat?” and expand into real detailed charts where useful.

## 3. Recent Activity

Recent Activity is a structured visual feed, not free-form prose blocks. A normal row communicates:
**visual category cue → event title → key value/result → date/time → status/trend**, with one concise secondary line when useful.

Stable identities should exist for workout, PT/rehab, sleep, measurement, medication, lab, injury/symptom, document, appointment, and other recurring event types. On desktop, an intentionally bounded scroll window is acceptable when it lets rows remain readable; on mobile, prefer natural page flow rather than nested scrolling unless a specific interaction requires it.

## 4. Talk to ZEKE

Talk to ZEKE uses predictable window states:
- **closed** — no overlay or scroll lock remains;
- **compact** — conversation available without unnecessarily covering the application;
- **expanded** — maximum useful conversation area with an obvious close control.

Close and expand/collapse are separate concepts. Controls always show a visible response. Conversation history, user draft, and relevant scroll position survive state changes where practical. The panel may not trap document scrolling, cover irreplaceable navigation, or leave stale `overflow`/scroll-lock state after close.

## 5. Questions for You / consequential decisions

Decision interfaces visibly acknowledge selection. Duplicate/reconciliation choices such as Same event, Separate events, Not sure, and Later are decision states; **Edit details** is a tool and is visually separated. The chosen state remains visible while persistence is working. Success/failure/undo or next-step state is explicit. A silent button press is a defect.

## 6. Exercise discovery — browse first

Search is supplemental, not the primary navigation dependency. Fitness discovery should prominently support:
- Recent;
- Favorites;
- PT/Rehab;
- body area;
- movement pattern;
- equipment/location context;
- recommended/available today where appropriate.

A user should be able to navigate **Body area → exercises → exercise → variation/history** without searching.

## 7. Exercise detail and body-area links

Internal wording such as “canonical exercise” is not useful primary UI copy. Exercise detail should show linked **primary and secondary body areas worked** (for example Back · Biceps). Body-area links open a useful body-area hub with anatomy/functional context, exercises where the area is primary or secondary, relevant PT/rehab, recent training, and known injury/symptom context.

Anatomy/injury relationships provide context. They do not automatically ban an exercise. Explicit clinician/PT restrictions, actual pain/response, range of motion, and observed tolerance remain separate inputs.

### Variation list
- order variations by meaningful recency/context rather than alphabetically;
- show each variation's latest useful performance directly (load × reps × sets and date where applicable);
- do not add redundant “Last,” “Current,” variation-count badges, or a duplicate latest-summary line when the visible rows already communicate those facts;
- clicking a variation focuses that variation while retaining the parent exercise context.

## 8. Exercise charts

Collapsed sparkline: fast trend recognition only.

Expanded chart:
- one parent exercise per chart;
- all relevant variations may appear simultaneously on shared chronological/load axes;
- variation series never connect to one another;
- missing load is omitted/gapped, never plotted as 0;
- one valid observation appears as one point;
- selected variation may be emphasized without hiding the comparison;
- point detail can expose date, variation, load, reps, sets, RPE/effort, pain, equipment/location, and notes where recorded;
- optional metric views (for example load, reps, volume, pain, RPE) must preserve truthful units and evidence.

## 9. Workout recommendation / planning

The workout planner is user-task-first, not an internal-system-state dump. A recommendation should normally show:
- what ZEKE proposes;
- concise duration/emphasis/context;
- a short **Why this** using decision-relevant evidence;
- Review/Edit/Start or Choose something else.

Detailed clinical map, tolerance reasoning, evidence classes, and progression logic are available on demand. Internal labels such as raw structure counts should not dominate the normal user view.

## 10. Progressive disclosure and density

Optimize for **comprehension per viewport**, not maximum records per viewport. Do not repeat a fact in multiple boxes when position/typography can communicate it once. Detailed evidence, provenance, biomechanics, and long explanations expand when wanted. Empty states become compact and explanatory rather than reserving populated-card dimensions.

## 11. Responsive composition

- Phone: focused task flow, natural vertical page scrolling, safe-area handling, touch targets.
- Tablet/narrow desktop: intentional reflow, not compressed desktop columns.
- Desktop: stable navigation + main workspace + optional context rail.
- Wide desktop: add breathing room or useful columns; do not infinitely stretch text lines.

Mobile is not desktop squeezed smaller, and desktop is not mobile stretched wider.

## 12. Rendered UX release gate

Every release renders representative routes at approximately 320, 375, 390, 430, 768/900, 1024, 1280, 1440, and wide-desktop widths where the environment supports them. Review must include hierarchy, alignment, readable widths, dead space, scroll reachability, sticky/floating controls, wrapping, visible action feedback, and state preservation—not only horizontal overflow.

Cold-load behavior is separately exercised. A refreshed page passing does not excuse a first-load failure.

## Historic visual references retained

### Mobile visual language
Historic reference: `ZEKE fitness app design mockup.png` (July 26, 2026). Retain its **dark navy ZEKE header**, blue visual language, **compact rounded white cards**, readable hierarchy, and mobile-first interaction quality. The old dedicated Gym/Gym Mode navigation is superseded.

### `+ Log Exercise` mobile page
Historic reference: `ZEKE Gym Mode Workout Tracker(1).png` (August 15, 2026). The filename/header is historical only. The authoritative pattern is normal `+ Log Exercise`: exercise + variation near top, integrated per-set editing, optional RPE/pain, compact Coach rationale, truthful Form Guide, and accessible Save without horizontal overflow.

### Canonical exercise analytics
Historic reference: `Fitness Library: Bicep Curl Analytics.png` (August 11, 2026). Its **shared multi-series chart** comparison concept remains authoritative; “Best Set Volume” is not a universal primary metric.

## Non-negotiable continuity phrases
- Do not reintroduce “Gym Mode.”
- One integrated set table remains the authoritative mobile entry pattern.
- The screen—not an isolated component—is the unit of visual quality.
- Search is optional; exercise browsing must work through body/context navigation.
- Exercise variations remain distinct series on shared axes.
- Visible user actions visibly respond.
