# ZEKE v0.6.0 Experience Alpha — Read This First

This is an upload-ready static-site alpha built on the recovered ZEKE v0.5 application.

## Deploy

1. Unzip the package.
2. Upload the **contents** of the extracted package to the ZEKE site document root.
3. Make sure `index.html` is directly in the document root.
4. If your currently deployed `zeke-config.js` contains a newer or environment-specific Google Client ID, keep that deployed file instead of overwriting it.
5. Hard-refresh the browser.

## Best first test

1. Complete the existing Google connection flow.
2. Open the floating **AI** control.
3. Choose **Providers**.
4. Configure one provider and use **Test**.
5. Save setup.
6. Return to the dashboard.
7. Ask ZEKE a question.
8. Then say `look deeper` to test AI Router escalation.
9. Enter a statement such as a workout, medication, or measurement observation and verify that ZEKE asks for confirmation before structured save.
10. Test Family History and the Workouts Coach's Eye evidence views.

## Security note

This test build permits direct API-key entry for rapid alpha validation. Those AI keys are stored in localStorage in that browser. That is not the intended final production architecture. A production-grade ZEKE should prefer secure relays, provider-safe token flows, or other protected credential handling.

## v0.6.2 UI compliance patch

This package includes a full-width dashboard compliance pass, adaptive empty-card hiding, dashboard customization, conversational tracking preferences, personal/family history context, date-aware upcoming events, and the v0.6.1 AI Router with Groq Free visible in Fast free setup.

See `PATCH_NOTES_v0.6.2.md` for known gaps that are not claimed as complete.
