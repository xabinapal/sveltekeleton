import type { ColumnType } from "kysely";

export interface VisitsTable {
	id: ColumnType<number, number, never>;
	count: ColumnType<number, number, number>;
}

export interface Database {
	visits: VisitsTable;
}
