import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { D1Database } from "@cloudflare/workers-types";
import type { Kysely } from "kysely";
import { getPlatformProxy, type PlatformProxy } from "wrangler";
import { createDatabase } from "../../src/lib/server/database/db";
import { initial } from "../../src/lib/server/database/migrations/0001_initial";
import { runMigrations } from "../../src/lib/server/database/migrator";
import type { Database } from "../../src/lib/server/database/schema";
import { createVisitsRepository } from "../../src/lib/server/visits/repository";

describe.sequential("D1 integration", () => {
	let proxy: PlatformProxy<{ DB: D1Database }>;
	let db: Kysely<Database>;

	beforeAll(async () => {
		proxy = await getPlatformProxy({
			configPath: "wrangler.jsonc",
			persist: false,
			remoteBindings: false,
		});
		db = createDatabase(proxy.env.DB);
		await runMigrations(db);
	});

	beforeEach(async () => {
		await db
			.insertInto("visits")
			.values({ id: 1, count: 0 })
			.onConflict((conflict) => conflict.column("id").doUpdateSet({ count: 0 }))
			.execute();
	});

	afterAll(async () => {
		await db?.destroy();
		await proxy?.dispose();
	});

	it("applies migrations and seeds the counter", async () => {
		await expect(createVisitsRepository(db).getCount()).resolves.toBe(0);
	});

	it("executes the Kysely visits repository", async () => {
		const repository = createVisitsRepository(db);

		await expect(repository.increment(3)).resolves.toBe(true);
		await expect(repository.getCount()).resolves.toBe(3);
	});

	it("keeps the initial migration replay-safe", async () => {
		await initial.up(db);
		await initial.up(db);

		const rows = await db.selectFrom("visits").select("id").where("id", "=", 1).execute();
		expect(rows).toHaveLength(1);
	});

	it("discovers tables and views for migrations", async () => {
		await db.schema.createView("visits_view").as(db.selectFrom("visits").selectAll()).execute();

		try {
			const tables = await db.introspection.getTables({ withInternalKyselyTables: true });
			expect(tables.find(({ name }) => name === "visits")).toMatchObject({ isView: false });
			expect(tables.find(({ name }) => name === "visits_view")).toMatchObject({ isView: true });
		} finally {
			await db.schema.dropView("visits_view").ifExists().execute();
		}
	});

	it("rejects unsupported general schema introspection", async () => {
		await expect(db.introspection.getTables()).rejects.toThrow("Full D1 schema introspection is unavailable");
	});
});
