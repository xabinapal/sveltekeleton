import { superValidate } from "sveltekit-superforms/server";
import { zod4 } from "sveltekit-superforms/adapters";
import { loadStarterCapabilitiesCache } from "$lib/server/cache/starter-capabilities";
import { logger } from "$lib/server/logger";
import { submitVisitIncrement } from "$lib/server/visits/action";
import { createVisitsRepository } from "$lib/server/visits/repository";
import { getVisitCount } from "$lib/server/visits/service";
import { incrementVisitsSchema } from "$lib/visits/increment-schema";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const repository = createVisitsRepository(locals.db);
	const cache = loadStarterCapabilitiesCache(locals.kv, {
		onError(error) {
			logger.warn("kv cache unavailable", {
				error: error instanceof Error ? error.message : String(error),
			});
		},
	});
	const [count, form] = await Promise.all([getVisitCount(repository), superValidate(zod4(incrementVisitsSchema))]);

	logger.debug("page data loaded", { count });
	return { count, form, cache };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const result = await submitVisitIncrement(request, createVisitsRepository(locals.db));
		if ("form" in result) {
			logger.debug("visit incremented", { amount: result.form.data.amount });
		}
		return result;
	},
};
