# ZEKE v0.25.0 Test Report
**Build:** 2026.07.21.2

## Verified locally
- Active JavaScript parses successfully with `node --check assets/app.js`.
- Project governance audit passes.
- Existing JavaScript regression tests pass.
- Activity-specific history column definitions are present for each supported activity category.
- Provider View route, navigation item, focus controls, and print action are wired.
- Repeat-last-workout control calls the preloading workout editor.
- Progressive profile fields save without replacing existing profile values.
- Version labels are synchronized in active runtime files.

## Environment verification still required
- Physical iPhone/Android gym entry usability and one-handed touch testing.
- Browser print/PDF layout with real records.
- Live Google Drive persistence and protected workbook regression.
- Live AI provider routing and failure logging.
- Multi-account beta isolation and centrally managed AI proxy (not implemented in this static release).
