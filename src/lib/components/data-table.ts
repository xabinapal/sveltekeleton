export type DataTableValue = string | number;

export interface DataTableRow {
	id: string;
	[key: string]: DataTableValue;
}

export interface DataTableColumn {
	key: string;
	label: string;
	align?: "start" | "end";
}
