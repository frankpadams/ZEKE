# ZEKE v0.6.4 — Feedback Integration Alpha

This release is an acceptance-oriented static alpha built over the recovered compiled ZEKE v0.5 core.

## Interaction corrections
- One main conversational surface on the dashboard.
- Legacy Talk/Tell/Ask/Discoveries/response cards are suppressed when the enhanced dashboard is active.
- Interpretation confirmation uses natural language rather than parser JSON.
- Ambiguous `BP 120 12 2`-style input prompts a natural clarification between blood pressure and bench press.
- Clarification questions can be deferred or ignored.
- A persistent question indicator keeps unresolved questions from disappearing into conversation history.
- Likely duplicates are checked before save; the user can keep both, keep only the existing entry, or cancel the new one.

## Today’s Actions
- Tiles are horizontally scrollable on narrow windows and touch devices.
- Completion is based on confirmed events for the current local calendar day.
- Historical completion is not carried forward.
- Clicking an action routes entry back into the main conversation.

## Dashboard and data integrity
- Dashboard cards use stored ZEKE repository events, not hard-coded personal values.
- Empty metric cards remain hidden by default.
- Health-at-a-glance metrics show current numbers first and trend charts only when there are at least two observations.
- Metric tiles include contextual + Log entry points that return to the main conversation.
- Personal and family health history is not displayed on the main dashboard.
- Coach’s Eye and “I’ve been thinking…” remain prominent.

## AI Connections
- Settings no longer ask the user to pick an active/default AI provider.
- ZEKE’s router chooses among connected providers based on task fit, privacy, availability, limits, fallback status, and free-first rules.
- Groq Free, Gemini Free, and OpenRouter Free are prominent connection options.
- Manual packet workflow remains available.

## Provider-agnostic settings direction
- Storage settings show Google Drive as available in this alpha and OneDrive, Dropbox, private SFTP/server, Nextcloud/WebDAV, and local-device adapters as planned.
- Calendar settings show Google Calendar as available in this alpha and Apple Calendar/iCloud, Outlook/Exchange, and CalDAV/ICS connectors as planned.
- Planned connectors are clearly disabled rather than falsely presented as operational.

## Known limitations
- This remains a static enhancement over the recovered compiled application, not the maintainable source-code reconstruction.
- Google silent reconnect is not fully solved in this static alpha.
- Only Google Drive and Google Calendar are operational connectors in the recovered core; other providers are architecture/UI placeholders and are labeled as planned.
- Live AI requests require the user to provide a valid API key/token for a supported provider. Provider-side free allowances and limits can change.
- API keys in this test build are stored in browser localStorage. This is not the intended production security architecture.
- The clarification queue is partially repository-backed; some context-derived questions are regenerated from missing schedule information rather than stored as full durable conversation objects.
