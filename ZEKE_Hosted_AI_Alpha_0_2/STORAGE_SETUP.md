# Storage Connector Setup — Project Zeke v0.4.0

Project Zeke needs at least one provider connector configured before users can save durable data. Application identifiers are public configuration values; do not place client secrets in `zeke-config.js`.

The deployed configuration file is:

```text
zeke-config.js
```

The source version is:

```text
public/zeke-config.js
```

## Google Drive

Zeke's Google adapter requests user authorization for the app-created Drive files it manages and read-only Calendar access.

1. Create or select a Google Cloud project.
2. Enable the Google Drive API and Google Calendar API.
3. Configure the OAuth consent screen for the intended audience.
4. Create an OAuth Client ID of type **Web application**.
5. Add every exact HTTPS origin where Zeke will run under Authorized JavaScript origins, for example:
   `https://zeke.example.com`
6. Copy the client ID.
7. Put it in:

```javascript
googleClientId: "YOUR_CLIENT_ID.apps.googleusercontent.com"
```

8. Deploy the changed configuration file.
9. Open Zeke, choose Google Drive during setup, and complete consent.
10. Confirm that a `Project Zeke` folder appears in the authorized Google Drive.

Zeke uses a browser OAuth access token in memory. After a full reload, reconnecting is expected in this test release.

## OneDrive

1. Open Microsoft Entra admin center and create an App registration.
2. Configure it as a single-page application (SPA) and add the exact Zeke redirect origin/URI used by your deployment.
3. Allow the account types you intend to support.
4. Add delegated Microsoft Graph permissions used by the current connector:
   - `User.Read`
   - `Files.ReadWrite`
   - `Calendars.Read`
5. Copy the Application (client) ID.
6. Put it in:

```javascript
microsoftClientId: "YOUR_APPLICATION_CLIENT_ID"
```

7. Deploy the configuration file.
8. Open Zeke and choose OneDrive.
9. Complete the Microsoft account authorization popup.
10. Confirm the `Project Zeke` folder hierarchy is created in the user's OneDrive.

The MSAL client is configured for memory-only token cache in this release.

## Dropbox

1. Create a Dropbox API app in the Dropbox App Console.
2. Enable the file permissions needed for creating folders, reading files, and writing files.
3. Add the exact OAuth redirect URI:

```text
https://YOUR-ZEKE-ORIGIN/PATH/oauth-callback.html
```

For a root deployment, an example is:

```text
https://zeke.example.com/oauth-callback.html
```

4. Copy the Dropbox App key.
5. Put it in:

```javascript
dropboxAppKey: "YOUR_DROPBOX_APP_KEY"
```

6. Deploy the configuration file.
7. Open Zeke and choose Dropbox.
8. Complete the authorization popup.
9. Confirm Project Zeke folders are created in the authorized Dropbox location.

The browser connector uses authorization-code flow with PKCE and keeps the access token in memory for the current page session.

## Provider-neutral behavior

The core application must not call provider-specific save functions. Health, future Pets, Vehicles, House, Finances, and Projects modules use the common storage contract. Provider-specific OAuth and file API details stay inside storage adapters.
