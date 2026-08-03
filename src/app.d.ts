import type { D1Database } from "@cloudflare/workers-types";
import type { Kysely } from "kysely";
import type { Database } from "$lib/server/database/schema";

declare global {
	namespace App {
		interface Locals {
			db: Kysely<Database> | undefined;
		}
		interface Platform {
			env: {
				DB: D1Database;
			};
			context: {
				waitUntil(promise: Promise<unknown>): void;
			};
			caches: CacheStorage;
		}
	}
}

export {};
