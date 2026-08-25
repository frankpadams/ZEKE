# Current usability test boundary — v0.48.0

**Build:** 2026.08.25.1 · **Governance:** 2026.08.25.2. Current owner-observed defect: duplicate-event resolution in v0.47 can fail to persist and stack error notices. v0.48 contains a coded/source-tested repair; live Google-provider persistence remains to be user/environment verified.

# Usability Testing Standard

**Current continuity stamp:** v0.47.0 · build 2026.08.24.1 · governance 2026.08.24.6 · reviewed 2026-08-24


**Reviewed:** 2026-08-24 · runtime v0.46.0 build 2026.08.24.2 · governance 2026.08.24.3

Project Zeke must be testable as an end-user product without asking the tester to become a developer.

## Default user experience

The ordinary setup path must not require knowledge of:

- OAuth
- client IDs
- API keys
- scopes
- redirect URIs
- developer consoles
- endpoint URLs
- model identifiers

The setup wizard should ask questions in user terms:

- Where should Zeke keep your information?
- How much AI help do you want?
- Do you want to bring in existing history?

## Preview mode

When a live provider application registration is not present, the usability build offers a clearly labeled connection preview. It simulates the end-user flow using session-only JavaScript memory. No personal data is durably saved, and no local browser database is used.

## Live mode

In a deployed application, the site operator performs provider registration once. Ordinary users click Connect, authenticate with the provider, authorize access, and Zeke creates and verifies its repository automatically.


## Current v0.46 UX acceptance

Usability verification is screen- and workflow-level, not merely component-level. Representative checks include:
- cold-load and refreshed page reachability/scrolling;
- readable Dashboard composition and appropriate domain balance;
- stable visual cues in Recent Activity;
- visible response to consequential decisions;
- Talk to ZEKE close/compact/expanded behavior;
- browseable exercise discovery without search;
- body-area/injury/PT cross-navigation;
- variation-aware chart truth;
- mobile and desktop compositions that preserve the same data/workflow semantics.

Package-local rendering is evidence, not owner acceptance. Physical-device/actual-deployment review remains explicit.
