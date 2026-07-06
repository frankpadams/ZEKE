/*
  Project Zeke alpha runtime configuration.
  This file may contain PUBLIC application identifiers and HTTPS endpoint URLs only.
  DO NOT put AI API secrets, passwords, refresh tokens, access tokens, or personal data here.
*/
window.ZEKE_CONFIG = {
  alphaUserMode: true,
  googleClientId: "",
  defaultAiRelayEndpoint: "",
  aiRelayEndpoints: {
    "gemini-relay": "",
    "openai-relay": "",
    "claude-relay": ""
  }
};
