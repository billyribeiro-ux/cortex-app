# Cortex

Cortex is a local-first workspace for notes, tasks, goals, prompts, snippets, and technical reference. It runs as a SvelteKit web app and as a Tauri desktop app.

## Development

- `pnpm dev` starts the web app on port 1420.
- `pnpm check` runs Svelte and TypeScript diagnostics.
- `pnpm build` creates the static web build used by Tauri.
- `pnpm tauri:build` creates the desktop bundle.

Existing data stays in browser/Tauri webview storage and can be exported from the sidebar.
