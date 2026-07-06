# Project Zeke Alpha — AI Setup

Project Zeke is usable without a paid AI service.

The alpha setup wizard offers four paths:

1. **Zeke Local** — deterministic calculations, trends, evidence navigation, straightforward data questions, and exercise progression rules.
2. **Use any AI manually** — export a task-specific packet, upload it to any AI, then upload the structured response to Zeke for review.
3. **Direct AI provider connection** — Gemini, OpenAI, or Claude when the Zeke installation has a secure relay configured.
4. **Skip external AI** — Zeke Local remains available.

For the manual packet workflow, see `AI_PACKET_WORKFLOW.md`.

Direct AI providers are optional. A public browser package must not contain private provider API keys. Site operators can configure secure relay endpoints in `zeke-config.js`; secret provider keys belong behind the relay, not in the browser application.
