# ZEKE Architecture

## Premise

ZEKE is not a health app. ZEKE is a domain-independent personal knowledge system. Health is the first chapter.

## Layer model

```text
User Interface
    ↓
Chapters
    ↓
Story Engine
    ↓
Core Event / Entity / Relationship Engine
    ↓
Storage Adapters
    ↓
Integrations and AI Providers
```

## Core concepts

The Core knows universal concepts:

- Event
- Entity
- Relationship
- Observation
- Goal
- Recommendation
- Decision
- Task
- Document
- Source
- Evidence
- Timeline
- Chapter
- Privacy policy
- Confidence
- Review state

## Universal event flow

1. User tells ZEKE something.
2. Parser identifies intent and possible structured events.
3. ZEKE shows what it understood.
4. User reviews.
5. Approved events are written to the Story.
6. Timeline, graphs, patterns, and relationships update.

## AI flow

1. Can ZEKE answer internally?
2. If yes, answer without external AI.
3. If not, determine whether AI would help.
4. Apply privacy filter.
5. Consult configured AI provider if within policy.
6. Normalize AI response.
7. Present answer.
8. Ask before saving any Story update.

## Storage principles

- Append-only where practical
- Human-readable formats
- Exportable JSON and CSV
- Spreadsheet-friendly where useful
- No silent overwrites
- Corrections preserve history
