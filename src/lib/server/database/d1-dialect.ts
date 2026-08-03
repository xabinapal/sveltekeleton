import type { DatabaseIntrospector, Kysely } from "kysely";
import { D1Dialect as KyselyD1Dialect } from "kysely-d1";

class D1Introspector implements DatabaseIntrospector {
	readonly #db: Kysely<any>;

	constructor(db: Kysely<any>) {
		this.#db = db;
	}

	async getSchemas() {
		return [];
	}

	async getTables() {
		const rows = await this.#db
			.selectFrom("sqlite_master")
			.where("type", "in", ["table", "view"])
			.where("name", "not like", "sqlite_%")
			.select("name")
			.execute();

		return rows.map(({ name }) => ({
			name,
			isView: false,
			isForeign: false,
			columns: [],
		}));
	}
}

export class D1Dialect extends KyselyD1Dialect {
	override createIntrospector(db: Kysely<any>): DatabaseIntrospector {
		return new D1Introspector(db);
	}
}
