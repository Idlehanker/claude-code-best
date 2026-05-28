<!-- Generated: 2026-05-28 | Files scanned: ~50 | Token estimate: ~750 -->

# Dependencies — Workspaces & External Services

## Workspace Packages (11)

| Package | Purpose | Key Files |
|---------|---------|-----------|
| `packages/@ant/ink/` | Forked Ink terminal framework | components, core, hooks, keybindings, theme, utils |
| `packages/@ant/computer-use-mcp/` | Computer Use MCP server | screenshot, keyboard, clipboard, app management |
| `packages/@ant/computer-use-input/` | Keyboard/mouse simulation | dispatcher + darwin/win32/linux backends |
| `packages/@ant/computer-use-swift/` | Screenshot + app management | per-platform backends |
| `packages/@ant/claude-for-chrome-mcp/` | Chrome browser control | Via `--chrome` flag |
| `packages/@ant/model-provider/` | Model provider abstraction | Provider interface |
| `packages/builtin-tools/` | 60+ built-in tool implementations | Exported via `@claude-code-best/builtin-tools` |
| `packages/agent-tools/` | Agent orchestration tools | Subagent lifecycle |
| `packages/acp-link/` | ACP proxy (WS → ACP agent) | ACP WebSocket + relay handlers |
| `packages/mcp-client/` | MCP client library | MCP protocol client |
| `packages/remote-control-server/` | Self-hosted RCS + Web UI | Docker, React 19 + Vite + Radix UI |

## Native Addons (NAPI)

| Package | Platform | Purpose |
|---------|----------|---------|
| `audio-capture-napi` | All | Audio capture for voice input |
| `image-processor-napi` | All | Image processing pipeline |
| `color-diff-napi` | All | Color difference calculation (11 tests) |
| `modifiers-napi` | macOS | Keyboard modifier key detection (FFI) |
| `url-handler-napi` | All | URL scheme handling (env vars + CLI args) |

## External Services

| Service | Usage | Location |
|---------|-------|----------|
| **Anthropic API** | Primary LLM backend | `src/services/api/claude.ts` |
| **OpenAI API** | Compat layer (Ollama/DeepSeek/vLLM) | `src/services/api/openai/` |
| **Google Gemini** | Compat layer | `src/services/api/gemini/` |
| **xAI Grok** | Compat layer | `src/services/api/grok/` |
| **AWS Bedrock** | Provider | `src/services/api/bedrockClient.ts` |
| **Google Vertex** | Provider | Provider selection in `providers.ts` |
| **GitHub** | PR/issue ops, code search | MCP plugin + `src/services/api/grove.ts` |
| **GrowthBook** | Feature flag CDN | `src/services/analytics/growthbook.ts` |
| **Slack** | Notifications | `src/commands/install-slack-app/` |
| **Sentry** | Error tracking (stub) | Empty implementation |

## Build Dependencies

| Tool | Role |
|------|------|
| **Bun** | Runtime, bundler (Bun.build), test runner |
| **Vite** | Alternative build pipeline (`build:vite`) |
| **Biome** | Lint + format (42 rules disabled for decompiled code) |
| **TypeScript** | Strict mode typechecking (`tsc`) |
| **Commander.js** | CLI framework (`@commander-js/extra-typings`) |
| **React 18** + **Ink** | Terminal UI rendering |
| **Zustand** | State management |

## Runtime Decomposition

Bun `splitting: true` → 600+ chunk files in `dist/`. Post-build: `import.meta.require` → Node.js compat, vendor binaries copied to `dist/vendor/`. Both `dist/cli-node.js` and `dist/cli-bun.js` produced.
