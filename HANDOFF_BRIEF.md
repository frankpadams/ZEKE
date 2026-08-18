# ZEKE Handoff Brief — v0.43.1

**Build:** 2026.08.17.1  
**Release label:** Mobile Professional Polish

Start with `00_AI_START_HERE.md`. The package is designed to stand alone without prior conversation history.

## What changed in v0.43.1

The runtime was not simplified. This pass corrected the phone interface around the existing v0.43 feature set. The authoritative mobile visual language is again dark navy / teal / white with compact, information-rich cards and clear hierarchy. Workout entry now resolves exact variation before variation-dependent coaching; exact-variation histories stay mechanically distinct; canonical charts display separate variation lines on shared axes; missing load is unknown rather than zero; per-set effort/pain is preserved; insufficient-data progression does not waste a large empty chart; and phone header/drawer/bottom-navigation/sticky-action geometry was corrected.

## Design authority

Read `DESIGN_AUTHORITY.md`. Do not reintroduce Gym Mode. Do not separate set display from set entry. Do not hide a required variation decision under optional details. Do not join unlike equipment histories into one line. Do not reintroduce the oversized mobile ZEKE center blob or duplicate floating action.

## Data authority

Canonical longitudinal JSON is source of truth. Generated XLSX/JSON outputs are reports. Calendar items are candidate evidence. Medication schedule assumptions are evidence-labeled occurrences, not confirmed administrations. DEXA is measurement provenance/method.

## Release status

Package-local mobile rendered verification passes across phone widths and the main workout/analytics regression paths. The broader release remains gated by the six missing PT visual guides plus physical-device/live-provider verification. Run `TEST_GUIDE.md`, `tests/mobile-professional-polish.test.js`, `tests/mobile-professional-polish.test.py`, the full JS suite, and `python tools/project_audit.py` before any further promotion.
