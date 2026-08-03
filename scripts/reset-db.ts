import { NO_MIGRATIONS } from "kysely/migration";
import { getPlatformProxy } from "wrangler";
import { createDatabase, createMigrator } from "../src/lib/server/database/index.ts";

const proxy = await getPlatformProxy({ configPath: "wrangler.jsonc" });

try {
	const db = createDatabase(proxy.env.DB);
	const migrator = createMigrator(db);

	const rolledBack = await migrator.migrateTo(NO_MIGRATIONS);
	if (rolledBack.error) {
		throw rolledBack.error;
	}

	const reApplied = await migrator.migrateToLatest();
	if (reApplied.error) {
		throw reApplied.error;
	}

	const applied = reApplied.results?.filter((r) => r.status === "Success") ?? [];

	if (applied.length === 0) {
		console.log("Database reset. No migrations to re-apply.");
	} else {
		console.log("Database reset from scratch:");
		for (const migration of applied) {
			console.log(`  Re-applied: ${migration.migrationName}`);
		}
	}

	await db.destroy();
} finally {
	await proxy.dispose();
}
