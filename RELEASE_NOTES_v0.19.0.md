# ZEKE v0.19.0 — Concept Search & Private Vault Preview

Build: 2026.07.17.6

## Added
- Universal type-and-select entry for Life & Symptoms.
- Canonical concept IDs, aliases, parent relationships, and transparent analysis weights.
- Original wording and provenance preservation.
- Subject ownership for self, partner, family member, or other.
- Concept-family rollups in Pattern Lab while retaining exact-concept variables.
- Explicit exclusion of records where `include_in_analysis` is false.
- PIN-derived AES-GCM encryption for private notes and original wording.
- Private Vault setup, unlock, lock, and reset controls.
- Neutral previews for encrypted private events.
- ZEKE logo returns to Dashboard.

## Security notes
- PIN derivation uses PBKDF2-SHA-256 with 250,000 iterations and AES-GCM authenticated encryption through Web Crypto.
- The PIN itself is not stored. It remains only in session memory while unlocked.
- Losing the PIN can make encrypted payloads unrecoverable.
- This remains an alpha browser application and has not received an independent security audit.

## Pattern Lab notes
Semantic weights control family membership and exploratory indices; they do not predetermine regression coefficients or causal effects.
