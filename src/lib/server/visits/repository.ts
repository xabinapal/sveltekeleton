import type { Kysely } from "kysely";
import type { Database } from "../database";

export interface VisitsRepository {
	getCount(): Promise<number | undefined>;
	increment(amount: number): Promise<boolean>;
}

export function createVisitsRepository(db: Kysely<Database>): VisitsRepository {
	return {
		async getCount() {
			const row = await db.selectFrom("visits").select("count").where("id", "=", 1).executeTakeFirst();
			return row?.count;
		},
		async increment(amount) {
			const result = await db
				.updateTable("visits")
				.set((expression) => ({ count: expression("count", "+", amount) }))
				.where("id", "=", 1)
				.executeTakeFirst();
			return result.numUpdatedRows === 1n;
		},
	};
}
