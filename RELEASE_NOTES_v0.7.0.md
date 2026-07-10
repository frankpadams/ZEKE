# ZEKE v0.7.0 — Repair Release
Build: 2026.07.09.1

This release replaces the brittle overlay/legacy-mount approach used in several earlier alpha patches with a standalone, source-maintained static application shell that reuses the existing ZEKE repository schema.

## User experience

- One unified **Talk to ZEKE** conversation surface.
- No separate Ask ZEKE, Your Discoveries input, or detached response area.
- Clarification, interpretation confirmation, correction, duplicate resolution, unanswered questions, and AI escalation occur in the same conversation.
- Ambiguous input such as `BP 120 12 2` produces a natural-language clarification instead of guessing or exposing parser output.
- Persistent “questions for you” indicator with Answer now, Later, I don't know, and Ignore behavior.
- Deferred questions do not immediately reappear in the open-question indicator.

## Dashboard

- Mockup-aligned clean, data-dense layout.
- Health at a Glance shows prominent verified values and only plots real event-repository data.
- Week, Month, Quarter, 6 months, Year, and All ranges.
- Hover details on graph points.
- Contextual + Log actions from metric cards.
- Coach's Eye analyzes repeated exercise records and shows evidence/reasoning in expanded view.
- “I've been thinking…” remains conversational.
- Personal & family health history is intentionally kept off the dashboard and appears under Health.
- Sleep is treated inside Health rather than as a separate top-level domain.
- Today's Actions is horizontally scrollable/swipeable and uses current-local-day confirmed events only.

## Data integrity

- No demo personal health values are embedded in production files.
- Confirmation is required before interpreted structured events are saved.
- Likely duplicate entries are checked before creating another structured data point.
- Corrections preserve an audit event rather than silently erasing the prior version.
- Spreadsheet import supports XLSX, JSON, CSV, and TSV.

## AI Router

- Groq Free / Developer is explicitly visible.
- Gemini and OpenRouter connections are also available.
- The current provider/model catalog exposes 11 model choices across the free-first connections.
- Connect & test validates a provider through the visible UI.
- The router chooses among connected services by task/capability and can fall back when a provider request fails.
- Manual AI packet export/import remains available.

## Settings architecture

- AI Connections configures access; it does not ask the user to choose an active AI.
- Storage UI shows Google Drive as available in this alpha and clearly labels OneDrive, Dropbox, Nextcloud/WebDAV, private SFTP, and Local Folder as planned adapters.
- Calendar UI shows Google Calendar as current and clearly labels Apple Calendar/iCloud, Outlook/Exchange, and broader standards-based paths as planned/currently limited.

## Important limits

- Real Google OAuth behavior must still be accepted on the deployed GitHub Pages origin.
- Real external AI calls require the user's provider credentials and provider availability.
- Direct AI keys are intentionally not persisted across a full page session restart in this browser-only alpha.
- Continuous spreadsheet synchronization is not yet implemented; the import path converts historical spreadsheet rows into ZEKE events.
- Non-Google storage adapters and non-Google calendar connectors are shown as planned, not falsely presented as operational.
- File/image interpretation directly from the conversation composer is not complete in this release.
- A durable encrypted offline pending-sync queue is not complete yet.
