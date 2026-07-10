# ZEKE v0.7.0 Test Report
Build: 2026.07.09.1

## Browser-render acceptance

Tested with system Chromium in headless mode using a test-memory provider and synthetic non-production seed data.

Passed:
- standalone app shell renders
- exactly one Talk to ZEKE surface
- no Ask ZEKE duplicate input
- Health at a Glance visible
- Coach's Eye visible
- “I've been thinking…” visible
- build identifier visible
- family-history section absent from dashboard and present under Health
- Today's Actions overflows horizontally rather than clipping
- previous-day atorvastatin event does not mark today's action complete in America/New_York timezone
- `BP 120 12 2` asks blood pressure versus bench press
- selecting blood pressure asks for explicit systolic/diastolic values
- `120/82` then produces a natural-language confirmation
- clarification answer can create a recurring schedule/action
- Groq Free / Developer appears in AI Connections
- no ordinary active-provider selector
- responsive dashboard becomes single-column at narrow viewport
- no browser page errors during the acceptance flow

## AI Router acceptance

Using mocked provider HTTP responses:
- provider connection/test path passed
- live question through the visible Talk to ZEKE composer returned AI output
- Groq failure followed by OpenRouter fallback successfully returned the fallback response
- no browser page errors occurred

This validates routing and UI behavior, not live third-party credentials or provider uptime.

## Storage startup acceptance

Using mocked Google Identity Services and Drive responses:
- stored safe setup metadata triggered a silent authorization request with empty prompt
- successful silent authorization produced `connected`
- failed silent authorization produced `reconnect-required`
- failed silent authorization did not return to first-time storage setup

This validates ZEKE's startup-state logic. Real deployed-origin OAuth acceptance remains necessary.

## Spreadsheet import acceptance

A test XLSX workbook with Vitals and Workouts sheets was imported.

Passed:
- XLSX reader loaded
- common metric columns mapped to measurement/lab events
- workout row mapped to a workout event
- blank spreadsheet cells did not create zero-valued fake measurements
- import result message remained visible after data refresh
- no browser page errors occurred

## Static integrity

Passed:
- JavaScript syntax checks for data layer, parser, AI router, and app
- all local references from index.html exist
- ZIP integrity test
- package contains no test seed data
