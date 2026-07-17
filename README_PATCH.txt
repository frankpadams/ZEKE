ZEKE v0.17.4 · build 2026.07.17.1 · Preview

PURPOSE
This small root-level patch repairs deployment/cache behavior. The repository already
contains the updated assets/app.js and assets/styles.css, but an old service-worker/cache
path could keep the browser on stale nested assets.

UPLOAD THESE THREE FILES TO THE REPOSITORY ROOT
- index.html
- version.js
- sw.js

Replace the existing files with the same names.

DO NOT upload these files inside the assets folder.
DO NOT replace zeke-config.js.
DO NOT change health data or Google Drive files.

EXPECTED AFTER GITHUB PAGES UPDATES
- Splash: v0.17.4 · build 2026.07.17.1 · Preview
- Persistent header logo and version/build
- Exercise tile button opens a numerical form
- Review count uses grouped review tasks
- Active Date remains available for today or historical entry

First open the direct GitHub Pages URL. A normal reload should be sufficient because
index.html unregisters the stale service worker and clears old Project ZEKE caches.
