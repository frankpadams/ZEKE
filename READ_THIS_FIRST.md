# READ THIS FIRST — Project Zeke v0.3.0 Browser Test Release

This release is designed to run in a browser from a normal static web host. The web host serves application code only. Personal Zeke records are cached in the browser and, when Google is connected, synchronized to a `Project Zeke Data` spreadsheet owned by the Google account the user authorizes.

## What is in this release

- Browser-first responsive interface for desktop and mobile.
- Health module: Dashboard, Daily Log, Medications, Workouts, Nutrition, Measurements, Labs.
- Today's Actions confirmation workflow with detail follow-up only when useful.
- Ask Zeke and response area at the top of the right dashboard column.
- Free local analysis that works without a paid AI service.
- Optional secure external cloud-AI endpoint.
- Google Calendar read-only display.
- Google Drive / Sheets synchronization to the user's own Google account.
- Cross-device restore by reconnecting the same Google account.
- Historical CSV, TSV, XLSX, JSON, and Google Sheet import with preview, mapping, provenance, duplicate skipping, import history, and undo.
- Apple Health XML / JSON import plus the included Shortcut → Apps Script bridge path.
- Customizable dashboard widgets and evidence drill-down.
- Future module placeholders for Pets, Vehicles, House, Finances, and Projects.

---

# OPTION A — Upload the ready-built static site to a web host

Use the separate `project-zeke-v0.3.0-static-site.zip` package.

## Step 1 — Unzip the static-site package

1. Download `project-zeke-v0.3.0-static-site.zip`.
2. Double-click it to extract the folder.
3. Open the extracted folder.
4. Confirm you see `index.html`, `assets`, `manifest.webmanifest`, `sw.js`, and `APPLE_HEALTH_SETUP.md`.

## Step 2 — Upload the site files

In the control panel for the web host:

1. Open the file manager for the domain or subdomain where Project Zeke should run.
2. Open that domain's document root. On many hosts this is called `public_html`, but a subdomain may have a different document root.
3. Upload the **contents** of the extracted static-site folder into that document root.
4. Make sure `index.html` is directly inside the document root, not nested one level deeper inside another folder.
5. Visit the HTTPS URL in a browser.

Checkpoint: the Project Zeke first-run acknowledgement should appear, followed by the dashboard.

The release uses hash-based browser routing, so it does not require special rewrite rules for internal application pages.

---

# OPTION B — Run the source locally

## Step 1 — Install Node.js

Use Node.js 20 or newer.

## Step 2 — Open Terminal and enter the source folder

On a Mac:

1. Press `Command + Space`.
2. Type `Terminal`.
3. Press Return.
4. Type `cd ` including the trailing space.
5. Drag the extracted `project-zeke-browser-v0.3.0` source folder into Terminal.
6. Press Return.

## Step 3 — Install dependencies

```bash
npm install
```

## Step 4 — Start the browser development server

```bash
npm run dev
```

Open the local address shown by Vite, normally:

```text
http://localhost:5173
```

## Step 5 — Build the static production files

```bash
npm run build
```

The ready-to-upload site is created in the `dist` folder.

---

# CONNECT GOOGLE SO DATA FOLLOWS THE USER

## Before starting

You need:

- The Project Zeke site already running over HTTPS.
- The Google account that should own the Zeke data.
- Access to Google Cloud Console for that account.

## Step 1 — Create or select a Google Cloud project

1. Sign in to Google Cloud Console with the account you want to use for setup.
2. Create a project or select a dedicated Project Zeke project.
3. Open the API Library.
4. Enable:
   - Google Calendar API
   - Google Drive API
   - Google Sheets API

## Step 2 — Configure the OAuth consent screen

1. Open the Google Auth / OAuth consent configuration area.
2. Configure the application name.
3. If the application remains in testing mode, add the Google account that will use Zeke as a test user.

## Step 3 — Create an OAuth Web Client

1. Create an OAuth Client ID.
2. Choose **Web application**.
3. Under **Authorized JavaScript origins**, add the exact origin where Zeke runs.
4. For the current ZEKE domain, use:

```text
https://zeke.digitalcatharsis.net
```

5. For local testing, also add:

```text
http://localhost:5173
```

6. Save the client.
7. Copy the Client ID ending in `.apps.googleusercontent.com`.

## Step 4 — Paste the Client ID into Zeke

1. Open Project Zeke.
2. Open **Settings**.
3. Go to **Google Account, Calendar, Drive & Sheets**.
4. Paste the Client ID into the Client ID field.
5. Click **Save Client ID**.
6. Click **Connect Google & restore data**.
7. Review and approve the Google permissions.

Checkpoint: Settings should show Google as connected. Zeke will locate an existing `Project Zeke Data` workbook when accessible to the app, or create one when needed.

## Step 5 — Confirm durable synchronization

1. Go to **Health → Measurements**.
2. Enter a harmless test measurement.
3. Wait several seconds or click **Settings → Sync now**.
4. Open Google Drive.
5. Open `Project Zeke Data`.
6. Confirm the record appears in the `Events` sheet and the appropriate structured sheet.
7. Delete the test measurement later only if you intentionally want it removed; do not use a fake health value as a long-term record.

---

# IMPORT EXISTING HISTORICAL DATA

1. Open **Settings**.
2. Scroll to **Historical Spreadsheet Import**.
3. Choose either:
   - a CSV, TSV, XLSX, or JSON file from the device; or
   - a Google Sheets URL / spreadsheet ID after Google is connected.
4. Wait for the analysis.
5. Review:
   - detected sheet names;
   - detected header row;
   - source-column mappings;
   - destination tables;
   - estimated event counts.
6. Click **Import approved mapping**.
7. Review the completion report and Import History.
8. Open the Dashboard and data pages to confirm imported history appears.

The importer preserves source file name, source sheet name, source row number, and import batch ID in event provenance.

---

# TEST CHECKLIST

After installation:

1. Accept the first-run acknowledgement.
2. Confirm the dashboard shows demo data before real data is loaded.
3. Click **Creatine**, enter an amount, and save.
4. Log a workout.
5. Add a manual resting heart rate in **Measurements**.
6. Add a manual blood-pressure reading from a doctor office, pharmacy, or home cuff.
7. Ask Zeke a question about weight or resting heart rate.
8. Open a chart's evidence view.
9. Customize the dashboard widget order.
10. Connect Google and sync.
11. Refresh the page and confirm records remain.
12. Open another browser or device, connect the same Google account, and use **Connect Google & restore data**.
13. Import a historical spreadsheet and review the result.
14. Remove demo data before treating the system as a real personal record.

