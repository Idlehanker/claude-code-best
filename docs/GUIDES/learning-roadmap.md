# Learning Roadmap: Claude Code (Decompiled)

This guide provides a structured approach to mastering the codebase of the Claude Code CLI. Use this as a checklist for your deep-dive analysis.

## 🎯 Phase 1: The "Heart" (The Turn Loop)
*Goal: Understand how a single user request becomes an LLM response and an action.*

- [ ] **Trace the Happy Path**: Follow a simple command (like `grep`) from entry to execution.
    - `src/entrypoints/cli.tsx` $\rightarrow$ `src/main.tsx` $\rightarrow$ `src/QueryEngine.ts` $\rightarrow$ `src/query.ts` $\rightarrow$ `src/tools.ts` $\rightarrow$ `packages/builtin-tools/`
- [ ] **Analyze the Orchestrator**: Study `src/QueryEngine.ts` to understand how conversation history is managed, how context is compacted, and how tool results are fed back into the loop.
- [ ] **Understand the API Client**: Study `src/services/api/claude.ts` to see how the Anthropic SDK is wrapped and how streaming events are handled.

## 🎯 Phase 2: The "Hands" (The Tool System)
*Goal: Understand what the agent is capable of doing.*

- [ ] **Audit the Registry**: Examine `src/tools.ts` and `src/constants/tools.ts` to see the core capabilities.
- [ ] **Explore Tool Categories**: Browse `packages/builtin-tools/src/tools/` to understand the different "domains" (File Ops, Shell, Web, Agentic, etc.).
- [ ] **Study Dynamic Loading**: Look at `src/services/searchExtraTools/` to see how the system handles tools that aren't in the core whitelist via TF-IDF.

## 🎯 Phase 3: The "Brain" (State & Context)
*Goal: Understand how the application "remembers" information.*

- [ ] **Study the State Store**: Examine `src/state/AppState.tsx` and `src/state/store.ts` to see the global state schema.
- [ ] **Analyze Session Bootstrapping**: Look at `src/bootstrap/state.ts` for module-level singletons like CWD, project root, and token counts.
- [ ] **Observe the UI State**: Look at `src/screens/REPL.tsx` to see how the state is mapped to the terminal UI.

## 🎯 Phase 4: The "Body" (Extended Modes)
*Goal: Understand the advanced, feature-gated functionalities.*

- [ ] **Remote Control & Bridge**: Study `src/bridge/` and `packages/remote-control-server/` to understand the multi-user/remote-access architecture.
- [ ] **Daemon Mode**: Study `src/daemon/` to see how the supervisor manages background workers.
- [ ] **ACP Protocol**: Study `src/services/acp/` and `packages/acp-link/` to understand how Claude Code interacts with external agents.

## 🛠 Quick-Reference Development Tips
- **Precheck**: Always run `bun run precheck` after any change.
- **Feature Flags**: Check `scripts/defines.ts` and `build.ts` to see what is active.
- **Path Aliases**: `src/*` maps to `./src/*`.
- **Mocking**: Only mock side-effect-heavy dependencies (like `axios` or `log.ts`); do not mock pure business logic.

---
*This guide was synthesized from the project's architecture and repository analysis.*
