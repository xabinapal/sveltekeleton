import type { Kysely } from "kysely";
import type { Database } from "../../src/lib/server/database/schema";

const APPLICATION_TABLES_IN_DELETE_ORDER = ["visits"] as const satisfies readonly (keyof Database)[];
const MIN_VISIT_COUNT = 25;
const MAX_VISIT_COUNT = 250;

export interface PreseedResult {
	visits: number;
	visitCount: number;
}

export async function preseedDatabase(
	db: Kysely<Database>,
	random: () => number = Math.random,
): Promise<PreseedResult> {
	for (const table of APPLICATION_TABLES_IN_DELETE_ORDER) {
		await db.deleteFrom(table).execute();
	}

	const visitCount = Math.floor(random() * (MAX_VISIT_COUNT - MIN_VISIT_COUNT + 1)) + MIN_VISIT_COUNT;

	await db.insertInto("visits").values({ id: 1, count: visitCount }).execute();

	return { visits: 1, visitCount };
}
