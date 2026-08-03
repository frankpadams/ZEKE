# ZEKE v0.40.0 Exercise Media Sources

**Build:** 2026.08.03.1

## Primary remote source

The v0.40 knowledge library uses selected image URLs from the `yuhonas/free-exercise-db` project where an exact movement mapping was identified. The dataset describes itself as public-domain / Unlicense material. ZEKE stores the source URL, source name, license label, and a `remote-with-fallback` status in each knowledge object.

Remote images are supplemental. If an image is absent, blocked, removed, or not verified for the exact movement, ZEKE displays the written guide and an explicit “verified movement image not yet available” state rather than substitute unrelated imagery.

## Existing local assets

Earlier local/public-domain guide assets remain under `assets/form-guides/` and `THIRD_PARTY_LICENSES/` for historical and supported guide coverage. Their per-file source notes remain applicable.

## Review rule

Media metadata alone is not proof that the image depicts the named exercise. High-use mappings receive manual movement-level review. Lower-priority remote mappings remain removable and must never be presented as clinically authoritative.
