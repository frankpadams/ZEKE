# ZEKE v0.6.5 — Mockup-Aligned UI Alpha

This release changes the visible shell instead of adding another DOM overlay.

## Primary changes
- Mockup-aligned, clean but data-dense dashboard shell.
- One unified Talk to ZEKE conversation surface.
- No separate Ask ZEKE / Your Discoveries / ZEKE Response input areas.
- Health at a Glance uses prominent numeric values and verified event data only.
- Trend charts require actual observations; insufficient data is shown honestly.
- Contextual + Log actions from health tiles.
- Natural language ambiguity clarification for inputs such as `BP 120 12 2`.
- Confirmation before saving interpreted structured entries.
- Duplicate review before saving highly similar recent entries.
- Persistent clarification-question indicator in the main conversation.
- Today’s Actions completion is scoped to confirmed current-local-day events.
- Today’s Actions scroll horizontally instead of clipping.
- Coach’s Eye remains prominent and uses recorded workout history.
- “I’ve been thinking…” remains prominent and conversational.
- Personal/family health context removed from the main dashboard.
- Sleep is represented under Health rather than a separate top-level domain.
- Dashboard remains a primary left-navigation destination.
- AI Connections connect/test services; no ordinary “use this AI” provider choice.
- Groq Free, Gemini, and OpenRouter Free remain visible in AI setup.
- Storage and calendar settings show current vs planned provider adapters honestly.

## Data integrity
No mock personal health values are hard-coded into the dashboard. Cards and charts read from the ZEKE event repository API exposed by the recovered core bundle. Empty/insufficient data states are displayed instead of invented values.

## Important alpha limitations
- This is still backed by the recovered compiled ZEKE core bundle, not yet the clean source reconstruction.
- Google Drive remains the only currently implemented storage connector in the recovered core.
- Google Calendar remains the only currently implemented calendar connector in the recovered core.
- Other provider choices are architecture/UI direction, clearly labeled as planned.
- Live AI provider success requires the user’s own credentials and provider availability.
- Automated Chromium screenshot acceptance could not complete in the build environment; syntax, asset references, static serving, and ZIP integrity were checked.
