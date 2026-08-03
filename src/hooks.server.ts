import type { Handle } from "@sveltejs/kit";
import { building } from "$app/environment";
import { createDatabase, runMigrations, type Database } from "$lib/server/database";
import { createDatabaseInitializer } from "$lib/server/database/initializer";
import { createKeyValueStore } from "$lib/server/kv";
import { logger, type LogLevel } from "$lib/server/logger";
import type { Kysely } from "kysely";

const initializeDatabase = createDatabaseInitializer({
	createClient: createDatabase,
	async migrate(db: Kysely<Database>) {
		try {
			const result = await runMigrations(db);
			const applied = result.results?.filter((migration) => migration.status === "Success").length ?? 0;
			if (applied > 0) logger.info("database migrated", { migrations: applied });
		} catch (error) {
			logger.error("database migration failed", {
				error: error instanceof Error ? error.message : String(error),
			});
			throw error;
		}
	},
	dispose: (db) => db.destroy(),
});

function statusLevel(status: number): LogLevel {
	if (status >= 500) return "error";
	if (status >= 400) return "warn";
	return "info";
}

export const handle: Handle = async ({ event, resolve }) => {
	const start = performance.now();
	let status = 500;

	try {
		if (!building) {
			event.locals.db = await initializeDatabase(event.platform?.env?.DB);
			const namespace = event.platform?.env?.KV;
			event.locals.kv = namespace ? createKeyValueStore(namespace, "app") : undefined;
		}

		const response = await resolve(event);
		status = response.status;
		return response;
	} catch (error) {
		if (typeof error === "object" && error !== null && "status" in error && typeof error.status === "number") {
			status = error.status;
		}
		throw error;
	} finally {
		logger.log(statusLevel(status), `${event.request.method} ${event.url.pathname}`, {
			method: event.request.method,
			path: event.url.pathname,
			status,
			duration_ms: Math.round(performance.now() - start),
		});
	}
};
