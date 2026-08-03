import type { D1Database, KVNamespace } from "@cloudflare/workers-types";
import type { Kysely } from "kysely";
import type { Database } from "$lib/server/database/schema";
import type { KeyValueStore } from "$lib/server/kv";

declare global {
	namespace App {
		interface Locals {
			db: Kysely<Database> | undefined;
			kv: KeyValueStore | undefined;
		}
		interface Platform {
			env: {
				DB: D1Database;
				KV: KVNamespace;
			};
			context: {
				waitUntil(promise: Promise<unknown>): void;
			};
			caches: CacheStorage;
		}
	}
}

export {};
