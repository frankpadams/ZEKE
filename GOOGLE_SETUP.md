# Google Account Setup — Project Zeke v0.3.0

## Goal

After setup, the browser app can:

- read upcoming events from the user's own primary Google Calendar;
- create, discover, read, and update the user's `Project Zeke Data` spreadsheet;
- restore health history on another browser or device after the same Google account is authorized.

## 1. Prepare Google Cloud

In the Google account used for setup:

1. Open Google Cloud Console.
2. Create or select a Project Zeke project.
3. Enable:
   - Google Calendar API
   - Google Drive API
   - Google Sheets API
4. Configure the OAuth consent screen.
5. If the app is in testing mode, add the intended Google account as a test user.

## 2. Create the browser OAuth client

1. Create an OAuth Client ID.
2. Select **Web application**.
3. Add the exact HTTPS origins where Zeke will run.
4. Example current production origin:

```text
https://zeke.digitalcatharsis.net
```

5. Optional local development origin:

```text
http://localhost:5173
```

6. Save and copy the Client ID.

## 3. Configure from the Zeke interface

1. Open Zeke.
2. Open **Settings**.
3. In **Google Account, Calendar, Drive & Sheets**, paste the Client ID.
4. Click **Save Client ID**.
5. Click **Connect Google & restore data**.
6. Approve the requested permissions.

The runtime Client ID is stored only as browser configuration. A Google OAuth Client ID is a public application identifier, not a secret key.

## 4. Verify data ownership

1. Add a test measurement in Zeke.
2. Wait for automatic sync or click **Sync now**.
3. Open Google Drive.
4. Open `Project Zeke Data`.
5. Verify the event exists in `Events` and the relevant structured sheet.

## Requested scopes

- Calendar read-only.
- `drive.file` for files the application creates or the user explicitly makes available to the app.
- Sheets access for the Zeke workbook and Google Sheet imports entered by URL/ID.

## Session model

The access token is held in browser session storage. Zeke does not store the Google password and the static site does not maintain a long-lived refresh token.

## Cross-device restore

On another browser or device:

1. Open Zeke.
2. Paste/save the same OAuth Client ID if the deployed build does not provide it at build time.
3. Click **Connect Google & restore data**.
4. Authorize the same Google account.
5. Zeke searches for the accessible `Project Zeke Data` workbook and restores events and synchronized user state.
