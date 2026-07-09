# Project Zeke Alpha — One-Time Google Connection Setup

This is a one-time setup for the person operating the alpha site. It is not part of the normal Zeke end-user workflow.

The Zeke alpha user will still connect an existing personal Google account. This setup only gives the Project Zeke web application an identity that Google recognizes.

## Before starting

Have these available:

- the exact HTTPS Zeke URL, for example `https://zeke.example.com`;
- access to the Google account that will own the Google Cloud application registration;
- the deployed Project Zeke static site files.

## Step 1 — Open Google Cloud Console

1. Open Google Cloud Console in a browser.
2. Sign in.
3. Create or select a Google Cloud project used only for the Project Zeke application registration.

This project is not a new Drive or new Calendar. It is only the application registration Google requires for OAuth.

## Step 2 — Enable required APIs

Enable:

1. Google Drive API
2. Google Calendar API

## Step 3 — Configure the Google Auth Platform / OAuth consent screen

1. Open the Google Auth Platform section.
2. Configure the app name as `Project Zeke Alpha`.
3. Choose the audience appropriate for this alpha test.
4. Add the alpha user's Google account as a test user if the app remains in Testing status.
5. Add only the permissions used by this alpha:
   - `https://www.googleapis.com/auth/drive.file`
   - `https://www.googleapis.com/auth/calendar.readonly`

## Step 4 — Create a Web OAuth Client

1. Open Google Auth Platform → Clients.
2. Choose **Create Client**.
3. Application type: **Web application**.
4. Name: `Project Zeke Alpha Web`.
5. Under **Authorized JavaScript origins**, add the exact Zeke origin.

Example:

`https://zeke.example.com`

Do not add a path such as `/health/dashboard` to the origin.

6. Create the client.
7. Copy the Client ID ending in `.apps.googleusercontent.com`.

## Step 5 — Put the public Client ID into the Zeke site

Easiest method:

1. Open `alpha-connection-setup.html` from the deployed Zeke site or local extracted release folder.
2. Paste the Google Web Client ID.
3. Click **Download configured zeke-config.js**.
4. Upload that downloaded `zeke-config.js` to the Zeke site, replacing the existing file with the same name.

The Client ID is a public application identifier. Do not put a client secret, access token, refresh token, password, or AI API key in `zeke-config.js`.

## Step 6 — Test the real connection

1. Open the Zeke site.
2. Complete the acknowledgement page.
3. Click **Connect Google Account**.
4. Choose the existing personal Google account.
5. Approve the requested Drive and Calendar access.
6. Wait while Zeke:
   - creates or reopens the Project Zeke folder;
   - initializes repository files;
   - writes a test file;
   - reads the test file;
   - deletes the test file;
   - reads upcoming Calendar events.
7. Continue only after all three verification cards show success.

## Expected result

The normal alpha user experience after this one-time application registration is one-button Google connection. The user does not enter client IDs, API scopes, redirect URIs, tokens, or configuration values inside Project Zeke.
