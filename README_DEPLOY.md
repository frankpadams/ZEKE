# Deploy ZEKE v0.41.0 RC1

**Build:** 2026.08.07.1  
**Rollback baseline:** user-deployed v0.40.5 · build 2026.08.06.5

1. Back up the current GitHub repository / deployed v0.40.5 package.
2. Replace the ZEKE repository contents with this v0.41.0 RC1 package as one consistent set; do not mix files from different builds.
3. Commit/publish and wait for GitHub Pages deployment to complete.
4. Open ZEKE and confirm the startup/interface identity shows **v0.41.0 · 2026.08.07.1**.
5. Hard refresh once if needed so the v0.41.0 service-worker cache activates.
6. Connect Google Drive and verify a safe test write/readback before relying on the new build for ongoing records.
7. Smoke-test Dashboard, Fitness/workout logging, Discover, Questions for You, medication schedule/adherence, and mobile navigation.
8. If a blocking regression appears, restore the complete v0.40.5 package rather than mixing rollback files selectively.

Package verification is complete; live Google Drive and physical-device/environment verification remain outstanding until deployment.
