# Runtime Diagnostics

**Status:** Supporting current design

ZEKE records shortened operational errors locally on the current device. Records include timestamp, version/build, route, type, and shortened technical detail. The logger must not intentionally store API keys, access tokens, or full canonical health records. Users can export or clear the local log from Settings. Runtime diagnostics are distinct from the Development Error Log, release-test evidence, and canonical data-operation journals.
