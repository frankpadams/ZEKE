# Deploy ZEKE v0.29.0

1. Back up the currently deployed ZEKE folder.
2. Replace the deployed application files with the complete contents of this package; do not merge selected files into an older build.
3. Preserve `zeke-config.js` only when intentionally carrying forward the deployment-specific configuration and after comparing it with the packaged file.
4. Deploy over HTTPS.
5. Hard-refresh. The v0.29.0 entry page attempts to unregister older ZEKE service workers and clear old project caches, but manual browser cache clearing may still be needed.
6. Verify **v0.29.0 · build 2026.07.25.1** in the UI.
7. Reconnect the active storage provider if authorization has expired.
8. Test a non-sensitive save and confirm the record is visible after refresh before relying on the deployment.
9. Test Gym Mode on a phone and verify that desktop ZEKE remains intact.

Deployment does not by itself verify live-provider writes, physical-device layout, AI providers, protected workbooks, or the future encrypted AI credential vault. Record those checks separately.
