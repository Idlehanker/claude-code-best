<!-- Generated: 2026-05-28 | Files scanned: ~500 | Token estimate: ~950 -->

# Backend — API Layer & Services

## API Providers (7 total)

| Provider | Entry | Key Env Vars | Notes |
|----------|-------|-------------|-------|
| `firstParty` | `src/services/api/claude.ts` | `ANTHROPIC_API_KEY` | Anthropic direct (default) |
| `bedrock` | `src/services/api/bedrockClient.ts` | AWS creds | AWS Bedrock |
| `vertex` | (in providers.ts) | GCP creds | Google Cloud Vertex |
| `openai` | `src/services/api/openai/client.ts` | `OPENAI_API_KEY`, `CLAUDE_CODE_USE_OPENAI=1` | OpenAI/Ollama/DeepSeek/vLLM |
| `gemini` | `src/services/api/gemini/client.ts` | `GEMINI_API_KEY`, `CLAUDE_CODE_USE_GEMINI=1` | Google Gemini |
| `grok` | `src/services/api/grok/client.ts` | `CLAUDE_CODE_USE_GROK=1` | xAI Grok |
| `foundry` | (in providers.ts) | — | — |

Selection: `src/utils/model/providers.ts` → modelType param > env var > default firstParty.

All compat layers use **stream adapter pattern**: translate 3rd-party SSE → Anthropic `BetaRawMessageStreamEvent` format. Downstream code unchanged.

## Core API Flow

```
query.ts: main API query function
  ├── Build request: system prompt + messages + tools + betas
  ├── Call claude.ts streaming endpoint
  ├── Process BetaRawMessageStreamEvent events
  ├── Handle tool_use → tool dispatch → tool_result
  └── Manage conversation turn loop

QueryEngine.ts: higher-level orchestrator
  ├── Conversation state management
  ├── Compaction triggers (auto/manual)
  ├── File history snapshots
  ├── Attribution tracking
  └── Turn-level bookkeeping
```

## Key Service Modules

| Module | Purpose |
|--------|---------|
| `src/services/api/claude.ts` | Core Anthropic API client (streaming, retry, error handling) |
| `src/services/api/client.ts` | HTTP client wrapper |
| `src/services/api/bootstrap.ts` | Startup data fetch (feature flags, policy, usage) |
| `src/services/api/filesApi.ts` | Session file upload/download |
| `src/services/compact/` | Auto/manual/reactive compaction strategies |
| `src/services/mcp/` | MCP server connection management |
| `src/services/acp/` | ACP agent protocol implementation |
| `src/services/analytics/` | Telemetry / event logging |
| `src/services/tokenEstimation.ts` | Token counting & budget tracking |
| `src/services/voice.ts` | Voice input (Push-to-Talk) |
| `src/services/policyLimits/` | Usage policy enforcement |

## ACP Protocol (`src/services/acp/`)

| File | Role |
|------|------|
| `agent.ts` | AcpAgent class — full agent lifecycle |
| `bridge.ts` | Claude Code ↔ ACP bridge |
| `permissions.ts` | Permission pipeline for ACP context |
| `entry.ts` | ACP entry/bootstrapping |
| `promptConversion.ts` | Prompt format adaptation |
| `utils.ts` | Shared ACP utilities |
