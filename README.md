# sveltekeleton

An opinionated SvelteKit boilerplate for shipping applications to Cloudflare
Workers. It distills the shared conventions from real, production-deployed
SvelteKit + Cloudflare apps into a fast, common starting point.

## Stack

- **SvelteKit 2** + **Svelte 5** (runes)
- **Vite 8** with the devtools-json plugin
- **Tailwind CSS v4** (CSS-first, via the `@tailwindcss/vite` plugin) with **daisyUI** components
- **Cloudflare Workers** deployment via `@sveltejs/adapter-cloudflare` + Wrangler
- **Cloudflare D1** database accessed through the **Kysely** ORM with code-based migrations
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

The dev server runs on `http://localhost:5173`.

## Tasks

All tasks are run through mise, which delegates to the underlying npm scripts
defined in `package.json`.

| Task               | Description                             |
| ------------------ | --------------------------------------- |
| `mise run init`    | Install mise tools and npm dependencies |
| `mise run dev`     | Start the Vite dev server               |
| `mise run build`   | Build for production                    |
| `mise run preview` | Preview the production build locally    |
| `mise run deploy`  | Build and deploy to Cloudflare Workers  |
| `mise run lint`    | Run Prettier checks and ESLint          |
| `mise run format`  | Format the codebase with Prettier       |
| `mise run check`   | Run `svelte-check` type checking        |
| `mise run migrate` | Run D1 migrations against the local DB  |

## Environment variables

Public configuration uses an `APP_`-prefixed env contract consumed through
`$env/static/public`. Copy the example file and adjust the values:

```sh
cp .env.example .env
```

| Variable               | Purpose              |
| ---------------------- | -------------------- |
| `APP_BASE_URL`         | Canonical base URL   |
| `APP_META_TITLE`       | Page and SEO title   |
| `APP_META_DESCRIPTION` | SEO description      |
| `APP_META_AUTHOR`      | Author metadata      |
| `APP_META_KEYWORDS`    | SEO keywords         |
| `APP_META_THEME_COLOR` | Theme color metadata |

## Database

The skeleton ships with Cloudflare D1 support through the Kysely ORM, including
a migrations framework. Migrations are written in TypeScript using Kysely's
schema builder — never raw SQL.

### Local development

In `vite dev`, the `adapter-cloudflare` platform proxy exposes the D1 binding
(`event.platform.env.DB`) backed by a local SQLite database stored under
`.wrangler/`. Migrations also run automatically on the first request after a
server start, so the schema is always ready.

To run migrations explicitly against the local database (without starting the
dev server):

```sh
mise run migrate
```

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
they also run on cold starts in production.

### Production

Before deploying, create a real D1 database and set its id in `wrangler.jsonc`:

```sh
npx wrangler d1 create sveltekeleton   # copy the printed database_id
```

Replace the `database_id` placeholder in `wrangler.jsonc`, then `mise run deploy`.
Migrations are applied automatically on the first request after each deploy.

## Project structure

```
mise.toml              tool pins and task definitions
svelte.config.js       adapter-cloudflare + APP_ env prefix
vite.config.ts         sveltekit plugin and dev server
wrangler.jsonc         cloudflare workers deployment config
tsconfig.json          strict typescript configuration
eslint.config.js       eslint flat config
src/
  app.html             html shell
  app.d.ts             app type declarations (Locals, Platform)
  app.css              tailwind import and theme tokens
  hooks.server.ts      creates the db client, runs migrations, exposes locals.db
  lib/server/database/ kysely orm layer
    schema.ts          table and database types
    db.ts              d1-backed kysely client factory
    d1-dialect.ts      d1-safe dialect and introspector
    migrator.ts        kysely migrator (transactions disabled for d1)
    migrations/        code-based migration files + index registry
  routes/
    +layout.svelte     layout with seo meta tags
    +page.server.ts    load + action reading and writing d1
    +page.svelte       landing page
    +error.svelte      error page
scripts/
  migrate.ts           standalone migration runner (local d1 via platform proxy)
static/                favicon, web manifest, robots.txt
```

## Customizing for a new application

1. Update `name` and `version` in `package.json` and `wrangler.jsonc`.
2. Rename the `APP_` env prefix everywhere if a project-specific prefix is
   preferred (`svelte.config.js`, `vite.config.ts`, `.env.example`, and
   `$env/static/public` references in routes).
3. Update the metadata values in `.env`.
4. Replace `static/favicon.svg` and the manifest details.

## Deployment

Deployment targets Cloudflare Workers via Wrangler. Authenticate with
`npx wrangler login` once, then:

```sh
mise run deploy
```

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for
details.
