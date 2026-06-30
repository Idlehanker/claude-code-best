# Claude Code Best (CCB) - Reverse-Engineered Prompts Encyclopedia

This document catalogues and reconstructs the LLM prompts and instruction sets used to reverse-engineer, decompile, restore, and adapt the **Claude Code Best (CCB)** codebase. By reviewing these prompts, developers can understand how the decompiled stubs were recovered, how compatibility layers (OpenAI, Gemini, Grok) were built, and how complex features (such as Pipe IPC, Computer Use, Voice Mode, and RCS) were implemented solely through LLM-guided instructions.

---

## Table of Contents

1. [Project Bootstrap & Meta-Context Prompts](#1-project-bootstrap--meta-context-prompts)
2. [Reverse Engineering & Decompilation Prompts](#2-reverse-engineering--decompilation-prompts)
3. [Stub Module Recovery Prompts](#3-stub-module-recovery-prompts)
4. [GrowthBook & Feature Flag Enablement Prompts](#4-growthbook--feature-flag-enablement-prompts)
5. [Multi-API Compatibility Layer Prompts](#5-multi-api-compatibility-layer-prompts)
6. [Cross-Platform Adaptation Prompts](#6-cross-platform-adaptation-prompts)
7. [Architecture & IPC System Design Prompts](#7-architecture--ipc-system-design-prompts)
8. [UI/UX & Design Review Prompts](#8-uiux--design-review-prompts)
9. [Testing & Quality Assurance Prompts](#9-testing--quality-assurance-prompts)
10. [Security & Telemetry Customization Prompts](#10-security--telemetry-customization-prompts)
11. [Build System & Tooling Prompts](#11-build-system--tooling-prompts)
12. [Spec & Design Document Prompts](#12-spec--design-document-prompts)

---

## 1. Project Bootstrap & Meta-Context Prompts

These prompts established the core rules of the repository, including TypeScript strict mode requirements, the feature flag architecture, and custom agent rules.

### Prompt: Repository Guidelines (`CLAUDE.md` / `AGENTS.md`)
> **Context**: The project is being initialized as a reverse-engineered workspace based on Anthropic's Claude Code CLI.
> **Prompt**:
> Create a central developer guideline document `CLAUDE.md` and an agent instructions file `AGENTS.md`. Document the repository's technology stack (Bun, TypeScript, Workspace packages), build commands (`bun run build`, `bun run dev`), linting standards via Biome, and testing frameworks (`bun test`). 
> Underline the following strict principles for all subsequent agent runs:
> 1. Strict TypeScript check mode (`bunx tsc --noEmit` must pass with zero errors).
> 2. The feature flag system must load from `bun:bundle` via `import { feature } from 'bun:bundle'`. Emphasize that `feature()` calls can only be evaluated in direct `if` or ternary conditions due to compiler minification.
> 3. Standardize Git commit messages using the Conventional Commit convention (e.g., `feat: ...`, `fix: ...`, `chore: ...`).
> 4. Document how the modular workspaces packages (such as `@ant/ink`, `packages/builtin-tools`) are structured and how imports should use the `src/` path alias.

---

## 2. Reverse Engineering & Decompilation Prompts

Official binaries contain minified, bundler-optimized React and Node.js code. The following prompts were used to restore readable TypeScript/TSX components and helper logic from the compiled outputs.

### Prompt: Restoring React Compiler Output (`_c()` Boilerplate)
> **Context**: You are analyzing a decompiled React component that was built with the React Compiler. The code is filled with array lookups like `const $ = _c(15)` and cache checks like `$[0] !== value`.
> **Prompt**:
> Analyze the decompiled TSX code of component `[ComponentName]` and reconstruct it into standard, clean, idiomatic React.
> 1. Remove all React Compiler memoization boilerplate (`_c` array instantiations).
> 2. Replace structural checks like `if ($[1] !== prop) { $[1] = prop; ... }` with standard `useMemo` or `useCallback` hooks.
> 3. Ensure state hooks (`useState`, `useEffect`) and context hooks (`useContext`) are restored with meaningful names.
> 4. Ensure TypeScript types are correctly declared, replacing any `any` or minified type casts with precise interfaces corresponding to AppState, Selectors, and component props.

### Prompt: Reconstructing M15 and P15 Minified Dialogs
> **Context**: In `src/screens/REPL.tsx`, there are imports and calls to `UltraplanChoiceDialog` and `UltraplanLaunchDialog`, but these component files are missing from the decompiled workspace.
> **Prompt**:
> Locate the minified functions `M15` and `P15` from the official Claude Code `cli.js` bundle (version 2.1.92). 
> 1. Decompile `M15` into `src/components/ultraplan/UltraplanChoiceDialog.tsx`. Reconstruct the three options: *Implement here* (inject plan into active session), *Start new session* (clear context and run), and *Cancel* (save plan to a markdown file). Ensure the dialog layout adjusts dynamically to terminal height and supports scrolling (Ctrl+U/D, mouse wheel).
> 2. Decompile `P15` into `src/components/ultraplan/UltraplanLaunchDialog.tsx`. Restore the terms of service agreement layout, the time estimations (~10-30 min), and the bridge conflict solver (disconnecting active remote-control bridges on execution).
> 3. Exclude any React Compiler constructs and map statsig/GrowthBook checks to the local feature gate client.

---

## 3. Stub Module Recovery Prompts

Anthropic stubbed out several features before release or in public builds. The following prompts reconstructed the full implementations from minified bundles and design docs.

### Prompt: Chrome Browser MCP Server Implementation
> **Context**: The package `packages/@ant/claude-for-chrome-mcp` is currently a stub returning empty tools.
> **Prompt**:
> Restore the Chrome Browser MCP control service.
> 1. Implement `packages/@ant/claude-for-chrome-mcp/src/index.ts` to export the MCP server and clients.
> 2. Create `browserTools.ts` defining 17 tools to interact with the Claude in Chrome extension (navigating, clicking, typing, taking screenshots).
> 3. Create `mcpSocketClient.ts` and `mcpSocketPool.ts` to manage Unix socket connections across different Chrome user profiles.
> 4. Create `bridgeClient.ts` containing the WebSocket transport layer that relays protocol requests from the local CLI tool to the chrome extension.
> 5. Wire the tool calls in `toolCalls.ts` and verify there are no missing dependencies.

### Prompt: Voice Mode CPAL NAPI Module Recovery
> **Context**: Voice Mode (`/voice` command) is locked because `audio-capture-napi` is a placeholder that does not record audio, and the native `.node` bindings are missing.
> **Prompt**:
> Restore Push-to-Talk voice input capabilities.
> 1. Extract the native `audio-capture.node` binaries for the 6 target platforms (darwin-arm64, darwin-x64, win32-x64, linux-x64, etc.) from the reference files, and save them in `vendor/audio-capture/{platform}/`.
> 2. Implement `vendor/audio-capture-src/index.ts` as a dynamic native module loader that resolves the `.node` file according to `process.platform` and `process.arch`.
> 3. Ensure the module handles errors gracefully, falling back to a dummy stream if the soundcard or permissions are unavailable.

### Prompt: `/poor` Budget/Saving Mode
> **Context**: Users want to minimize token usage by bypassing auxiliary LLM tasks.
> **Prompt**:
> Implement a "省流模式" (budget/saving mode) triggered by `/poor`.
> 1. Register `/poor` in the command registry. Save state globally in `settings.json`.
> 2. In `src/query/stopHooks.ts`, inspect whether the poor mode is active. If active, intercept the turn execution and skip the cost-intensive `extract_memories` and `prompt_suggestion` hooks.
> 3. Print a status indicator to notify the user when the budget mode is active.

### Prompt: WebSearch Bing Adapter Implementation
> **Context**: `WebSearchTool` fails when using non-Anthropic API endpoints, as they lack the server-side search tool.
> **Prompt**:
> Create a fallback search adapter that scrapes Bing.
> 1. Refactor `src/tools/WebSearchTool/WebSearchTool.ts` to use an adapter pattern.
> 2. Write `adapters/bingAdapter.ts`. Craft headers mimicking Edge browser requests (include `Sec-Ch-Ua`, `Sec-Fetch-*` fields) to bypass anti-bot challenges.
> 3. Use `setmkt=en-US` to ensure consistent search results regardless of target IP.
> 4. Parse the response HTML. Extract search titles, URLs (resolving base64 encoded redirect URLs from `/ck/a?`), and snippets (using a fallback selector tree: `.b_lineclamp` -> `.b_caption p` -> direct text).
> 5. Implement local allowed/blocked domain filtering.

---

## 4. GrowthBook & Feature Flag Enablement Prompts

GrowthBook gates controlled ~70 advanced features. Because the open-source client lacks connection keys to Anthropic's private statsig endpoints, these features were disabled.

### Prompt: GrowthBook Fallback Chain and Gate Activation
> **Context**: GrowthBook queries fail and fallback to default (disabled) options because analytics are stubbed.
> **Prompt**:
> Hardcode the local feature defaults to unlock native features.
> 1. In `src/services/analytics/growthbook.ts`, declare a `LOCAL_GATE_DEFAULTS` map containing 25+ boolean gates and 2 object configurations (like `tengu_kairos_brief_config`).
> 2. Enable key developer gates: `tengu_streaming_tool_execution2` (streaming tool outputs), `tengu_session_memory` (cross-session memory), `tengu_hive_evidence` (adversarial verification), and `tengu_kairos_cron` (scheduler).
> 3. Modify the GrowthBook getters (`getFeatureValue`, `checkStatsigFeatureGate`). If statsig fetching is skipped or cached data is absent, attempt to fetch the value from `LOCAL_GATE_DEFAULTS` before returning the fallback default.
> 4. Secure the config parser: Wrap `getGlobalConfig()` lookups in a try/catch, allowing local gate fallbacks to evaluate even when the global configuration has not initialized.

---

## 5. Multi-API Compatibility Layer Prompts

CCB was written to work directly with Anthropic's API. These prompts implemented translation adaptors to let developers run CCB against other providers (OpenAI, Gemini, Grok).

### Prompt: OpenAI Chat Completions Adapter
> **Context**: We want users to log in with an "OpenAI Compatible" endpoint and route all tool requests through OpenAI.
> **Prompt**:
> Create an API compatibility layer for OpenAI/Ollama/DeepSeek.
> 1. Add `openai` as a dependency in `package.json`.
> 2. Modify `src/components/ConsoleOAuthFlow.tsx`. Add the `openai_chat_api` OAuth state, exposing input fields for: Base URL, API Key, Haiku model mapping, Sonnet model mapping, and Opus model mapping.
> 3. Save these settings under a persistent `modelType: 'openai'` tag in `settings.json`.
> 4. Implement `src/services/api/openai/index.ts` to convert Anthropic requests to OpenAI format. Map input roles (user, assistant, system) and tool declarations.
> 5. Create a stream listener. Listen to chunks, aggregate text blocks, thinking blocks (for DeepSeek), and tool invocation JSONs. 
> 6. Dual-yield the stream events: yield incremental events for the REPL terminal to render, and yield final `AssistantMessage` outputs for the agent loop to trigger tools.

### Prompt: Gemini API Adapter Layer
> **Context**: We need a dedicated Gemini provider that handles tool schemas and thinking parameters.
> **Prompt**:
> Implement a Gemini API integration.
> 1. Implement `src/services/api/gemini/` client.
> 2. Create model maps mapping Haiku and Sonnet configurations to `gemini-2.5-flash` and `gemini-2.5-pro`.
> 3. Resolve the mappings prioritizing `GEMINI_MODEL` -> `GEMINI_DEFAULT_*_MODEL` -> fallback.
> 4. Adapt tool schemas. Gemini expects functions declared under `functionDeclarations` inside a `tools` parameter. Transform tool argument types (zod schemas) into Google API JSON schemas.
> 5. Handle response parts, mapping `functionCalls` to Anthropic-style tool request blocks.

---

## 6. Cross-Platform Adaptation Prompts

Anthropic's Computer Use features (taking screenshots, key/mouse event dispatching) were heavily hardcoded to macOS AppleScript APIs. These prompts restored Windows and Linux support.

### Prompt: Computer Use Windows native implementation (OCR + UI Automation)
> **Context**: We need to implement the win32 backend for `@ant/computer-use-swift` and `computer-use-input`.
> **Prompt**:
> Implement a powerful Windows backend for the desktop automation MCP package.
> 1. Create `src/utils/computerUse/win32/windowEnum.ts` using `EnumWindows` FFI. It must output active window list containing HWND, process ID, and window titles.
> 2. Create `windowCapture.ts` leveraging `PrintWindow` Win32 API. This must allow taking screenshots of specific target windows even if they are covered by other windows or running in the background.
> 3. Create `uiAutomation.ts` wrapper around the COM interface `IUIAutomation`. Implement routines to traverse the UI control tree, fetch button coordinate locations, perform click actions, and set value states.
> 4. Create `ocr.ts` loading the native WinRT `Windows.Media.Ocr` engine. Add logic to run optical character recognition on screenshots and return line segments and matching coordinates.
> 5. Integrate these files inside `packages/@ant/computer-use-swift/src/backends/win32.ts` to support screenshots and UI analysis.

### Prompt: Linux xdotool/scrot Support for Computer Use
> **Context**: Implement a Linux fallback for Computer Use.
> **Prompt**:
> Write a Linux backend in `packages/@ant/computer-use-swift/src/backends/linux.ts` and `@ant/computer-use-input/src/backends/linux.ts`.
> 1. Use `scrot` or `gnome-screenshot` commands to capture screens. Detect multi-monitor layouts by querying `xrandr`.
> 2. Use `xdotool` CLI to execute clicks (`xdotool click`), keystrokes (`xdotool key`), mouse moves (`xdotool mousemove`), and window activations (`xdotool windowactivate`).
> 3. Implement clipboard helper commands invoking `xclip` or `xsel`.
> 4. Safeguard all spawns: return graceful errors if dependencies are missing, guiding the user on how to install them (`sudo apt install xdotool scrot xclip`).

---

## 7. Architecture & IPC System Design Prompts

The multi-session architecture of CCB relies on a supervisor daemon and an IPC channel (UDS/TCP) to coordinate inputs, outputs, and permission grants across machines.

### Prompt: Pipe IPC UDS + TCP Dual Transport
> **Context**: PipeServer in `src/utils/pipeTransport.ts` only supports Unix Domain Sockets (UDS), preventing LAN connections.
> **Prompt**:
> Extend PipeServer to support TCP connections for local network attachments.
> 1. Modify `src/utils/pipeTransport.ts`. Extract socket stream configurations into a shared `setupSocket` function.
> 2. In `start()`, accept a `PipeServerOptions` object supporting `{ enableTcp, tcpPort }`. Spawn both a UDS server and a TCP server, sharing the active clients Set and event dispatchers.
> 3. Bind the TCP socket to `0.0.0.0` with port `0` (let OS choose free port).
> 4. Modify `PipeClient` to support connecting to `tcp:host:port` patterns directly, bypassing the UDS file-check loop.

### Prompt: LAN Beacon Peer Discovery
> **Context**: We want remote agents on the same local area network to discover each other automatically.
> **Prompt**:
> Write a UDP multicast beacon system in `src/utils/lanBeacon.ts`.
> 1. Bind to UDP multicast address `224.0.71.67` and port `7101` with `TTL=1`.
> 2. Multicast a JSON payload (`{ proto, pipeName, machineId, hostname, ip, tcpPort, role, ts }`) every 3 seconds.
> 3. Maintain an active peer list. Expire and prune peers if they fail to announce within 15 seconds.
> 4. Fix WSL/Docker adapter hijacking: force multicast membership to bind to the primary LAN interface IP rather than WSL virtual bridge IPs (using `addMembership` and `setMulticastInterface` with the LAN IP).

### Prompt: Headless Daemon Supervisor
> **Context**: `src/daemon/main.ts` is currently a stub. We need to implement the supervisor lifecycle daemon.
> **Prompt**:
> Implement the supervisor process in `src/daemon/main.ts` and `src/daemon/workerRegistry.ts`.
> 1. `daemonMain()` must accept `start`, `status`, and `stop` actions.
> 2. `start` must spawn a child worker using `bun run src/entrypoints/cli.tsx --daemon-worker=remoteControl`.
> 3. Implement an exponential backoff restarting mechanism (2s to 120s limit). If a worker crashes 5 times in 10 seconds, park it.
> 4. Handle exit codes: if the worker exits with code `78` (permanent configuration error), park it immediately.
> 5. Wire SIGTERM listeners to gracefully shutdown the child, allowing a 30-second window before executing SIGKILL.

---

## 8. UI/UX & Design Review Prompts

These prompts detail how user-facing CLI elements, error handlers, and help text layouts were iteratively optimized for a friendly developer experience.

### Prompt: User-Facing Error Optimization (Design Review 1)
> **Context**: First-round design review identified cold, unhelpful error blocks when budgets or turn limits are hit.
> **Prompt**:
> Refactor query execution handlers to provide clear tips.
> 1. In `src/cli/print.ts` and `src/QueryEngine.ts`, intercept errors where max tokens, maximum turns, or budget constraints (`--max-budget-usd`) are exceeded.
> 2. Print a friendly hint block detailing exactly how to adjust CLI arguments (e.g., "Run with `--max-budget-usd <value>` to increase limits").
> 3. Rewrite onboarding descriptions in `Onboarding.tsx` from dry technical warnings to an inviting "Before you start, keep in mind" style.
> 4. Condense the security confirmation message inside `TrustDialog.tsx` to lower user cognitive load.

### Prompt: Input Prompts and Help Dialog updates (Design Review 2 & 3)
> **Context**: Users are confused by permission dialog shortcuts and how to switch models.
> **Prompt**:
> Improve command guides in the terminal interface.
> 1. In the file and shell execution permission boxes, replace ambiguous labels like "Esc to cancel" with "Esc to reject", and "Tab to amend" with "Tab to add feedback".
> 2. Shorten workspace access descriptions under `permissionOptions.tsx` to prevent clipping on narrow terminal sizes (limit to under 50 characters).
> 3. In `src/components/HelpV2/General.tsx`, replace the wall of keyboard shortcuts with a clear 3-step "Getting started" walkthrough.
> 4. Update the subtitle of `ModelPicker.tsx` to explicitly explain the shortcuts: "← → to adjust effort, Space to toggle 1M context".

---

## 9. Testing & Quality Assurance Prompts

The repository enforces strict testing practices. The following prompts defined the test structures, isolation guards, and mocking rules.

### Prompt: Unit Testing Concurrent Tasks with File Locks
> **Context**: We need to write tests verifying task operations in `src/utils/__tests__/tasks.test.ts`.
> **Prompt**:
> Write a comprehensive unit test suite with 35+ test cases covering `tasks.ts` CRUD.
> 1. Test task creation, reading, updating, and deletion.
> 2. Verify high-watermark tracking: ensure deleted tasks do not release their IDs for new tasks.
> 3. Assert concurrent safety: test operations using mock file locks.
> 4. Verify race protection on `claimTask` when the worker agent status changes (`agent_busy`).
> 5. Implement test cleanup using a `resetTaskList()` helper.

### Prompt: Enforcing Strict Mock Separation
> **Context**: Biome and tsc fail when tests mock common side-effect packages in duplicate ways, causing import clashes.
> **Prompt**:
> Restructure how mocks are declared across the test directories.
> 1. Extract side-effect mocks like `log.ts` and `debug.ts` to `tests/mocks/log.ts` and `tests/mocks/debug.ts`.
> 2. In unit test suites, import mocks via `mock.module("src/utils/log.ts", logMock)`.
> 3. Do not declare inline modules inside test files for common utilities.
> 4. Do not mock pure utility functions (`stringUtils.ts`). Only mock modules that read disk directories, resolve absolute paths, or fetch network streams.

---

## 10. Security & Telemetry Customization Prompts

Official builds shipped with telemetry, analytics reporting, and mechanisms designed to pollute model distillation datasets. The prompts below removed these and made reporting configurable.

### Prompt: Anti-Distillation Data Injection Removal
> **Context**: The codebase injects fake tools into tool declarations to disrupt third-party models training on Claude Code traces. We need to strip this out.
> **Prompt**:
> Locate and remove all anti-distillation code blocks.
> 1. Search `src/services/api/claude.ts` for features matching `ANTI_DISTILLATION_CC`. Delete the logic injecting dummy/fake tools into API requests.
> 2. Remove the connector text summarization header beta values from `src/utils/betas.ts` and `src/constants/betas.ts`.
> 3. Clean up formatting annotations in `src/utils/streamlinedTransform.ts` that mention distillation resistance, naming them "compact mode" instead.

### Prompt: Opt-in Telemetry and Custom Sentry Setup
> **Context**: Telemetry endpoints are hardcoded to Anthropic's endpoints.
> **Prompt**:
> Configure error logging to be opt-in.
> 1. Modify `src/services/analytics/datadog.ts`. Instead of hardcoding endpoints, read `process.env.DATADOG_LOGS_ENDPOINT` and `process.env.DATADOG_API_KEY`. If empty, disable Datadog reporting entirely.
> 2. Write `src/utils/sentry.ts`. Initialize Sentry only when a valid `SENTRY_DSN` env variable is present.
> 3. Implement a `beforeSend` callback that strips Authorization headers, API keys, and file paths containing private directories before dispatching errors.
> 4. Bind Sentry log triggers inside the central `errorLogSink.ts` file, and implement a custom React error boundary `SentryErrorBoundary.ts` that intercepts rendering crashes.

---

## 11. Build System & Tooling Prompts

The build script compiles typescript packages, resolves bundle splits, and updates require tags for Node.js compatibility.

### Prompt: Vite and Bun Build Splitting
> **Context**: We need to compile ESM packages into a target `dist/cli.js` executable that runs on both Node.js and Bun.
> **Prompt**:
> Rewrite `build.ts` to coordinate Bun compilation.
> 1. Call `Bun.build()` with splitting enabled (`splitting: true`), setting the target format to `esm` and entry point to `src/entrypoints/cli.tsx`.
> 2. Declare 19 compile-time features via the `define` parameter (such as `BUDDY`, `BRIDGE_MODE`, `poor`).
> 3. Add a post-build processing pass. Parse output files and substitute instances of `import.meta.require` with a helper that resolves require hooks dynamically when running under Node.js environments.

---

## 12. Spec & Design Document Prompts

Before complex implementations, formal specs were written to outline design decisions. The following prompts generated the blueprints for major changes.

### Prompt: Spec Blueprint for Agent Forking Redesign
> **Context**: The `FORK_SUBAGENT` feature is currently a binary switch that forces all child agents to inherit the entire history, which consumes excessive tokens.
> **Prompt**:
> Write a feature design document `spec/feature_20260502_F001_fork-agent-redesign/spec-design.md` detailing the transition from implicit to explicit agent context-forking.
> 1. Define the background: Explain why implicit context inheritance forces exploration sub-agents to use expensive models, inflating token costs.
> 2. Propose the schema change: Add an optional `fork: boolean` parameter to the `AgentTool` input schema. Only include this parameter in the schema if the `FORK_SUBAGENT` compiler flag is active.
> 3. Design the routing rules: If `fork: true` is passed and the compiler flag is on, choose the fork path and inherit parent history. Otherwise, default to standard, isolated general-purpose agents. Include a routing truth table.
> 4. Document how this change decouples background execution parameters (`run_in_background`) from the feature flag status.
