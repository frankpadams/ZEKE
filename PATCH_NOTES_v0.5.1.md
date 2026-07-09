# ZEKE v0.5.1 Confirmation Patch

This deployable patch was built from the uploaded compiled v0.5.0 alpha static assets. It does not require the original React/Vite source tree.

## What changed

- Dashboard **Tell Zeke** is relabeled **Talk to ZEKE**.
- The button now says **Interpret** instead of immediately saving.
- Local parser output is shown in a review panel before any structured event is saved.
- The user must click **Confirm & save** before interpreted entries become structured records.
- If the parser is wrong, the user can click **Try AI reinterpretation**.
- AI reinterpretation uses an optional browser hook: `window.ZEKE_AI_REINTERPRET({ raw_text, local_events })`. If no hook is configured, ZEKE does not save anything and tells the user to revise or confirm as raw note.
- Confirmed saved records are tagged with `interpretation_status: "confirmed_by_user"`, `interpretation_source`, and `original_raw_text`.

## Important

This is an early usability/stability patch. It is intentionally conservative: wrong interpretations are not silently saved.

## Deployment

Upload the contents of this folder over the deployed ZEKE directory. If you already have a working `zeke-config.js`, preserve your deployed copy unless you want to use the public Google Client ID included here.
