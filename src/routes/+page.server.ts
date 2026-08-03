import { sql } from "kysely";
import { logger } from "$lib/server/logger";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const row = await locals.db?.selectFrom("visits").select("count").where("id", "=", 1).executeTakeFirst();
	const count = row?.count ?? 0;

	logger.debug("visits loaded", { count });

	return { count };
};

export const actions = {
	default: async ({ locals }) => {
		await locals.db
			?.updateTable("visits")
			.set({ count: sql`count + 1` })
			.where("id", "=", 1)
			.execute();
		logger.debug("visit incremented");
	},
} satisfies Actions;
