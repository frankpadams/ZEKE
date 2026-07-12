# ZEKE v0.13.0 — Beautiful Dashboard & Integrity Preview

## Visible changes
- Moves the enhanced Talk to ZEKE conversation to the top of the dashboard and gives it more reading space.
- Redesigns Health at a Glance with restrained metric-specific color, stronger typography, clearer hierarchy, and richer interactive cards.
- Reworks the phone layout so metric cards remain readable instead of collapsing into slivers.
- Makes Settings and Data Integrity directly available in the five-item mobile navigation.
- Makes narrow-screen range controls horizontally scrollable without overlapping the page.

## Data correctness
- Keeps stairclimber duration and steps paired by dated session before choosing the latest record or calculating change.
- Shows the comparison dates used for stairclimber step change.
- Detects the known `Normal 80-100` reference-range import artifact and excludes it from metric charts.
- Detects clarification text leaked into workout raw evidence and surfaces those records on Data Integrity for review.
- Does not silently delete or rewrite flagged records.

## Scope
This is an evening evaluation build focused on dashboard presentation, mobile usability, and visible integrity safeguards. It does not yet implement the future encrypted Drive credential vault, Apple Health bridge, or the complete product-feedback handoff registry.
