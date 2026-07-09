# Usability Testing Standard

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
