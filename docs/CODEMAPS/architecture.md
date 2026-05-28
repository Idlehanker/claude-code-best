<!-- Generated: 2026-05-28 | Files scanned: ~2800 | Token estimate: ~900 -->

# Architecture — claude-code-best

## Overview

Reverse-engineered Anthropic Claude Code CLI (v2.6.5). Interactive AI coding assistant in the terminal. Bun runtime, ESM, React/Ink UI, TypeScript strict mode. Monorepo with 11 workspace packages.

```
User Input → main.tsx (Commander CLI)
              ├── Quick paths: --version, --dump, MCP, daemon, bridge, BG sessions, templates
              └── Default: launchRepl() → REPL screen (Ink)
                    │
                    ├── PromptInput → context.ts (system/user context)
                    ├── query.ts → API call (streaming)
                    │     └── claude.ts (Anthropic SDK) or compat adapters (OpenAI/Gemini/Grok)
                    ├── Tool dispatch → builtin-tools (60+ tools)
                    └── State → AppState (React context + Zustand store)
```

## Entry Chain

| File | Role |
|------|------|
| `src/entrypoints/cli.tsx` | True entry. Routes to quick paths or loads main.tsx |
| `src/entrypoints/init.ts` | One-time init (telemetry, config, trust dialog) |
| `src/entrypoints/mcp.ts` | Standalone MCP server mode |
| `src/main.tsx` | Commander.js CLI (~5674 lines). All subcommands registered here |
| `src/screens/REPL.tsx` | Interactive REPL (Ink). Input, messages, tool permissions |
| `src/replLauncher.ts` | REPL bootstrap (auth check, session resume, feature flags) |

## Core Loop

```
UserMessage → query.ts → claude.ts (stream) → AssistantMessage
  ├── text_delta → stream to UI
  ├── content_block_start (tool_use) → tool dispatch
  │     └── Tool.execute() → ToolResult
  └── message_stop → return control to REPL
```

## Feature Flags

65+ flags controlled by `feature('NAME')` from `bun:bundle`. Runtime via `FEATURE_<NAME>=1`. Key categories:
- **P0 local**: AGENT_TRIGGERS, ULTRATHINK, BUILTIN_EXPLORE_PLAN_AGENTS
- **P1 API**: EXTRACT_MEMORIES, VERIFICATION_AGENT, KAIROS_BRIEF, ULTRAPLAN
- **P2**: DAEMON, ACP, COORDINATOR_MODE, BG_SESSIONS, TEMPLATES
- **Connectors**: CONNECTOR_TEXT, SSH_REMOTE, DIRECT_CONNECT
- **Experimental**: EXPERIMENTAL_SKILL_SEARCH, EXPERIMENTAL_SEARCH_EXTRA_TOOLS

Management: `scripts/defines.ts` (MACRO defines) → `Bun.build({ define })` or `bun -d` injection.
