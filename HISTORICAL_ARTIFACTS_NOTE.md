# Historical Artifacts Note

The current ZEKE application is the readable static runtime named in `ARCHITECTURE.md` and loaded by `index.html`.

The package still contains historical hashed bundles (`assets/index-*.js`, `assets/Dashboard-*.js`, related CSS chunks), older versioned ZEKE scripts, and obsolete root-level application files. They are retained for continuity evidence but are **not active source files** unless referenced by the current `index.html`.

Do not edit, rebuild, or deploy from those legacy artifacts. Their removal is deferred to a separately reviewed cleanup because deleting historical files can affect audit continuity and older links.
