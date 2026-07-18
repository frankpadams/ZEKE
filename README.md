# ZEKE v0.20.2

**Build:** 2026.07.17.11  
**Release:** Continuity & Adaptive Dashboard Release

ZEKE is a private, user-owned personal intelligence system. This release is built from the v0.19.2 baseline and adds a structural dashboard layout repair plus a built-in development continuity system.

## What changed
- Dashboard sections now live in independent rows, preventing a tall card from creating whitespace beneath an unrelated card.
- Empty visualizations do not reserve large chart canvases.
- Health metrics reflow responsively.
- A new `DEVELOPMENT_MEMORY` folder preserves decisions, failures, backlog, release gates, and handoff instructions for the next chat or developer.
- All active release identifiers are synchronized to v0.20.2 / 2026.07.17.11.

## Deploy
Replace the entire contents of the deployed ZEKE folder with the contents of this ZIP. Do not merge it with an older release. Clear the site cache or unregister the old service worker if the prior build remains visible.

## Verify after deployment
1. Confirm the UI shows v0.20.2 and build 2026.07.17.11.
2. Open Dashboard at desktop and narrow widths.
3. Confirm Health at a Glance occupies its own row and no unrelated blank column appears below a taller card.
4. Confirm empty trend areas are compact rather than large blank canvases.
5. Check Health, Fitness, Talk to ZEKE, Settings, and medication logging.

## Development handoff
A new chat, AI, or developer must begin with `DEVELOPMENT_MEMORY/README_FIRST.md`. The project should require little additional prompting when these files are followed.

## Known limitation
Live Google Drive, Calendar, and AI-provider integrations require the user's configured credentials and were not exercised in the local package audit.
