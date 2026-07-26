# Storage Connector Setup — Project ZEKE

## Architectural rule

ZEKE requires one active primary provider for durable confirmed data. Google Drive is the first implementation, not a hard-coded dependency. OneDrive, Dropbox, SFTP/private storage, and future providers must use the common storage contract and the same canonical record semantics.

Application identifiers are public configuration values; client secrets and AI-provider API keys do not belong in `zeke-config.js`.

## Confirmed and unfinished data

- Confirmed records are written to the active provider and become eligible for history and analysis only after provider acknowledgement.
- Normal-browser local storage may be used as a temporary recovery cache for unfinished forms.
- Local recovery data is noncanonical and must never appear as saved, feed analysis, or substitute for a provider write.
- Private/incognito sessions may lose unsaved work when closed.

## Google Drive

Configure a Web OAuth Client ID, enable required Drive/Calendar APIs, add exact HTTPS origins, and place the public client ID in `zeke-config.js`. The adapter must implement the common provider contract rather than expose Google-specific writes to domain modules.

## OneDrive

Configure a Microsoft Entra SPA registration, delegated permissions, and exact redirect origin. Place the public application/client ID in `zeke-config.js`. The adapter must return the same provider-neutral acknowledgement and error semantics as other providers.

## Dropbox

Configure a Dropbox API app with PKCE and the exact redirect URI. Place the public app key in `zeke-config.js`. The adapter must use the same provider-neutral record and verification contract.

## AI credential vault

AI keys are separate from ordinary storage configuration. They must be encrypted before being stored with the active provider. The intended PIN experience uses a narrowly scoped, rate-limited unlock service; plaintext keys are never persisted in browser storage, source files, spreadsheets, or ordinary provider documents.
