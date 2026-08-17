# ZEKE Design Authority — Mobile & Fitness

This document converts the approved historic mockups and later user corrections into a package-local design contract. A developer should not need the prior chat to know which parts are authoritative and which are obsolete.

## Authority 1 — Mobile visual language

**Historic reference filename:** `ZEKE fitness app design mockup.png` (July 26, 2026).

Use its visual language: dark navy ZEKE header, light background, compact rounded white cards, teal/blue primary actions, crisp readable typography, clear bottom/side navigation, low clutter, and mobile-first information hierarchy. The old mockup's dedicated `Gym`/`Gym Mode` navigation is **superseded**. Do not reintroduce it.

The useful interaction model retained from this reference is: Home/Health/Fitness/Talk-to-ZEKE remain integrated; `Log exercise or activity` opens normal logging choices; single exercise/activity logging is not a special application mode.

## Authority 2 — `+ Log Exercise` mobile page

**Historic reference filename:** `ZEKE Gym Mode Workout Tracker(1).png` (August 15, 2026). The historic filename/header says Gym Mode, but the user explicitly superseded that terminology. The page is now the ordinary mobile `+ Log Exercise` screen.

Authoritative composition:

1. Exercise identity and selected variation near the top.
2. Variation chooser supporting known variation or `Create new variation`.
3. One integrated set table. The row itself is both the display and editing surface.
4. Each set independently supports load and reps. Set 1/2/3 do not need identical reps or load.
5. Effort/RPE and pain are optional per set. Absence means unknown/not entered, never zero.
6. Add/remove sets without opening a separate data-entry panel.
7. A visually prominent but compact ZEKE Coach card below/near the sets:
   - Last workout (same relevant variation when available)
   - Today's suggestion
   - `Why this recommendation?` evidence/rationale
8. A substantial high-quality Form Guide on the same page, showing setup, movement, key points/common mistakes, and correct imagery for the selected variation.
9. Coach and Form Guide may collapse to reduce clutter.
10. Do **not** add redundant Form/Tips buttons at the top when the content already appears below.
11. Sticky/clear save action, readable on a real phone, no horizontal overflow.

Visual target: attractive and polished, not dense. Controls must remain comfortably tappable. The production page should resemble the mockup's navy/teal/white language rather than generic form controls.

## Authority 3 — Canonical exercise analytics

**Historic reference filename:** `Fitness Library: Bicep Curl Analytics.png` (August 11, 2026).

The useful authority is the hierarchy and shared multi-series chart, not every example metric in the image. A canonical exercise (e.g. Bicep Curl) owns one tile/detail view. All recognized variations appear as separate labeled series on the same X/Y axes with distinct colors/legend entries. Variation histories remain mechanically distinct.

The mockup's `Best Set Volume` emphasis is **not** authoritative. Volume can be retained/calculated as a secondary metric, but it should not dominate mobile workout entry and must not be used as a universal cross-equipment comparison.

## Authority 4 — Vertical navigation / dashboard composition

Historic approved dashboard concepts established a dark/navy vertical navigation architecture on wider layouts and compact card hierarchy. On mobile/intermediate widths, the drawer remains vertically stacked. A compressed horizontal row of side-menu buttons is explicitly rejected.

## Current production verification

Automated rendered tests verify geometry, overflow, controls, Coach, Form Guide presence, and vertical navigation. They do not establish pixel-level acceptance. Before publishing, compare on a physical phone and preserve screenshots under `docs/design/reference-captures/` so future teams can compare current production to this contract.

### Non-negotiable continuity phrases
- Do not reintroduce “Gym Mode.”
- One integrated set table is the authoritative mobile entry pattern.
- Canonical exercise history uses a shared multi-series chart with each variation visibly distinct.
