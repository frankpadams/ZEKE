# Project Zeke v0.5.0 Alpha Test Report

Build date: 2026-07-06

## Automated tests

- Test files: 6 passed
- Tests: 13 passed

Covered areas include:

- local natural-language interpretation;
- trend calculations;
- historical import header/mapping detection;
- exercise analytics and injury/context-aware recommendation logic;
- storage runtime behavior;
- manual AI packet generation and response validation.

## Dependency audit at build time

`npm install` reported 0 known vulnerabilities in the installed dependency set at packaging time.

## Production build

`npm run build` completed successfully.

Vite emitted a performance warning that the main JavaScript chunk is larger than ideal. This is a performance optimization item for a later release; the build completed successfully.

## Static-host checks

The built static site was served through a plain HTTP static server for package validation. HTTP 200 was confirmed for:

- `/`
- `/zeke-config.js`
- `/alpha-connection-setup.html`
- `/ALPHA_GOOGLE_CONNECTION.md`
- `/AI_PACKET_WORKFLOW.md`

## Historical data import test

The importer was run against the supplied `SJN1 - Full Data Sheet.csv` source.

Detected:

- 1 sheet
- 419 nonblank data rows
- header row 6
- 31 recognized columns
- approximately 345 normalized events

Preview categories:

- measurement: 259
- lab: 43
- medication: 36
- workout: 2
- nutrition: 4
- note: 1

## Important uncompleted live test

A live Google OAuth login, Drive write/read/delete, and Calendar read test could not be executed in the isolated build environment because those operations require a Google-issued OAuth Web Client ID registered for the exact deployed Zeke origin and a real user authorization session.

The release includes real Google Identity Services / Drive API / Calendar API connector code and an in-app verification sequence. Live provider acceptance testing must be performed after the one-time application registration in `ALPHA_GOOGLE_CONNECTION.md`.

## Headless Chromium note

An attempted automated headless Chromium screenshot test timed out in the build container. No browser UI pass is claimed from that test. Unit tests, production build, static-host response checks, and historical import checks passed as described above.
