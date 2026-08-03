import { getPlatformProxy } from "wrangler";
import { createDatabase, runMigrations } from "../src/lib/server/database/index.ts";

const proxy = await getPlatformProxy({ configPath: "wrangler.jsonc" });

try {
	const db = createDatabase(proxy.env.DB);
	const result = await runMigrations(db);

	const applied = result.results?.filter((r) => r.status === "Success") ?? [];

	if (applied.length === 0) {
		console.log("No pending migrations. Database is up to date.");
	} else {
		for (const migration of applied) {
			console.log(`Applied migration: ${migration.migrationName}`);
		}
	}

	await db.destroy();
} finally {
	await proxy.dispose();
}
