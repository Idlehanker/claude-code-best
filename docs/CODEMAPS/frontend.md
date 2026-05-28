<!-- Generated: 2026-05-28 | Files scanned: ~412 | Token estimate: ~900 -->

# Frontend — Terminal UI (Ink/React)

## Framework

Custom forked **Ink** at `packages/@ant/ink/` — React renderer for terminal. Components use React Compiler runtime (`_c()` memoization).

## Screens (3)

| Screen | File | Purpose |
|--------|------|---------|
| REPL | `src/screens/REPL.tsx` | Main interactive chat — input, message list, tool permissions |
| Doctor | `src/screens/Doctor.tsx` | System health check / diagnostics |
| ResumeConversation | `src/screens/ResumeConversation.tsx` | Session picker for resuming |

## Component Tree (REPL)

```
App.tsx (root provider: AppState, Stats, FpsMetrics)
└── Messages.tsx
    └── MessageRow.tsx (per-message rendering)
        ├── UserMessage rendering
        ├── AssistantMessage (text + tool_use blocks)
        ├── ToolResult display
        └── SystemMessage rendering
├── PromptInput/ (user input area)
│   ├── Autocomplete
│   ├── History navigation
│   └── Vim mode support
├── permissions/
│   ├── Permission dialog (allow/deny/always)
│   └── Tool-specific approval UI
└── design-system/
    ├── Dialog, FuzzyPicker, ProgressBar
    ├── ThemeProvider
    └── Reusable UI primitives
```

## Key Components (149 directories)

| Directory | Purpose |
|-----------|---------|
| `App.tsx` | Root provider — state, stats, FPS |
| `Messages.tsx` / `MessageRow.tsx` | Conversation rendering |
| `PromptInput/` | User input with autocomplete, history, vim mode |
| `permissions/` | Tool permission approval dialogs |
| `design-system/` | Reusable UI (Dialog, FuzzyPicker, ProgressBar, ThemeProvider) |
| `DiffView/` | Git diff rendering |
| `FileTree/` | File browser / tree view |
| `PlanView/` | Plan mode visualization (ACP plan display) |

## Vim Mode

`src/vim/` — Vim keybindings for prompt input (normal/insert/visual modes).

## Styling

Chalk-based color output via Ink's color system. Theme defined in `packages/@ant/ink/theme/`. Brand colors: Claude Orange `#D77757`, Claude Blue `#5769F7`.

## Remote Control Web UI

`packages/remote-control-server/` — Separate web dashboard (React 19 + Vite + Radix UI). Not Ink-based.
