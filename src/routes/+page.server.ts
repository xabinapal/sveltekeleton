import { sql } from "kysely";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const row = await locals.db?.selectFrom("visits").select("count").where("id", "=", 1).executeTakeFirst();

	return {
		count: row?.count ?? 0,
	};
};

export const actions = {
	default: async ({ locals }) => {
		await locals.db
			?.updateTable("visits")
			.set({ count: sql`count + 1` })
			.where("id", "=", 1)
			.execute();
	},
} satisfies Actions;
