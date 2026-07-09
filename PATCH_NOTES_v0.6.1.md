# Project ZEKE v0.6.1 — Groq Visibility Fix

This patch makes Groq unmistakably visible in AI Router setup.

Changes:
- Groq is labeled **Groq Free** in the provider list and preferred-provider menu.
- A **Fast free setup** section places Groq Free, Gemini Free, and OpenRouter Free at the top of provider setup.
- Clicking a quick-start provider enables and scrolls to its full configuration row.
- AI Router JS/CSS asset names are versioned to v0.6.1 and referenced with cache-busting query strings so browsers are less likely to reuse the previous panel.
- All v0.6.0 experience features remain included.
