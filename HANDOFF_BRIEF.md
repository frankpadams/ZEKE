# ZEKE Handoff Brief

**Current baseline:** ZEKE v0.24.0 · build 2026.07.21.1  
**Release:** Trust, Conversation & Workflow

## Product direction
ZEKE is a private personal-management system, not only a health application. Health is the current leading domain. The user owns the durable repository; AI is advisory and replaceable.

## Current release
v0.24.0 centers trust rather than feature volume:

- Every Talk to ZEKE transaction has an explicit goal, state, proposed consequence, and terminal outcome.
- A durable workflow can survive navigation and refresh through the user repository. Common pending question, confirmation, correction, memory, and health-history states are reconstructed, and a Resume action is shown.
- Conversation Memory separates unresolved decisions from confirmed remembered context. Choosing Later preserves the question and moves it behind newer review work.
- Review items show the original information and downstream effect before action.
- Medication-schedule questions can open a focused editor instead of dead-ending.
- Supported attachments use the same import safeguards as Settings.
- Settings contains one privacy-filtered Support & Improvement Report workbook.
- Unresolved interactions link the original message, understanding, intended destination, AI use, buttons, retries, save status, and resolution.

## Runtime architecture
The active code is directly editable static JavaScript/CSS. Read `ARCHITECTURE.md` before changing files. Hashed bundles and older versioned scripts are legacy artifacts and are not loaded by the current application.

## Verification boundary
Syntax, deterministic tests, governance checks, isolated rendered smoke checks, and package verification can be completed locally. Live Drive, Calendar, AI providers, service-worker deployment, protected workbook fixtures, and physical-device behavior require environment verification.

## Startup
Read `00_AI_START_HERE.md`, then follow the development gate and current iteration record. Do not infer implementation authority from historical release notes.

## v0.25.0 continuation note
The current release adds adaptive Fitness capture/display, Provider View, cautious consideration language, and progressive identity/clinical profile fields. Dashboard remains home. Outside beta testing is not authorized to use a shared AI key until a protected proxy/backend provides account isolation and secret handling. Continue from `DEVELOPMENT_MEMORY/ITERATION_RECORD_v0.25.0.md`.
