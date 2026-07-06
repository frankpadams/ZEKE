# Project Zeke v0.3.0 Architecture

## Core principle

The application is browser-first and host-agnostic. The host serves code. The user's durable personal records live in storage the user controls.

## Layers

### Browser application

- React interface.
- Responsive dashboard.
- Quick capture.
- Event ledger cache in IndexedDB.
- Pending synchronization queue.
- Local deterministic analysis.
- Historical import parsing.
- Trend and evidence views.

### User-owned Google storage

- `Project Zeke Data` spreadsheet.
- Event ledger plus structured projections.
- Discoveries.
- Dashboard configuration.

### Optional integrations

- Google Calendar read-only.
- Apple Health import / bridge.
- External AI proxy endpoint.

## Data flow

```text
User action
  ↓
Browser event ledger + pending queue
  ↓
Immediate dashboard update
  ↓
Google synchronization when authorized
  ↓
Project Zeke Data in the user's Google account
```

On another device:

```text
Open browser app
  ↓
Authorize Google account
  ↓
Discover Project Zeke Data
  ↓
Pull events and state
  ↓
Render dashboard
```

## Historical import flow

```text
CSV / TSV / XLSX / JSON / Google Sheet
  ↓
Workbook inventory
  ↓
Header-row detection
  ↓
Known-column mapping
  ↓
Preview counts and destinations
  ↓
User approval
  ↓
Duplicate filtering
  ↓
Event creation with provenance
  ↓
Import batch history
  ↓
Google synchronization
```

## Evidence model

Every structured event preserves:

- source;
- timestamp;
- raw text;
- structured interpretation;
- schema version;
- import batch ID when applicable;
- source file;
- source sheet;
- source row.

Dashboard trends are views over events. Evidence drill-down exposes dated points and sources rather than treating a generated narrative as primary evidence.

## Expandability

The event core is domain-agnostic. Health is the first deeply implemented module. Pets, Vehicles, House, Finances, and Projects are reserved modules that can add domain schemas without replacing the event ledger.
