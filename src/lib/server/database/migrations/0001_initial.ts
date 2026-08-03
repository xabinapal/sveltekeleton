import type { Kysely } from "kysely";
import type { Migration } from "kysely/migration";

export const initial: Migration = {
	async up(db: Kysely<any>): Promise<void> {
		await db.schema
			.createTable("visits")
			.ifNotExists()
			.addColumn("id", "integer", (col) => col.primaryKey())
			.addColumn("count", "integer", (col) => col.notNull().defaultTo(0))
			.execute();

		await db
			.insertInto("visits")
			.values({ id: 1, count: 0 })
			.onConflict((conflict) => conflict.column("id").doNothing())
			.execute();
	},
	async down(db: Kysely<any>): Promise<void> {
		await db.schema.dropTable("visits").ifExists().execute();
	},
};
