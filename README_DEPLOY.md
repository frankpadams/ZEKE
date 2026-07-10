# ZEKE v0.7.0 Repair Release
Build: 2026.07.09.1

## Deploy to GitHub Pages

1. Extract this ZIP.
2. Upload the **contents** of the extracted folder to the GitHub Pages publishing root (normally the repository root for this project).
3. Commit the changes.
4. Wait for the Pages deployment to complete.
5. Open ZEKE and confirm the visible build label reads:
   `v0.7.0 · 2026.07.09.1`

The build identifier is visible in the sidebar and Settings/About, and a compact version badge remains available on narrow layouts.

## Data behavior

- Dashboard values come from ZEKE's connected event repository (`health/events.json`).
- No personal mock values are embedded in the production package.
- Historical XLSX, CSV, TSV, and JSON files can be imported from Settings → Import existing history.
- The importer maps common health/workout columns, preserves import provenance, and skips likely duplicates.
- Continuous two-way synchronization with an arbitrary Google Sheet is not yet implemented. The current release imports spreadsheet history into the ZEKE event repository.

## AI setup

Settings → AI Connections lets the user connect and test Groq, Gemini, and OpenRouter connections. ZEKE's AI Router decides which configured service/model to use for a task. There is no ordinary “active AI” selector.

Direct API keys are held in memory for the current page session and are not written to ZEKE's Drive JSON files or localStorage. The Manual AI Packet workflow remains available as a provider-neutral fallback.

## Storage startup

This static alpha stores only safe setup metadata in localStorage. Google access tokens remain in memory. On reload, ZEKE attempts silent authorization; if that cannot complete, ZEKE should show a simple reconnect screen rather than repeat the full storage setup flow.
