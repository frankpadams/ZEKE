# ZEKE v0.8.0 Milestone Alpha

Build: **2026.07.11.1**

## Release theme

**Personal Data Intelligence + AI-First Conversation**

This milestone focuses on a polished desktop dashboard and on making existing user history useful. It is not a demo-data release: production UI cards are driven by connected/imported records and unavailable metrics stay hidden.

## Major changes

- Dark-first polished desktop dashboard aligned with the approved ZEKE mockup.
- Light, Dark, and System appearance choices.
- Clean unfilled line charts by default; no filled area-chart default.
- Trend panels are omitted when there are not enough observations to support a trend.
- Health at a Glance uses latest verified values overall while range controls affect trend analysis.
- One persistent Talk to ZEKE transcript with both user and ZEKE messages.
- AI-first conversational interpretation when a connected AI service is available; deterministic validation and confirmation still protect the record.
- Context-aware clarification answers such as `1x/week, usually on Fridays` update the relevant schedule.
- Persistent clarification queue with Answer now, Later, I don't know, and Ignore.
- Date-scoped Today's Actions and horizontally scrollable action tiles.
- Duplicate review that distinguishes accidental duplicates from legitimate repeated events.
- Spreadsheet/JSON ingestion that writes accepted records into the same event repository used by the dashboard and Coach's Eye.
- PHAS/Health Cortex-oriented spreadsheet normalization for Measurements, Medication, Strength Training, Workout Log/Cardio, Supplements, Labs, Daily Log, and Injuries/Pain patterns.
- Excel serial date handling.
- Long-form lab and measurement normalization.
- Import reports with rows read, records imported, duplicate reviews, and clarification counts.
- Coach's Eye session aggregation for one-row-per-set strength logs.
- Deeper optional AI Coach analysis using actual exercise history and relevant context; AI cannot alter records.
- Stable provider-independent `workspace_id` in repository manifest.
- Persistent conversation and import batch history in the user-owned repository.
- Session-scoped Google access-token restoration for normal browser refreshes while the token is still valid; long-lived secrets are not stored in localStorage.
- Broad AI connection registry; the AI Router chooses among connected services. The user does not select an active/default model for ordinary use.
- Manual AI packet export/import remains available.
- Mobile Preview control included for design evaluation; desktop remains the primary milestone target.

## Important alpha limits

- Google Drive is the operational storage adapter in this build. OneDrive, Dropbox, WebDAV/Nextcloud, SFTP, and local-folder adapters are presented as planned, not functional.
- Google Calendar is the operational calendar connector in this build. Apple/iCloud, Outlook/Exchange, and CalDAV/ICS connectors are planned.
- Arbitrary spreadsheet changes are not yet continuously synchronized after import; import is currently an explicit ingestion action.
- Direct browser API-key use is an alpha convenience and has security tradeoffs. Provider metadata persists, but API keys remain in memory for the browser session. Secure relays are preferable for broader distribution.
- Live OAuth behavior and live AI credentials must be tested on the deployed GitHub Pages origin.
