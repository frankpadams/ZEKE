# ZEKE v0.12.1 — Persistent Connections Fix

## Fixed

- Google Drive authorization is restored from the existing browser session after an ordinary page refresh instead of being discarded during application startup.
- Groq and other browser-based AI provider credentials can now be retained across refreshes with **Remember on this device**.
- AI provider model, endpoint, test status, and active availability are restored from a stable version-independent local settings namespace.
- Temporary startup or network failures no longer erase saved AI provider credentials.

## Security and scope

- AI keys remain in this browser/device only and are not written to `events.json`, the connected workbook, Google Drive repository, issue exports, or release files.
- Google passwords are never stored. ZEKE retains only the short-lived OAuth access token already issued to the current browser session.
- Clearing Firefox site data, using private browsing, changing the site origin, explicitly disconnecting, or token expiration can still require reconnection.

## Data safety

This release does not migrate, rewrite, import, delete, or modify health records or workbook data.
