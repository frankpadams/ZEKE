# Project ZEKE v0.5.2 Alpha — AI Router Test Patch

This is a quick static-site test release focused on trying free AI integration without rebuilding the full source project.

## Added

- Floating **AI Router** panel available from the lower-right AI button.
- Direct browser test setup for:
  - Gemini
  - OpenRouter
  - Groq
- Secure relay placeholder for OpenAI, Claude, and other providers that should not expose API keys in browser code.
- AI chat test pane so Ask ZEKE can feel more conversational.
- Interpretation prompt that can send an entry through the AI router.
- Provider fallback order managed by the router.
- Minimal privacy mode that strips obvious emails, phone numbers, and SSN-like patterns before sending text to direct providers.

## Important limitations

This is a browser/static-site test patch. Some providers may block direct browser requests through CORS or change model names/rate limits. For a production-quality implementation, OpenAI, Claude, and possibly other providers should be called through a secure relay. The user-facing behavior should remain the same: ZEKE asks the AI router, and the router chooses the provider.

## Security note

API keys entered in this test panel are stored in this browser's localStorage for convenience. Do not use shared computers. A production release should store provider configuration in the user's chosen ZEKE repository and/or use a secure relay so browser code does not hold provider secrets.

## Deployment

Upload this static-site folder over the existing ZEKE deployment. Preserve a working `zeke-config.js` if it already contains the correct Google client ID.
