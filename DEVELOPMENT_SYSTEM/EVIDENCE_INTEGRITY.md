# ZEKE Development Evidence Integrity Standard

**Current authority review:** 2026-08-25 · runtime v0.48.0 build 2026.08.25.1 · governance 2026.08.25.2

**Status:** Authoritative. This standard governs how observations, implementation claims, tests, screenshots, logs, and development status are interpreted.

## 1. Observation precedes interpretation

Read literal evidence before using expectations, prior assumptions, or surrounding context. Context may explain an observation only after the observation has been established.

For screenshots and rendered UI, version/build labels, dates, medication names/doses, error messages, button labels, values, and status text are **verification-required fields**. If text is too small or ambiguous, zoom/crop/read the source image or report uncertainty. Never fill in unread text from expectation.

## 2. Artifact evidence outranks assistant narration

A prior assistant statement that something was implemented, fixed, tested, or packaged is not implementation evidence. Verify the current source tree, runtime/package bytes, named test output, rendered behavior, persistence round-trip, or deployed environment as applicable.

When conversation history and artifacts disagree, preserve the conversation as intent/history but treat the artifact as the evidence of what actually exists unless stronger current evidence proves otherwise.

## 3. Evidence-state ladder

Every material feature/change is classified using the strongest level directly demonstrated:

1. **Specified** — requirement/decision exists.
2. **Coded** — implementation is present in the current source/package.
3. **Source-tested** — named syntax/unit/structural tests passed.
4. **Rendered-tested** — real browser rendering/interaction was exercised.
5. **Persistence-tested** — mutation was acknowledged, reread, and survived reload/reopen where applicable.
6. **Environment-tested** — connected provider/device/live environment was exercised.
7. **User-verified** — the owner exercised the relevant real workflow and accepted the result.

Never promote a feature to a higher state because a lower-state test passed.

## 4. Requirement, implementation, and test are independent artifacts

Tests must be derived from the requirement/decision, not merely from the implementation that was just written. Implementation and its own test cannot circularly validate the underlying assumption.

For important behavior, add at least one falsification-oriented or adversarial check that asks how the implementation could be wrong while still satisfying a superficial test.

## 5. End-to-end mutation proof

A clickable control or handler is not proof that a workflow works. Consequential actions are verified across the full chain:

**user action → immediate visible state → validated transaction → durable provider acknowledgement → reread → reload/reopen persistence → duplicate/retry safety**.

If any stage is untested, name that boundary explicitly.

## 6. Derived, expected, inferred, and confirmed are distinct

Never convert a schedule, prediction, inference, suggestion, calendar candidate, AI interpretation, or missing value into a confirmed historical fact. ZEKE and its development process use explicit evidence classes such as **expected / inferred / suggested / observed / user-confirmed / provider-acknowledged**.

## 7. Identity and source verification

Before diagnosing a screenshot, package, branch, release, or working tree, verify its identity from direct evidence. Version/build labels, runtime metadata, package root, source path, and checksum/provenance are checked rather than inferred from filenames or conversational expectation.

## 8. Claim calibration

Use the narrowest truthful status language. “Implemented,” “fixed,” “working,” “verified,” “saved,” “synced,” “release-ready,” and similar terms require the named evidence defined by `STATUS_LANGUAGE.md` and this standard.

When evidence is missing or contradictory, downgrade the claim rather than resolving the contradiction optimistically.

## 9. Contradiction is a stop signal

If screenshots, source, tests, docs, runtime identity, user reports, or prior claims disagree materially, stop feature expansion long enough to reconcile the contradiction. Do not build additional assumptions on top of unresolved evidence.

## 10. Development integrity audit

Before a major release and whenever a material evidence error is discovered, perform a feature-level integrity audit:

**Requirement → implementation evidence → interaction evidence → persistence evidence → visual evidence → environment evidence → unresolved risk.**

A release gate may not substitute a document assertion for missing implementation/runtime evidence.

## 11. Screenshot-reading protocol

When screenshot text affects diagnosis:
- inspect the actual image rather than relying on memory of a prior screen;
- zoom/crop when necessary;
- transcribe the relevant field literally before interpreting it;
- mark unreadable/ambiguous text as uncertain;
- do not use expected version, expected date, or expected value to complete the transcription.

## 12. No invisible development

Development work claimed as current must exist in an accessible, identified working tree or package. Ephemeral experiments may be described as experiments, but they are not the current implementation until their source/artifacts are preserved and identifiable.
