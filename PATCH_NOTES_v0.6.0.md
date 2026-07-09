# ZEKE v0.6.0 Experience Alpha — Release Notes

## Purpose

This release is a substantial experience-layer upgrade built on the recovered ZEKE v0.5 compiled static application. It is intentionally an alpha test release, not a source-code rewrite.

The handoff package remains the authoritative product specification. This release does not supersede it.

## What changed

### Data-dense Health briefing

The Health dashboard now adds:

- visible current values and range deltas;
- line charts for weight and resting heart rate;
- workout consistency by week;
- recent lab value tiles;
- selectable ranges: 1 week, 1 month, 3 months, 6 months, 1 year, and all-time;
- mouseover/focus detail for chart points and bars;
- fewer decorative visuals and more explicit values.

### Unified Talk to ZEKE conversation

Talk to ZEKE and ZEKE responses are presented as one conversational surface.

- Questions are answered locally first when possible.
- Natural phrases such as "look deeper," "try harder," "use AI," and "that's not right" can escalate through the AI Router.
- Statements are interpreted locally and shown for confirmation before structured save.
- "Not quite—look deeper" requests AI reinterpretation while preserving the original user entry.

### AI Router v0.6

The router includes setup adapters or relay paths for:

- Gemini
- Groq
- OpenRouter
- Mistral
- Cerebras
- NVIDIA NIM
- GitHub Models
- Cloudflare Workers AI
- Hugging Face Inference Providers
- OpenAI API
- Claude through secure relay
- custom provider-neutral secure relay

The router is free-first by default and can fall back across configured providers.

### Family health history

A Family History interface allows optional user-confirmed context including:

- relationship;
- condition or event;
- age at diagnosis/event;
- status/outcome;
- notes.

Family history is context for discovery and discussion. It is not converted into a diagnosis or a claim about the user.

### Coach's Eye

Workout history is examined for practical progression prompts such as:

- hold or repeat a load after a large jump;
- consider a small increase after strong performance with low recorded pain and manageable RPE;
- consider whether higher load/fewer reps better match a strength goal;
- pause progression when pain signals warrant caution;
- improve future coaching by recording load, reps, sets, RPE, and pain together.

Expanded evidence views show the research context used for the prompt and explicitly preserve uncertainty.

### I've been thinking...

The dashboard adds quiet conversational prompts rather than a task-like suggestion queue. These can surface:

- optional trackables repeatedly mentioned in raw entries;
- family-history context worth considering;
- questions ZEKE may want to explore with the user.

## Important alpha limitations

1. This is still a static browser application built over the recovered compiled v0.5 base.
2. Direct browser API-key testing is included for rapid alpha validation. Keys entered in this test build are stored in browser localStorage. Do not use this pattern as the final production security architecture.
3. Browser CORS policies or provider policies may block some direct provider calls even when a key is valid. Secure relay support is included for providers that require or benefit from it.
4. Free tiers, model availability, and rate limits are controlled by providers and can change.
5. Google reconnect behavior is inherited from the existing v0.5 connector in this release; a more robust source-code implementation remains a priority.
6. ZEKE coaching is decision support, not diagnosis, medical advice, or medical clearance.

## Quick test sequence

1. Deploy the contents of this ZIP to the ZEKE static-site root.
2. Preserve your working `zeke-config.js` if the deployed version contains a newer Google Client ID or environment-specific values.
3. Hard-refresh the browser.
4. Connect Google through the existing ZEKE alpha flow.
5. Open the AI Router floating control and configure one provider. Gemini, Groq, or OpenRouter are good first alpha tests.
6. Open the dashboard and test the range selector.
7. Ask a question in Talk to ZEKE, then follow with `look deeper` to test router escalation.
8. Enter a natural-language observation and verify that interpretation is shown before save.
9. Use Family history to add optional context.
10. Open Workouts and inspect Coach's Eye prompts and evidence views.
