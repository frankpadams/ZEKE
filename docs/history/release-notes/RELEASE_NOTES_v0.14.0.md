# ZEKE v0.14.0 — Contextual Conversation Preview

## Purpose
A test release focused on how a more reliable, AI-assisted conversation flow feels to use.

## Included
- Structured choices appear first for clarification decisions, preserving Groq bandwidth.
- Every clarification includes **None of these fit** and **Why are you asking?** where appropriate.
- Free-form clarification replies are resolved against the active question and allowed action IDs.
- Deterministic actions remain available when AI is down.
- The false 80/100 blood-pressure issue can be marked invalid directly from the question buttons.
- Clarification text is no longer concatenated into new raw user input, preventing context contamination.
- `37.6% fat` after a recent weight entry is recognized as body-fat percentage and linked to the same measurement session.
- Choice buttons show immediate working feedback.
- Conversation can expand to a full-screen reading mode.
- Conversation scroll behavior is less aggressive when the user is reading older messages.

## Safety
AI proposes only an allowed action ID. ZEKE validates and executes it. No AI response writes directly to the repository.
