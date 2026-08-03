import { fail } from "@sveltejs/kit";
import { sql } from "kysely";
import { message, superValidate } from "sveltekit-superforms";
import { zod4 } from "sveltekit-superforms/adapters";
import { z } from "zod";
import { logger } from "$lib/server/logger";
import type { Actions, PageServerLoad } from "./$types";

// Defined at module top level so the zod4 adapter can cache it.
const incrementSchema = z.object({
	amount: z.coerce.number().int().min(1).max(100).default(1),
});

export const load: PageServerLoad = async ({ locals }) => {
	const row = await locals.db?.selectFrom("visits").select("count").where("id", "=", 1).executeTakeFirst();
	const count = row?.count ?? 0;
	const form = await superValidate(zod4(incrementSchema));
	logger.debug("visits loaded", { count });
	return { count, form };
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
