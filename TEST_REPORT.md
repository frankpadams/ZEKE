# ZEKE v0.6.0 Experience Alpha — Test Report

Build date: 2026-07-09

## Passed checks

- AI Router JavaScript syntax check passed with Node.
- Experience enhancement ES-module syntax check passed with Node.
- AI Router loaded in an isolated JavaScript runtime with a mocked browser storage environment.
- Router exposes 12 provider adapters/paths.
- 9 of the 12 configured provider paths are classified by the alpha router as free-like or rate-limited free-first candidates; paid OpenAI, Claude relay, and custom relay remain optional.
- Natural escalation detection passed for `look deeper` and `that's not right` style language.
- Static-site asset reference validation passed: all local scripts, stylesheets, manifest, and configuration references used by `index.html` exist in the package.
- Plain static HTTP serving returned HTTP 200 for:
  - `/`
  - `/assets/zeke-ai-router-v060.js`
  - `/assets/zeke-experience-v060.js`
  - `/assets/zeke-experience-v060.css`

## Browser automation limitation

An automated Chromium screenshot pass was attempted in the build container but the container's headless Chromium process did not terminate cleanly. This is recorded as an environment limitation, not as a successful visual acceptance test.

The release should therefore receive manual visual acceptance testing in the actual deployed ZEKE browser environment, including desktop and mobile widths.

## Live-service tests not performed

The build environment did not contain the user's provider credentials or live authorization sessions. Therefore the following require real-user acceptance testing:

- Google OAuth/Drive/Calendar authorization;
- Gemini API response;
- Groq API response;
- OpenRouter API response;
- all other AI provider API tests;
- family-history persistence to the connected ZEKE repository;
- AI fallback behavior under real rate limits;
- browser CORS behavior for each direct provider path.

## Recommended acceptance test

1. Deploy the release over HTTPS.
2. Verify Google connection and existing records.
3. Verify dashboard metrics and charts populate from real records.
4. Change each time range and verify charts update.
5. Hover/focus chart points and bars.
6. Ask a local ZEKE question.
7. Use `look deeper` and verify router escalation.
8. Test at least Gemini, Groq, and OpenRouter individually.
9. Enter a statement and verify interpretation is reviewed before save.
10. Reject a local interpretation and verify AI reinterpretation.
11. Add a family-history record and verify it persists after reload/reconnect.
12. Open Workouts and review Coach's Eye prompts and evidence details.
