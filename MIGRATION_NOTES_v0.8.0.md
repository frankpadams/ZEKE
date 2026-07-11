# Migration Notes — v0.7.x to v0.8.0

ZEKE application updates should not replace user history.

## Repository continuity

v0.8.0 keeps the existing Google Drive `Project Zeke` repository structure and reads prior event, factor, discovery, action, preference, and AI metadata paths. The repository manifest moves to schema version 3 and preserves an existing `workspace_id`; if none exists, one is created once and retained.

New durable repository files include conversation history and import batch reports.

## Import behavior

Spreadsheet and JSON imports merge accepted records into the existing event repository. They do not replace the workspace. Likely duplicates are held for review when ambiguity remains. Missing cells are not converted into zeros.

## Deployment rule

Replace application files, not the user workspace. Keep a backup before alpha upgrades.
