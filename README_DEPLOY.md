# ZEKE v0.8.1 Evaluation Alpha — Deployment

Build: **v0.8.1 · 2026.07.11.2**

## Deploy to GitHub Pages

1. Back up the current repository and ZEKE workspace data.
2. Unzip the release.
3. Copy the **contents** of this folder into the GitHub Pages publishing root. Do not upload the ZIP itself and do not nest the build inside another directory.
4. Preserve a newer working `zeke-config.js` only when it contains a deliberately newer Google OAuth client configuration.
5. Commit and wait for GitHub Pages deployment to complete.
6. Open ZEKE and confirm the sidebar shows `v0.8.1 · 2026.07.11.2`.
7. Test storage restoration, import, AI connection, and Talk to ZEKE before relying on the build for daily use.

## User data and upgrades

Application files are replaceable. User history remains in the chosen ZEKE workspace. This build preserves the existing Google Drive repository paths and upgrades the repository manifest in place, retaining the stable `workspace_id` when one already exists.

Do not delete the `Project Zeke` workspace folder to install an application update.
