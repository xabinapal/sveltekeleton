# sveltekeleton

An opinionated SvelteKit boilerplate for shipping applications to Cloudflare
Workers. It distills the shared conventions from real, production-deployed
SvelteKit + Cloudflare apps into a fast, common starting point.

## Stack

- **SvelteKit 2** + **Svelte 5** (runes)
- **Vite 8** with the devtools-json plugin
- **Tailwind CSS v4** (CSS-first, via the `@tailwindcss/vite` plugin) with **daisyUI** components
- **Superforms + Zod** for schema-driven forms and **Svelte Headless Table** for data grids
- **Cloudflare Workers** deployment via `@sveltejs/adapter-cloudflare` + Wrangler
- **Cloudflare D1** database accessed through the **Kysely** ORM with code-based migrations
- **Cloudflare KV** for globally distributed caches, configuration, preferences, and session data
- **TypeScript 6** in strict mode with `svelte-check`
- **Prettier** + **ESLint 10** (flat config) for formatting and linting
- **mise** for tool and task management (Node.js 26 + npm 12)

## Prerequisites

- [mise](https://mise.jdx.dev/) — pins Node.js and npm and runs all tasks.

Node.js and npm versions are declared in `mise.toml`. mise installs them
automatically on first use.

## Getting started

```sh
mise run init   # install mise tools and npm dependencies
mise run dev    # start the Vite dev server
```

The dev server runs on `http://localhost:5173`. Startup applies pending local D1
migrations, clears every application table, and inserts useful development data.

## Debugging

Breakpoint configurations are committed in [`.vscode/launch.json`](.vscode/launch.json).

### Visual Studio Code

Open **Run and Debug**, select `SvelteKit: VS Code breakpoints`, and press `F5`.
VS Code starts `mise run dev` in its JavaScript debug terminal, allowing
breakpoints in both client and server SvelteKit source.

### Google Chrome

In VS Code, select `SvelteKit: Chrome breakpoints` to start the
inspected development server and a separate Chrome debug profile. Set client
breakpoints in VS Code or Chrome DevTools source maps.

Outside VS Code, run:

```sh
mise run debug-chrome
```

Then open `chrome://inspect` in Chrome and select the dedicated Node DevTools
target. Open `http://localhost:5173` in Chrome to debug client source maps.

## Tasks

All tasks are run through mise, which delegates to the underlying npm scripts
defined in `package.json`.

| Task                        | Description                             |
| --------------------------- | --------------------------------------- |
| `mise run init`             | Install mise tools and npm dependencies |
| `mise run dev`              | Start the Vite dev server               |
| `mise run build`            | Build for production                    |
| `mise run preview`          | Preview the production build locally    |
| `mise run deploy`           | Build and deploy to Cloudflare Workers  |
| `mise run lint`             | Run Prettier checks and ESLint          |
| `mise run format`           | Format the codebase with Prettier       |
| `mise run design-lint`      | Validate `DESIGN.md`                    |
| `mise run check`            | Run `svelte-check` type checking        |
| `mise run test`             | Run all test suites                     |
| `mise run test-unit`        | Run Node unit tests                     |
| `mise run test-component`   | Run Svelte component tests              |
| `mise run test-integration` | Run isolated local integration tests    |
| `mise run migrate`          | Run D1 migrations against the local DB  |
| `mise run preseed`          | Replace local D1 data with dummy data   |
| `mise run reset`            | Wipe local D1 and re-apply from scratch |

## Environment variables

Only values that change between environments live in env vars. Copy the example
file and adjust:

```sh
cp .env.example .env
```

| Variable       | Purpose                                      |
| -------------- | -------------------------------------------- |
| `APP_BASE_URL` | Canonical base URL (local dev vs production) |

Static app identity — title, description, author, keywords, and theme color —
lives in [`src/lib/site.ts`](src/lib/site.ts), not in env vars.

## Testing

`mise run test` runs three isolated Vitest suites:

- Node unit tests beside source modules as `*.test.ts`.
- Svelte component tests as `*.component.test.ts` using Testing Library and
  jsdom.
- Local D1 integration tests under `tests/integration/` using Wrangler with
  persistence and remote bindings disabled.

The integration suite creates an ephemeral local D1 database and cannot access
production resources. The pre-commit hook runs the complete suite together with
formatting, linting, and type checks.

### Search engine visibility

Apps are **private by default**: `site.indexable` is `false`, which emits
`noindex,nofollow` and serves `Disallow: /` from `/robots.txt`. To make an app
public, flip the flag in `src/lib/site.ts`:

```ts
export const site = {
	// ...
	indexable: true,
} as const;
```

This single switch updates both the robots meta tag and the `robots.txt` route.

## Database (D1)

The skeleton ships with Cloudflare D1 support through the Kysely ORM, including
a migrations framework. Migrations are written in TypeScript using Kysely's
schema builder — never raw SQL.

### Local development

In `vite dev`, the `adapter-cloudflare` platform proxy exposes the D1 binding
(`event.platform.env.DB`) backed by a local SQLite database stored under
`.wrangler/`. Before Vite starts, the development command applies pending
migrations and replaces all application data with useful dummy records. The
preseed is intentionally destructive and runs on every development server
start, keeping the local database predictable without manual setup.

Migrations also run automatically on the first request after a server start as
a runtime safeguard. Concurrent requests in one Worker isolate share the same
initialization. A migration failure fails the request and is retried rather than
silently serving against a stale schema.

To run migrations explicitly against the local database (without starting the
dev server):

```sh
mise run migrate
```

To clear every application table and insert fresh development data manually:

```sh
mise run preseed
```

The preseed command applies pending migrations first, uses Kysely rather than
raw SQL, and always disables remote bindings. Its implementation lives entirely
under `scripts/`; application code does not import it, so production builds and
deployments neither execute nor bundle development seed logic.

To wipe the local database and re-apply every migration from scratch (handy
during development):

```sh
mise run reset
```

This rolls all migrations back through their `down` methods and re-applies them,
so each migration must have a `down`; reset aborts before changing the database
if an irreversible migration is registered. All database scripts explicitly
disable remote bindings.

### Writing migrations

Add a new migration file in `src/lib/server/database/migrations/` using the
`NNNN_name.ts` convention, then register it in `migrations/index.ts`:

```ts
import type { Kysely } from "kysely";
import type { Migration } from "kysely/migration";

export const example: Migration = {
	async up(db: Kysely<any>): Promise<void> {
		await db.schema
			.createTable("example")
			.ifNotExists()
			.addColumn("id", "integer", (col) => col.primaryKey())
			.execute();
	},
};
```

The Kysely schema builder keeps every schema change type-checked and SQL-free.
Migrations are bundled into the Worker (no filesystem access at runtime), so
they also run on cold starts in production. D1 cannot provide transactions or
cross-isolate migration locks through this dialect, so every migration must be
safe to retry. Use `ifNotExists`, conflict handling, and equivalent idempotent
operations where needed.

The D1 dialect exposes only the table discovery required by Kysely migrations.
General Kysely schema introspection throws explicitly because Workers-bound D1
does not expose the PRAGMA metadata needed to return correct column details.

### Production

Before deploying, create a real D1 database and set its id in `wrangler.jsonc`:

```sh
mise exec -- npx wrangler d1 create sveltekeleton   # copy the printed database_id
```

Replace the `database_id` placeholder in `wrangler.jsonc`, then `mise run deploy`.
Migrations are applied automatically on the first request after each deploy.

## Key-value storage (KV)

The `KV` binding is exposed by Wrangler as `event.platform.env.KV`. The server
hook wraps it as a namespaced JSON store at `event.locals.kv`, so routes and
server modules share serialization and key conventions instead of calling the
raw binding directly:

```ts
interface Session {
	userId: string;
}

const session = await locals.kv?.get<Session>(`sessions:v1:${token}`);
await locals.kv?.put(`sessions:v1:${token}`, { userId }, { expirationTtl: 3600 });
await locals.kv?.delete(`sessions:v1:${token}`);
```

The wrapper adds the `app:` prefix. Callers should add a domain and version,
such as `sessions:v1:` or `cache:v1:`, and use expiration for temporary values.
KV has no schema migrations; evolve key formats by introducing a new versioned
prefix and deleting old keys when they are no longer needed.

### Local development

The adapter-cloudflare platform proxy provides a local KV implementation during
`mise run dev`. Values persist under `.wrangler/` and never touch production KV,
so the placeholder namespace id in `wrangler.jsonc` is enough for development.
The starter page demonstrates this with a five-minute cache entry: the first
request reports a miss and later requests report a hit.

### Consistency and sessions

Workers KV is optimized for read-heavy workloads and is eventually consistent.
Writes, updates, and deletes may take 60 seconds or more to become visible in
other locations. It is appropriate for caches, configuration, preferences,
allow-lists, and expiring session records when delayed invalidation is
acceptable. Do not use KV for counters, locks, transactions, write-heavy data,
or security flows that require immediate global revocation; use D1 or another
coordination mechanism instead. Session identifiers must be high-entropy,
stored only in secure cookies, and paired with explicit KV expiration.

### Production

Create the production namespace before deployment:

```sh
mise exec -- npx wrangler kv namespace create KV   # copy the printed id
```

Replace the KV `id` placeholder in `wrangler.jsonc`. Deployment requires both
the real D1 database id and KV namespace id.

## Logging

Structured logs are emitted in [logfmt](https://brandur.org/logfmt) — `key=value`
pairs with the message first — and are written to the console, so they appear in
the Vite dev terminal and in Cloudflare logs (`wrangler tail` / Workers
observability).

```
msg="GET /" level=info ts=2026-08-03T16:39:55Z method=GET path=/ status=200 duration_ms=15
```

Access logging is built into `hooks.server.ts`: every request logs its method,
path, status, and duration, with the level rising to `warn` (4xx) and `error`
(5xx). Internal events (e.g. migrations) are logged the same way.

Use the logger from any server module:

```ts
import { logger } from "$lib/server/logger";

logger.info("user created", { id: 42 });
logger.error("payment failed", { reason: "insufficient_funds" });
```

Levels are `debug`, `info`, `warn`, and `error`. `debug` is only shown in
development; `info` and above are shown everywhere.

## Project structure

```
mise.toml              tool pins and task definitions
svelte.config.js       adapter-cloudflare + APP_ env prefix
vite.config.ts         sveltekit plugin and dev server
wrangler.jsonc         cloudflare workers deployment config
tsconfig.json          strict typescript configuration
eslint.config.js       eslint flat config
vitest.config.ts       node unit test configuration
vitest.component.config.ts  jsdom component test configuration
vitest.integration.config.ts local Wrangler integration test configuration
src/
  app.html             html shell
  app.d.ts             app type declarations (Locals, Platform)
  app.css              tailwind import and daisyui plugin
  hooks.server.ts      creates storage clients, runs migrations, emits access logs
  lib/site.ts          site metadata, manifest settings, and indexability flag
  lib/components/      reusable daisyUI components, including the data table
  lib/server/logger.ts structured logfmt logger
  lib/server/database/ kysely orm layer
    schema.ts          table and database types
    db.ts              d1-backed kysely client factory
    d1-dialect.ts      d1-safe dialect and introspector
    migrator.ts        kysely migrator (transactions disabled for d1)
    migrations/        code-based migration files + index registry
  lib/server/kv/       namespaced JSON wrapper for Cloudflare KV
  lib/server/cache/    read-through cache policies
  lib/server/visits/   counter repository, service, and form action
  lib/visits/          shared counter validation schema
  routes/
    +layout.svelte     layout with seo meta tags
    +page.server.ts    load + action reading and writing d1
    +page.svelte       landing page
    +error.svelte      error page
    robots.txt/        dynamic robots.txt driven by site.indexable
    site.webmanifest/  dynamic manifest driven by site metadata
scripts/
  migrate-db.ts        standalone migration runner (local d1 via platform proxy)
static/                favicon and robots.txt
```

## Customizing for a new application

1. Update `name` and `version` in `package.json` and `wrangler.jsonc`.
2. Edit `src/lib/site.ts` to set the app metadata, web manifest settings, and
   whether it should be `indexable`.
3. Rename the `APP_` env prefix everywhere if a project-specific prefix is
   preferred (`svelte.config.js`, `vite.config.ts`, `.env.example`, and
   `$env/static/public` references in routes).
4. Replace `static/favicon.svg`.

## Deployment

Deployment targets Cloudflare Workers via Wrangler. Authenticate with
`npx wrangler login` once, then:

```sh
mise run deploy
```

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for
details.
