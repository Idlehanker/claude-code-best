<!-- Generated: 2026-05-28 | Files scanned: ~100 | Token estimate: ~900 -->

# Data — State, Tools & Context

## State Management

```
src/state/
├── AppState.tsx       — Central state type + React context provider
├── AppStateStore.ts   — Default state + store factory
├── store.ts           — Zustand-style store (createStore)
├── selectors.ts       — State selector functions
└── teammateViewHelpers.ts — Team/swarm view utilities
```

State shape: messages[], tools[], permissions, MCP connections, sessions, etc.

Module-level singletons in `src/bootstrap/state.ts`: session ID, CWD, project root, token counts, model overrides, client type, permission mode.

## Tool System (60+ tools)

`src/tools.ts` — Registry. Imports from `@claude-code-best/builtin-tools`. Conditional loading via `feature()` or `USER_TYPE`.

`src/Tool.ts` — `Tool` interface (`name`, `description`, `inputSchema`, `execute()`, `isEnabled?`). Utilities: `findToolByName()`, `toolMatchesName()`.

`src/constants/tools.ts` — `CORE_TOOLS` whitelist (38 tool names). Used for deferred tool loading.

### Tool Categories

| Category | Tools |
|----------|-------|
| **File ops** | FileReadTool, FileWriteTool, FileEditTool, GlobTool, GrepTool, NotebookEditTool |
| **Shell** | BashTool, PowerShellTool |
| **Agent** | AgentTool, TaskCreate/Update/List/Get/Stop, TeamCreate/Delete |
| **Planning** | EnterPlanModeTool, ExitPlanModeTool, VerifyPlanExecutionTool |
| **Web/MCP** | WebFetchTool, WebSearchTool, MCPTool, McpAuthTool |
| **Scheduling** | CronCreateTool, CronDeleteTool, CronListTool |
| **Discovery** | SearchExtraToolsTool, ExecuteTool, SyntheticOutputTool |
| **Session** | EnterWorktreeTool, ExitWorktreeTool, SkillTool, ConfigTool |
| **Other** | LSPTool, SendMessageTool, MonitorTool, ListPeersTool, BriefTool, SnipTool |

Deferred tool loading: TF-IDF index at `src/services/searchExtraTools/toolIndex.ts` for semantic search.

## Context System

```
src/context.ts — Builds system/user context for API calls
  ├── Git status (branch, changes)
  ├── Date/time
  ├── CLAUDE.md contents (project + hierarchy)
  ├── Memory files (.claude/memory/)
  └── Platform/environment info

src/utils/claudemd.ts — Discovers CLAUDE.md from project tree
```

## Type System (`src/types/`)

| File | Content |
|------|---------|
| `global.d.ts` | MACRO, BUILD_TARGET, BUILD_ENV declarations |
| `internal-modules.d.ts` | `bun:bundle`, `bun:ffi`, `@anthropic-ai/mcpb` |
| `message.ts` | Message hierarchy (User, Assistant, System, ToolUse, etc.) |
| `permissions.ts` | Permission mode + result types |
| `tools.ts` | Tool-related types |

## Plugin System

`src/plugins/` — Plugin install/uninstall/enable/disable + Marketplace browsing. Hook-based extension points.
