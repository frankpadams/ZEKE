# ZEKE v0.23.0 — Conversation Intelligence & Trusted AI Foundation

**Build:** 2026.07.19.5

## Implemented

- Recent Health Record Review/Edit opens a record-specific editor instead of routing back to the Dashboard.
- Health-record corrections preserve prior values through the existing correction-history path.
- Pending correction flows are closed when an unrelated new health entry is detected, preventing stale edit state from capturing later messages.
- Direct affirmative replies such as “sure” are treated as answers to the active ZEKE question rather than as new records.
- Conversation transcript now renders date separators and message times.
- Added a provider-neutral background-consultation envelope with a fixed outcome allowlist. External AI output is treated as untrusted and cannot request execution, tools, commands, or unauthorized outcomes.
- Dashboard Health at a Glance rail is bounded-fluid rather than fixed-width.
- Added system-wide content-driven responsive composition rules so unrelated sections do not share forced row heights.

## Safety boundary

External AI can only return validated advice within an allowed outcome list. ZEKE retains exclusive authority over record writes and external actions. Prompt content is separated into trusted task instructions and untrusted user data.

## Known limitations

- This is the first vertical slice of the orchestration architecture, not the complete long-term Conversation Engine.
- The active-question detector currently uses explicit question/metadata cues and should be expanded with durable topic objects in later releases.
- Record-specific editing currently covers health measurements/labs and existing workout editing; medication-specific structured editing remains separate.
