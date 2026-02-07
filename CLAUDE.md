# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

prettierd is a daemon-based wrapper around Prettier that provides fast code formatting
for editor integration. It uses [core_d.js](https://github.com/mantoni/core_d.js) to
run Prettier as a persistent background process, avoiding repeated Node.js startup
overhead. Published as `@fsouza/prettierd` on npm.

## Commands

- `yarn build` — compile TypeScript (`tsc -b`, outputs to `dist/`)
- `yarn prettier:check` — verify code formatting
- `yarn prettier:fix` — auto-format all code
- `yarn start` — start the prettierd daemon

There is no test suite. CI runs `prettier:check`, `build`, and then starts the daemon
to verify it works.

## Architecture

```
bin/prettierd          Shell entry point (sets FORCE_COLOR=0, requires dist/prettierd.js)
    ↓
src/prettierd.ts       CLI orchestration: parses args, sets up env vars, manages daemon
    ├─→ src/args.ts         CLI argument definitions and help display
    ├─→ src/get-stdin.ts    Vendored stdin reader (from get-stdin package)
    ├─→ src/service.ts      Core formatting service invoked by core_d daemon
    └─→ core_d              External daemon lifecycle manager (start/stop/restart/status)
```

**prettierd.ts** — Processes CLI arguments into actions (INVOKE*CORE_D, STOP,
PRINT_VERSION, etc.), determines the runtime directory (XDG_RUNTIME_DIR or TMPDIR or
HOME), and forwards `PRETTIERD*\*` environment variables from client to the daemon
service.

**service.ts** — The service module loaded by core_d. Handles:

- Prettier resolution: tries local project prettier first, falls back to bundled.
  `PRETTIERD_LOCAL_PRETTIER_ONLY` env var disables the fallback.
- Config resolution chain: explicit config path → `PRETTIERD_DEFAULT_CONFIG` env var →
  `prettier.resolveConfig()` with editorconfig support.
- Config precedence modes: `cli-override` (default), `file-override`, `prefer-file`.
- Two tasks: `format` (default) and `check`.

**Daemon model** — One daemon instance per working directory, identified by an encoded
dotfile name (`.prettierd@{encoded_cwd}`). Invocation: content is piped via stdin with
the filename as the first argument.

## Code Conventions

- Strict TypeScript (`strict: true` plus all additional strict flags in tsconfig.json)
- ES2018 target, CommonJS modules
- 2-space indentation, formatting enforced by Prettier
- Type declarations for untyped dependencies live in `src/types/`
