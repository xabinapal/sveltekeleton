import { dev } from "$app/environment";

export type LogLevel = "debug" | "info" | "warn" | "error";
type Fields = Record<string, unknown>;

const LEVEL_VALUE: Record<LogLevel, number> = {
	debug: 10,
	info: 20,
	warn: 30,
	error: 40,
};

const minLevel: LogLevel = dev ? "debug" : "info";

function formatValue(value: unknown): string {
	let str: string;

	if (value === null || value === undefined) {
		return "";
	}
	if (typeof value === "number" || typeof value === "boolean") {
		str = String(value);
	} else if (typeof value === "string") {
		str = value;
	} else {
		str = JSON.stringify(value);
	}

	if (/[\s="]/.test(str)) {
		return `"${str.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
	}
	return str;
}

function emit(level: LogLevel, msg: string, fields: Fields): void {
	if (LEVEL_VALUE[level] < LEVEL_VALUE[minLevel]) {
		return;
	}

	const parts = [`msg=${formatValue(msg)}`, `level=${level}`, `ts=${new Date().toISOString()}`];
	for (const [key, value] of Object.entries(fields)) {
		const formatted = formatValue(value);
		if (formatted !== "") {
			parts.push(`${key}=${formatted}`);
		}
	}

	const line = parts.join(" ");
	if (level === "error") {
		console.error(line);
	} else if (level === "warn") {
		console.warn(line);
	} else if (level === "info") {
		console.info(line);
	} else {
		console.log(line);
	}
}

export const logger = {
	log(level: LogLevel, msg: string, fields: Fields = {}) {
		emit(level, msg, fields);
	},
	debug(msg: string, fields: Fields = {}) {
		emit("debug", msg, fields);
	},
	info(msg: string, fields: Fields = {}) {
		emit("info", msg, fields);
	},
	warn(msg: string, fields: Fields = {}) {
		emit("warn", msg, fields);
	},
	error(msg: string, fields: Fields = {}) {
		emit("error", msg, fields);
	},
};
