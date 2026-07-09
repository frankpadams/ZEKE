# Project ZEKE v0.6.2 UI Compliance Alpha

This patch follows a direct UI audit against the product handoff and July 9 design feedback.

## Changes

- Makes the enhanced dashboard full width instead of squeezing it into the legacy left column.
- Hides the legacy right rail after the enhanced dashboard successfully loads.
- Uses human-readable time ranges: Week, Month, Quarter, 6 months, Year, All.
- Hides empty metric/chart cards by default.
- Adds a visible dashboard Customize control for metric and card visibility.
- Adds a conversational first-use tracking prompt for prescribed medications, supplements, injections/treatments, protein shakes, creatine, and custom recurring items.
- Stores confirmed tracking choices in the connected ZEKE factor repository rather than treating them as permanent browser-only health records.
- Adds Personal & family health history wording and supports historical personal context as well as relatives.
- Adds an upcoming-events card with both date and time.
- Renames the dashboard AI control to AI Assist while retaining the AI Router behind it.
- Fixes chart hover tooltip positioning by anchoring tooltips to the chart container.
- Preserves confirmation-before-save for interpreted entries.
- Keeps Groq Free as a prominent quick-start AI option.

## Known gaps not represented as complete

- Google silent reconnect/no-repeat-wizard behavior is not fully solved in the recovered v0.5 compiled core.
- Universal Capture is not complete: text is integrated, but voice/image/file capture is not yet unified in the Talk to ZEKE field.
- A durable Knowledge Inbox and full Interpretation Log are not yet complete in this static enhancement layer.
- Offline pending sync queue is not yet implemented.
- Discovery logic includes evidence-linked coaching and selected research-aware context, but a general statistical/clinical significance engine is not yet complete.
- Storage choice remains Google-centric in the recovered alpha core; provider-neutral future adapters remain required.
