import type { Handle } from "@sveltejs/kit";
import { building } from "$app/environment";
import { createDatabase, runMigrations, type Database } from "$lib/server/database";
import type { Kysely } from "kysely";

let db: Kysely<Database> | undefined;
let migrated = false;

export const handle: Handle = async ({ event, resolve }) => {
	if (!db && !building) {
		const database = event.platform?.env?.DB;
		if (database) {
			db = createDatabase(database);
		}
	}

	if (db && !migrated) {
		try {
			await runMigrations(db);
		} catch (error) {
			console.error("Database migration failed:", error);
		}
		migrated = true;
	}

	event.locals.db = db;

	return resolve(event);
};
