import type { Handle } from "@sveltejs/kit";
import { building } from "$app/environment";
import { createDatabase, runMigrations, type Database } from "$lib/server/database";
import { logger, type LogLevel } from "$lib/server/logger";
import type { Kysely } from "kysely";

let db: Kysely<Database> | undefined;
let migrated = false;

function statusLevel(status: number): LogLevel {
	if (status >= 500) return "error";
	if (status >= 400) return "warn";
	return "info";
}

export const handle: Handle = async ({ event, resolve }) => {
	if (!db && !building) {
		const database = event.platform?.env?.DB;
		if (database) {
			db = createDatabase(database);
		}
	}

	if (db && !migrated) {
		try {
			const result = await runMigrations(db);
			const applied = result.results?.filter((r) => r.status === "Success").length ?? 0;
			if (applied > 0) {
				logger.info("database migrated", { migrations: applied });
			}
		} catch (error) {
			logger.error("database migration failed", {
				error: error instanceof Error ? error.message : String(error),
			});
		}
		migrated = true;
	}

	event.locals.db = db;

	const start = performance.now();
	const response = await resolve(event);
	const durationMs = Math.round(performance.now() - start);

	logger.log(statusLevel(response.status), `${event.request.method} ${event.url.pathname}`, {
		method: event.request.method,
		path: event.url.pathname,
		status: response.status,
		duration_ms: durationMs,
	});

	return response;
};
