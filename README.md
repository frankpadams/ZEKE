# Project ZEKE

**Current build:** v0.17.2-alpha · build 2026.07.16.6 · fingerprint `ZEKE-0172-REAL`  
**Current focus:** make ZEKE safe and useful for daily personal use before expanding advanced intelligence.

See [FEATURE_STATUS.md](FEATURE_STATUS.md) and [TEST_GUIDE_v0.17.2-alpha.md](TEST_GUIDE_v0.17.2-alpha.md).

## Current release

**ZEKE v0.17.1-alpha**  
**Build:** 2026.07.16.5  
**Release focus:** Conversation & Integrity — Verifiable Build

ZEKE remains in alpha stabilization. Do not treat this build as beta or as fully reliable for unattended data entry.

## Visible release verification

A successful deployment must visibly show:

- `v0.17.1-alpha · build 2026.07.16.5` on the initial loading splash.
- `v0.17.1-alpha` in the top application bar.
- The version and build at the bottom of the navigation sidebar.
- The same values in Settings → About this build.

If those values are absent, the browser or GitHub Pages deployment is still serving an older or mixed build.

## Current alpha focus

1. Data integrity and evidence-first workbook synchronization.
2. Transaction-scoped Review Queue rather than disconnected questions.
3. Active date context for historical entry.
4. Structured AI proposals that ZEKE validates before saving.
5. Direct structured entry from health and fitness tiles.
6. Daily workout grouping and prevention of empty workout shells.
7. Dashboard spacing and interaction-state consistency.

## Deployment

Upload the contents of this folder to the root of the ZEKE GitHub Pages repository, replacing files with the same names. Do not upload the enclosing folder itself.

After GitHub Pages finishes publishing:

1. Open ZEKE in a private/incognito window.
2. Confirm the splash screen says `v0.17.1-alpha · build 2026.07.16.5`.
3. Confirm the top bar displays `v0.17.1-alpha`.
4. If an older version appears, wait for deployment completion and hard-refresh. Do not test features until the correct version is visible.

## Important data rule

AI may propose structured interpretations. ZEKE must validate and commit them. AI output must never directly become canonical data or user-facing prose without ZEKE mediation.

## Known alpha limitations

- Review Queue aggregation and scoped resolution remain first-pass implementations.
- Natural-language imports require further end-to-end verification.
- Direct-entry controls do not yet cover every supported metric.
- Layout refinements remain ongoing.
