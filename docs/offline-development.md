# Offline development mode

This fork has an opt-in development mode for exercising extension UI and locally contributed language-model providers without signing in to GitHub.

Enable it when launching an Extension Development Host:

```json
{
	"env": {
		"COPILOT_CHAT_OFFLINE": "1"
	}
}
```

In non-production extension hosts, `github.copilot.chat.offlineMode` provides the same switch. Production builds ignore the setting; an explicit environment variable is required.

## Security boundaries

Offline mode:

- disables telemetry initialization;
- does not create or expose a GitHub authentication session;
- does not advertise GitHub Copilot cloud models or embeddings;
- permits locally contributed/BYOK model providers to activate.

GitHub-dependent features fail closed. Select a configured local or BYOK model in the model picker. The synthetic Copilot entitlement is an internal activation mechanism only and must never be treated as a GitHub credential or sent to a remote service.

This mode does not automatically configure LM Studio, vLLM, Ollama, or another inference server. Configure an OpenAI-compatible provider through the extension's model-management UI and use the server's `/v1` base URL.

## Verification

Run the focused security regression tests and the standard build gates:

```bash
npx vitest --run --pool=forks src/platform/authentication/test/node/offlineAuthenticationService.spec.ts
npm run typecheck
npm run compile
```
