> **Historical/supporting document:** This architecture background is retained for context. It does not control the active release or override `00_AI_START_HERE.md` and `DEVELOPMENT_MEMORY/PROJECT_STATE.json`.

# Project Zeke v0.5.0 Alpha Architecture

## Alpha scope

This release is intentionally single-user for the alpha test. It connects to one existing Google account through a real Google OAuth browser flow.

The alpha user experience is:

1. acknowledge data ownership and limits;
2. connect the existing Google account;
3. Zeke creates or reopens its Project Zeke Drive repository;
4. Zeke verifies Drive write/read/delete;
5. Zeke verifies read-only primary Calendar access;
6. optional historical import;
7. AI choice, including the manual AI packet workflow;
8. enter the Health module.

## Persistence boundary

The browser is an interface and temporary in-memory analytical workspace. Personal records are not persistently stored in localStorage, sessionStorage, IndexedDB, or Cache Storage.

Durable personal data is written to the connected Google Drive repository.

## Canonical repository

Conceptual hierarchy:

Project Zeke/
- system/
  - manifest.json
  - preferences.json
  - dashboard-layout.json
  - actions.json
  - ai-connection.json
  - ai-exchanges.json
- health/
  - events.json
  - discoveries.json
  - investigations.json
  - injuries.json
  - factors.json
  - exercise-catalog.json
  - documents/
- imports/
  - batches.json
  - originals/
  - reports/
- pets/
- vehicles/
- house/
- finances/
- projects/

Health is the first deep-intelligence module. The core remains domain-agnostic for future modules.

## Event ledger

Raw observations and imported facts are represented as events with stable IDs, timestamps, raw text, structured interpretation, schema version, and provenance. Derived charts, narratives, recommendations, and AI findings are replaceable views.

## Historical import

Supported alpha file formats: CSV, TSV, XLSX, JSON, plus directly downloadable URLs.

The importer:

- inventories sheets;
- detects headers;
- maps known fields deterministically;
- shows ambiguous mappings;
- previews normalized events;
- waits for user approval;
- preserves file/sheet/row provenance;
- copies the original source file to Drive;
- records an import batch;
- supports batch undo without deleting the preserved original.

## AI architecture

Tier 0: Zeke Local for deterministic analysis.

Tier 1: Manual AI packet exchange. The packet is task-specific and includes a response schema. Uploaded AI responses are reviewed before selected findings, discoveries, investigation questions, or actions are applied.

Tier 2+: Optional direct provider integrations through a secure relay. Private AI API secrets are not embedded in the public browser application.

## Exercise intelligence

The Health module supports exercise progression views by exercise and muscle group. Recommendations consider available progression variables plus active injuries, pain trends, recovery measurements, and other exercise-relevant health factors. Recommendations are conservative decision support and are evidence-linked.


## v0.20.3 compatibility supplement
For the active release, Google Drive remains the canonical durable repository. Connected-workbook synchronization is a reviewed transaction: read, normalize, compare, preview, explicit commit, persisted verification, then separate mirror regeneration. Event writes receive a pre-write repository backup; a replaced connected source receives its own archival copy before overwrite. The original connected workbook is never rewritten merely to synchronize ZEKE events. Transaction stages are preserved in the append-only import history.
