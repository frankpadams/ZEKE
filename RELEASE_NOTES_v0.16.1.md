# ZEKE v0.16.1 — Question Resolution & Dashboard Recovery

## Questions & Clarifications
- Fixed the Questions page Answer button so it opens the selected question in the conversation with its actual resolution choices.
- Free-text answers now follow an apply-first, resolve-second transaction. A question remains open when ZEKE cannot safely translate the answer into the required data change.
- Failed answer attempts are retained on the open question instead of being mislabeled as resolved.
- “Separate events” now adds the held import candidate as a confirmed event.
- Blood-pressure “keep” and “reverse” choices now create the corresponding confirmed measurements before closing the question.
- Duplicate “keep one” explicitly leaves the candidate uncommitted while preserving the resolution evidence.

## Dashboard
- Added a render error boundary. A display exception can no longer leave a silently blank dashboard.
- The recovery screen states that stored data was not erased, shows the actual display error, and provides Retry and Data Integrity actions.
- Updated all static asset cache keys so GitHub Pages does not combine an old app script with the new release.

## Integrity rule
A clarification is only resolved after its promised data operation succeeds. Conversation acknowledgement alone is not considered resolution.
