# ZEKE AI Adapter

## Principle

AI is a consultant, not the owner of the Story.

## Default policy

- Monthly AI budget: $0.00
- Use free providers if available
- Paid requests blocked unless user changes budget
- Manual package fallback available
- Privacy filter enabled
- Review before permanent save

## Provider-agnostic design

ZEKE should be able to use Gemini, OpenAI, Anthropic, OpenRouter, Groq, local models, and future providers.

## Common AI response format

```json
{
  "facts": [],
  "observations": [],
  "historical_context": [],
  "relationships": [],
  "insights": [],
  "hypotheses": [],
  "guidance": [],
  "questions": [],
  "suggested_story_updates": [],
  "confidence": {},
  "limitations": []
}
```

## Retention

Temporary by default: full prompts, raw AI responses, context packages, scratch reasoning.

Permanent only when user accepts a recommendation, Story update, or provenance summary.
