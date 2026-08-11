# ZEKE Current Project State

**Package version:** 0.42.0 RC1  
**Build:** 2026.08.11.1  
**Release label:** Longitudinal Intelligence & Ingestion RC1  
**Parent candidate:** v0.41.0 RC1 · build 2026.08.07.1  
**Last known user-deployed baseline:** v0.40.5 · build 2026.08.06.5

## Current package state

v0.41.0 fitness intelligence remains intact. v0.42.0 adds a generalized longitudinal-schema layer, truthful 14-day Dashboard Timeline Snapshot, retrospective-range parsing, vaccination/immunotherapy/context events, deterministic-first ingestion contracts, source-specific clinical reference metadata, and staged Google Calendar privacy policy.

The package intentionally separates implemented browser behavior from provider-dependent workflows. DEXA/patient-portal recognition now has an explicit classification/review contract; live vision/OCR and Google Calendar writes require the corresponding connected provider/deployment and must never be simulated.

## Data boundary

Canonical user records remain distinct from preferences, source documents, derived coaching, proposed relationships, and temporary UI state. Missing remains unknown. Source facts, user-confirmed facts, inferred relationships, and AI hypotheses remain distinguishable.

## Immediate acceptance boundary

Run package tests, deploy the complete package as a unit, verify Dashboard Timeline rendering on desktop/mobile, verify retrospective parsing against representative phrases, and then perform connected Google Drive/AI/Calendar acceptance only where those providers are actually configured.
