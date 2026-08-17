# ZEKE AI Provider Setup — v0.43 RC2

Direct AI providers are optional. ZEKE's deterministic logging/storage paths remain functional without AI.

## Where API keys are stored

In this alpha, provider API keys entered in Settings → AI Connections are saved in the **connected user-owned ZEKE workspace**, specifically `Project Zeke/system/ai-connections.json`. This allows the same provider configuration to be available after signing into the same ZEKE/Drive workspace on another device.

ZEKE no longer intentionally persists AI API keys in browser `localStorage`. Older device-only key records are migrated into the connected workspace when possible and then removed from local storage.

Provider OAuth/session tokens are a different class of secret and remain session-scoped; they are not written to AI connections.

## Privacy/security contract

- API keys are never embedded in the public static package.
- Health/support workbooks, JSON exports, runtime diagnostics, workflow exports, and AI packets exclude fields whose names indicate keys, credentials, tokens, passwords, authorization, or secrets.
- The alpha credential-sync model relies on the security of the user's connected Drive account and ZEKE's Drive authorization. A future hardened credential vault may add user-managed encryption while preserving cross-device/provider-neutral semantics.
- Anyone with direct access to the managed `system/ai-connections.json` file could potentially use the stored provider key. Treat the connected Drive account as sensitive.

## Connection flow

1. Connect ZEKE to the user-owned storage workspace.
2. Open Settings → AI Connections.
3. Paste the provider API key and choose/model endpoint as needed.
4. Choose **Connect & sync**.
5. ZEKE writes the provider configuration to connected storage and runs a connection test.
6. On another device, connect to the same ZEKE workspace; the AI Router hydrates the stored provider configuration.

Keys may be replaced by pasting a new key. Removing a provider removes its synced credential from the AI connections file.
