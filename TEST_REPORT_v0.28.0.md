# ZEKE v0.28.0 Test Report

Build: 2026.07.23.0005

## Automated checks

- JavaScript syntax: passed with Node 0--check.
- Required release files present: passed.
- Base directory structure preserved: passed.
- Unchanged-file timestamps compared with v0.27.2: verified during packaging.
- Blank numeric fields serialize as null in the Gym Entry save path: code inspection passed.
- Exercise save uses ZekeData.addEvent: code inspection passed.
- User program save uses ZekeData.savePreferences: code inspection passed.
- Workout-session summary is created only by Finish Workout: code inspection passed.

## Environment checks still required

- Live Google Drive save and reload.
- Mobile Safari and Chrome interaction.
- Service-worker update after deployment.
- Screen-reader and keyboard review.
