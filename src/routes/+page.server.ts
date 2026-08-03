import { fail } from "@sveltejs/kit";
import { sql } from "kysely";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { z } from "zod";
import type { KeyValueStore } from "$lib/server/kv";
import { logger } from "$lib/server/logger";
import type { Actions, PageServerLoad } from "./$types";

// Defined at module top level so the zod4 adapter can cache it.
const incrementSchema = z.object({
	amount: z.coerce.number().int().min(1).max(100).default(1),
});

const CACHE_KEY = "cache:v1:starter-capabilities";
const CACHE_TTL_SECONDS = 300;

interface CachedCapabilities {
	generatedAt: string;
}

async function loadCapabilitiesCache(kv: KeyValueStore | undefined) {
	if (!kv) return { status: "unavailable" as const, generatedAt: null };

	try {
		const cached = await kv.get<CachedCapabilities>(CACHE_KEY);
		if (cached) return { status: "hit" as const, generatedAt: cached.generatedAt };

		const value = { generatedAt: new Date().toISOString() };
		await kv.put(CACHE_KEY, value, { expirationTtl: CACHE_TTL_SECONDS });
		return { status: "miss" as const, generatedAt: value.generatedAt };
	} catch (error) {
		logger.warn("kv cache unavailable", {
			error: error instanceof Error ? error.message : String(error),
		});
		return { status: "error" as const, generatedAt: null };
	}
}

export const load: PageServerLoad = async ({ locals }) => {
	const [row, form, cache] = await Promise.all([
		locals.db?.selectFrom("visits").select("count").where("id", "=", 1).executeTakeFirst(),
		superValidate(zod4(incrementSchema)),
		loadCapabilitiesCache(locals.kv),
	]);
	const count = row?.count ?? 0;
	logger.debug("page data loaded", { count, cache: cache.status });
	return { count, form, cache };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(incrementSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		await locals.db
			?.updateTable("visits")
			.set({ count: sql`count + ${form.data.amount}` })
			.where("id", "=", 1)
			.execute();
		logger.debug("visit incremented", { amount: form.data.amount });

		return message(form, "Counter incremented");
	},
};
