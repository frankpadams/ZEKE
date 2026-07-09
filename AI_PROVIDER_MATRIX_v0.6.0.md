# ZEKE AI Router Provider Matrix — v0.6.0 Alpha

This matrix describes the test adapters included in this release. Provider programs and limits can change; always verify current terms before relying on a provider for production use.

| Provider | Alpha path | Cost posture | Notes |
|---|---|---|---|
| Gemini | Direct browser REST test | Free tier available | Strong default candidate for free-first alpha testing |
| Groq | OpenAI-compatible direct test | Free/rate-limited tier | Explicit Groq provider, not hidden behind another label |
| OpenRouter | OpenAI-compatible direct test | Free model router available | Useful routing/fallback option |
| Mistral | OpenAI-compatible direct test | Free-mode/rate-limited access may be available | Availability depends on account/model |
| Cerebras | OpenAI-compatible direct test | Free tier available | Fast inference option |
| NVIDIA NIM | OpenAI-compatible direct test | Developer prototyping access | Model availability may vary |
| GitHub Models | GitHub Models endpoint | Rate-limited prototyping | Requires suitable GitHub token permissions |
| Cloudflare Workers AI | OpenAI-compatible account endpoint | Daily free allocation available | Requires API token and Account ID |
| Hugging Face | OpenAI-compatible inference router | Small free credits available | Routes across supported inference providers/models |
| OpenAI API | Direct test | Paid API account | Separate from ChatGPT subscription billing |
| Claude | Secure relay path | Paid provider | Direct browser secret exposure is intentionally avoided |
| Custom relay | Provider-neutral relay | Depends on relay/provider | Future-proof path for additional providers |

## Router behavior

ZEKE features request a capability such as chat, interpretation, or analysis. The feature does not select a provider directly.

The router considers:

- user-enabled providers;
- preferred provider, when specified;
- free-first preference;
- task suitability;
- availability and errors;
- fallback order;
- privacy level.

The alpha includes natural escalation phrases such as `look deeper`, `try harder`, `use AI`, and `that's not right`.
