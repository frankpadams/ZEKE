# ZEKE v0.25.2 — Mobile Workout Save Hotfix

## Fixed
- Reworked Gym Logging save handling for mobile browsers.
- Save now responds immediately with “Checking…” and then “Saving…”.
- Added a direct click handler in addition to form submission handling.
- Moved duplicate-check failures into a non-blocking warning path.
- Added a safe transaction-ID fallback for browsers without `crypto.randomUUID()`.
- Any save failure now appears visibly inside the workout form instead of failing silently.

## Scope
This is a focused hotfix based on a real mobile failure reported against v0.25.0. It does not attempt additional dashboard redesign work.
