# Project Zeke v0.5.0 Alpha — READ THIS FIRST

This alpha release is for one real alpha user. It is designed to run in a browser and connect to that user's existing Google account.

## What this release is intended to test

1. Real Google sign-in from the Zeke setup wizard.
2. Real Project Zeke folder creation inside the connected user's existing Google Drive.
3. Real read/write/delete verification against that Drive.
4. Read-only access to the connected user's existing primary Google Calendar.
5. Historical health data import into the Zeke repository after mapping review.
6. AI choice workflow: Zeke Local, direct provider connection where enabled, or the manual AI packet workflow.
7. Dashboard, evidence drill-down, health logging, Today's Actions, exercise analytics, injury/context-aware progression suggestions, discoveries, and Ask Zeke.

## Important external prerequisite

Google will not authorize an independently hosted browser application until the application has a Google-issued Web OAuth Client ID for the exact web origin where it is hosted. That ID identifies the Project Zeke browser application; it does not create a new Google account, Drive, or Calendar.

Complete `ALPHA_GOOGLE_CONNECTION.md` once. After that, the ordinary Zeke setup flow is:

**Open Zeke → Connect Google Account → choose existing account → approve → Zeke verifies Drive and Calendar → continue.**

## Deploying the static site

1. Extract the deployable ZIP.
2. Upload every file and folder inside the extracted site folder to the HTTPS document root for the Zeke site.
3. Confirm that opening the Zeke URL shows the setup wizard.
4. Complete the one-time alpha Google application registration in `ALPHA_GOOGLE_CONNECTION.md`.
5. Use `alpha-connection-setup.html` to generate a configured `zeke-config.js`, or edit `zeke-config.js` directly.
6. Replace the deployed `zeke-config.js` with the configured file.
7. Reload Zeke.
8. Click **Connect Google Account**.

## First real test sequence

1. Complete the acknowledgement screen.
2. Connect the existing Google account.
3. Confirm the setup screen shows:
   - Google Drive verified;
   - Calendar verified;
   - storage write → read → delete verified.
4. Import the historical health spreadsheet.
5. Open the Dashboard and inspect the latest weight and trend charts.
6. Click a chart and inspect the evidence records.
7. Record a manual measurement from Health → Measurements.
8. Confirm an anticipated action on the Dashboard.
9. Log a workout with weight/reps or duration/intensity and pain/RPE where useful.
10. Open Exercise Analytics and inspect the muscle-group and exercise progression views.
11. Add active injury/recovery context and confirm the progression insight changes conservatively when appropriate.
12. In AI setup, test **Use any AI manually**:
    - create an AI packet;
    - upload the packet to an AI of your choice;
    - obtain the structured JSON response;
    - upload the response to Zeke;
    - review selected findings/questions/actions before applying them.
13. Reload the page, reconnect Google, and confirm Drive data reloads.

## No local persistent personal-data store

This release does not use localStorage, sessionStorage, IndexedDB, or Cache Storage for personal records. The browser holds a working set in memory while the page is open. Durable records are written to the connected Google Drive repository.

## Alpha limitation

The release includes real Google connector code, but the Google-issued OAuth Web Client ID must be registered for the deployed site origin before Google will open the authorization flow. That provider-issued identifier cannot be created inside the ZIP package.
