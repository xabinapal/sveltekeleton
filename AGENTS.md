# AGENTS.md

How to work in this codebase. This file defines stable conventions and behaviors
for AI agents (and humans). It is intentionally **non-volatile**: it describes
principles and patterns, not version numbers or exhaustive file lists. Update it
only when a convention itself changes — not for ordinary feature work.

## What this project is

A SvelteKit skeleton deployed to Cloudflare Workers, backed by Cloudflare D1
and Workers KV.
It exists as a common starting point for new applications, so consistency and
predictability matter more than cleverness.

## Stack

- **SvelteKit + Svelte 5** using runes (`$state`, `$props`, `$derived`, …).
- **TypeScript** in strict mode.
- **Cloudflare Workers + D1 + KV** via Wrangler; `@sveltejs/adapter-cloudflare`.
- **Kysely** ORM with code-based migrations (no raw SQL).
- **Tailwind CSS v4 + daisyUI** for all UI (see [DESIGN.md](DESIGN.md)).
- **Superforms + Zod** for schema-driven forms and validation.
- **Svelte Headless Table** for data tables, filtering, sorting, and pagination.
- **Vite** as the build/dev server.
- **mise** manages tools (Node, npm) and runs every task.
- **ESLint + Prettier** for lint/format, **svelte-check** for types, **vitest**
  for unit tests, **logfmt** structured logging.

## Commands

All work flows through mise, which delegates to npm scripts:

| Task               | Purpose                               |
| ------------------ | ------------------------------------- |
| `mise run init`    | Install tools and dependencies        |
| `mise run dev`     | Start the dev server                  |
| `mise run build`   | Production build                      |
| `mise run preview` | Preview the production build          |
| `mise run deploy`  | Build and deploy to Cloudflare        |
| `mise run format`  | Format with Prettier                  |
| `mise run lint`    | Prettier check + ESLint               |
| `mise run check`   | svelte-check type checking            |
| `mise run test`    | Run unit tests                        |
| `mise run migrate` | Apply D1 migrations (local)           |
| `mise run reset`   | Wipe local D1 and re-apply migrations |

## Project layout (stable categories)

- `src/lib/server/` — server-only code: `database/` (Kysely), `kv/` (Workers
  KV), `logger`, `logfmt`, and domain logic. Never import from here into client
  code.
- `src/lib/site.ts` — static app identity (title, description, indexability).
- `src/routes/` — SvelteKit routes and endpoints (`+page`, `+layout`, `+server`).
- `src/lib/components/` — reusable Svelte components (built from daisyUI).
- `static/` — static assets.
- `scripts/` — dev scripts (migrate, reset-db).
- `mise.toml`, `wrangler.jsonc`, `svelte.config.js`, `vite.config.ts`,
  `vitest.config.ts`, `tsconfig.json`, `eslint.config.js`.

## Working principles

- **KISS / YAGNI.** Build the simplest thing that works. Don't add abstractions,
  options, or dependencies for imaginary future needs.
- **SOLID.** Small, single-responsibility modules. Depend on abstractions, not
  concrete bindings.
- **DDD.** Put domain logic in pure, framework-agnostic modules under
  `src/lib/server/` (or `src/lib/`). Routes and endpoints are thin adapters that
  parse input, call domain functions, and shape output. Keep framework-coupled
  code (`$app/*`, bindings, `fetch`) at the edges, not in the core.
- **Dependency injection.** Pass dependencies (the database, clients, config) as
  parameters so they can be mocked in tests. Don't reach for globals inside
  domain functions.
- **Stay focused.** Make the requested change. Don't refactor unrelated code in
  the same change. Check for existing utilities before creating new ones.

## SvelteKit & Svelte 5 conventions

- **Runes only.** Use `$state`, `$derived`, `$props()`, `$bindable()`, `$effect`.
  Never Svelte 4 syntax: no `export let`, no `$:` reactive declarations, no
  `on:click` directives, no `createEventDispatcher`, no `<slot>`.
- **`$derived` for computed values; never `$effect`.** Don't use `$effect` to
  assign a value that could be derived. Use `$effect` only for side effects, and
  always return a cleanup function for subscriptions/listeners.
- **Type props.** Components use an `interface Props` + `let { … }: Props =
$props()`. Routes use the generated `PageProps` / `LayoutProps` from
  `./$types` — never untyped `$props()` in a page or layout.
- **Events are HTML attributes.** `onclick`, not `on:click`. There are no event
  modifiers — call `event.preventDefault()` / `stopPropagation()` inside the
  handler. Component-to-parent communication uses callback props, not
  `createEventDispatcher`.
- **Snippets, not slots.** `let { children } = $props()` and `{@render
children?.()}`; use optional chaining for optional snippets.
- **Data loading boundaries.** Secrets, D1, KV, and private env belong in
  `+page.server.ts` / `$lib/server` — never in universal `+page.js` (which also
  runs in the browser). Use `+page.server.ts` loads for data and form actions
  for mutations; don't fetch client-side for page data.
- **Forms.** Use Superforms with Zod for form state and validation. Define each
  schema at module scope, initialize it with `superValidate`, return
  `fail(400, { form })` when invalid, and use Superforms' `message` helper for
  successful actions. On the client, use `superForm` and its `enhance` action;
  don't hand-roll form state or use SvelteKit's raw `enhance` action directly.
  Use `throw error(status, …)` for unexpected errors and
  `throw redirect(status, …)` for auth/redirects.
- **Data tables.** Use `@humanspeak/svelte-headless-table` and its plugins for
  filtering, sorting, pagination, selection, and other table state; don't
  implement these behaviors manually. Use client-side plugins only for bounded,
  already-loaded datasets. For large or remote datasets, use server-side plugin
  mode and keep query state in the URL. Render semantic table markup, preserve
  accessible labels and sort state, and style it with daisyUI table primitives.
- **SSR safety.** Never store per-user data in module-level `let` or global
  `$state` — it leaks across requests on the server. Per-user data flows through
  `event.locals` and is returned from `load`. (App-wide singletons like the
  shared DB client are fine.)
- **Performance.** Parallelize independent async work with `Promise.all`, and
  stream non-critical data by returning un-awaited promises from `load`. Don't
  reimplement in `$effect` what Svelte can do declaratively (`{#if}`, class
  bindings).

## Logging

- Use the structured logger from `$lib/server/logger` — it emits logfmt lines
  (message, level, timestamp, then `key=value` context).
- **Never use raw `console.log`/`console.error` in application code.** Use the
  logger at the appropriate level (`debug`/`info`/`warn`/`error`).
- Access logs are handled centrally in `hooks.server.ts`; don't re-log requests
  in routes.
- Keep log messages and keys stable and lowercase.

## Storage

### D1 and Kysely

- D1 is the relational source of truth. Access it through `event.locals.db` and
  **Kysely** (`src/lib/server/database/`), never through raw D1 or raw SQL. It is
  server-only.
- **Migrations are TypeScript** using Kysely's schema builder — never raw SQL
  files. Each migration lives in `migrations/NNNN_name.ts` and is registered in
  `migrations/index.ts`. Give every migration a `down` if you want it to support
  `mise run reset`.
- Migrations run automatically before the first request and on demand via
  `mise run migrate`. Initialization is single-flight per Worker isolate,
  migration failures fail the request and are retried on the next request.
- D1 does not support the transactions or cross-isolate locks expected by
  Kysely's SQLite migrator. Every migration must therefore be replay-safe; use
  `ifNotExists`, conflict handling, and other idempotent operations where needed.
- The custom D1 introspector supports Kysely migration discovery only. General
  `db.introspection` calls fail explicitly because Workers-bound D1 does not
  expose the PRAGMA metadata required for a correct result.
- Wrangler provides a local D1 database under `.wrangler/`; production requires
  replacing the `database_id` placeholder in `wrangler.jsonc`. Local scripts
  must set `remoteBindings: false` explicitly.

### Workers KV

- Access KV through the namespaced JSON store at `event.locals.kv`, implemented
  in `src/lib/server/kv/`; do not scatter direct `event.platform.env.KV` calls.
- Use versioned domain keys such as `sessions:v1:<token>` or `cache:v1:<id>` and
  expiration for temporary data. KV has no migrations; introduce a new key
  version when stored shapes change.
- KV is eventually consistent and read-optimized. Use it for caches,
  configuration, preferences, allow-lists, and session records where delayed
  invalidation is acceptable. Never use it for atomic counters, locks,
  transactions, or immediate global session revocation.
- Session keys must be high-entropy, live only in secure cookies, and have an
  explicit expiration. Do not put secrets or KV values into client code unless
  the route intentionally returns a safe projection. Validate stored JSON at
  the domain boundary before trusting security-sensitive fields.
- Wrangler provides local, persistent KV under `.wrangler/` during development;
  never enable remote bindings by default.
- In tests, mock both D1 and KV. Tests must not require Cloudflare resources.

## Verification gates (mandatory)

- After coding — even small edits — run `mise run format`, `mise run lint`, and
  `mise run check`. Add `mise run test` when tests are involved.
- A **pre-commit hook** automatically runs `format`, `lint`, and `check` on every
  commit and aborts on failure. Never bypass it with `--no-verify`.
- Do not consider work done until all gates pass. Type errors and lint failures
  are not acceptable.

## Dependency policy

- Ask before adding, removing, or upgrading dependencies.
- Prefer the Node standard library and packages already in the repo over new
  ones. Pin every npm dependency to an exact version; range constraints such as
  `^`, `~`, `>`, `<`, or `*` are not allowed.
- npm blocks install scripts by default; if a newly added native dependency
  needs one, add it under `allowScripts` in `package.json`.

## Escalation triggers (ask first)

- Adding, removing, or upgrading dependencies.
- Deploying to Cloudflare, changing remote D1/KV data, or running any destructive
  command against remote storage. (`mise run reset` is local-only — never assume
  it is safe to run remotely.)
- Changing the on-disk migration format, the wrangler bindings, or the public
  task/CLI surface (`mise.toml`, npm scripts).

## Testing

- **Unit tests only** for now — no UI/DOM tests, no end-to-end tests, no
  integration tests that spin up infrastructure.
- Tests must be **self-contained**: mock storage and any external resource. A
  test run must never require D1, KV, Workers, or network access.
- **Test-first (TDD)** for new logic: write the test, watch it fail, implement,
  watch it pass. But **don't overtest** — write meaningful tests for real
  behavior, not a test per trivial getter or for every branch of every function.
- Keep logic **pure and separable** so it's testable without framework imports
  (see `src/lib/server/logfmt.ts` + its test as the pattern). Code that needs
  `$app/*` or bindings should be a thin wrapper around pure logic.
- Test files sit next to the module as `*.test.ts`. Run them with `mise run test`.

## UI work — read DESIGN.md first

- **Before any UI change, read [DESIGN.md](DESIGN.md).** It is the design
  contract and a mandatory check for UI work.
- **DESIGN.md follows the official [design.md format spec](https://github.com/google-labs-code/design.md).**
  It is YAML design tokens (front matter) plus markdown rationale — not free
  text. Treat the tokens as the normative design values. Validate changes with
  `npx @google/design.md lint DESIGN.md` (must pass with no errors).
- **Always use daisyUI components.** Never use a raw element (`<button>`,
  `<div>` card, hand-rolled modal, etc.) when a daisyUI component exists.
  Tailwind utilities are for layout/spacing; daisyUI is for components and
  theming. If no daisyUI component fits, compose the smallest possible wrapper
  from daisyUI primitives as a Svelte component under `src/lib/components/` — not
  from raw elements.
- Use daisyUI semantic color tokens (`text-primary`, `bg-base-200`, …). Do not
  hardcode hex colors in markup; if a new value is needed, add it as a token in
  `DESIGN.md` first.
- Preserve accessibility: keep daisyUI's ARIA roles and keyboard behavior, and
  keep theming working in all configured themes.
- Theme/token changes happen in two places that must stay in sync: the daisyUI
  theme in `src/app.css` and the tokens in `DESIGN.md`.

## Git workflow

- **Conventional commits** (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`,
  `chore:`, `build:`, …), lowercase, with a concise imperative subject and a
  bulletted body for anything non-trivial.
- **Every commit must be GPG-signed and signed off.** Always commit with
  `git commit -S -s` — `-S` produces a verified GPG signature and `-s` adds the
  `Signed-off-by:` trailer. Never use `--no-verify`, `--no-gpg-sign`, or commit
  without signing. (This is in addition to the pre-commit hook, which runs the
  format/lint/check gates.)
- **Commit often.** Each commit is one logical, reviewable unit. Don't wait until
  a feature is "completely finished" to start committing — commit as soon as a
  coherent change stands on its own. Equally, don't batch unrelated changes into
  one commit.
- Don't commit during speculative exploration or while debugging blindly.
- Include the required attribution trailers on every commit: `Signed-off-by:`
  (from `-s`) and a `Co-Authored-By:` trailer identifying the model used for
  the change with its provider-associated email address (for example,
  `Co-Authored-By: GPT-5.6-Luna <noreply@openai.com>` when using GPT-5.6-Luna).

## Maintenance

- **`AGENTS.md` is non-volatile.** It holds principles and conventions, not
  version pins, exact dependency lists, or file inventories. Update it only when
  a convention itself changes — not for ordinary feature work.
- **Keep stable docs accurate.** Update `README.md` when setup, commands, or
  supported runtimes change. Update `DESIGN.md` when the UI rules change. Don't
  let them drift from the code.
