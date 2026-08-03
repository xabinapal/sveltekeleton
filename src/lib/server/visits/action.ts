import { fail } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms/server";
import { zod4 } from "sveltekit-superforms/adapters";
import { incrementVisitsSchema } from "../../visits/increment-schema";
import type { VisitsRepository } from "./repository";
import { incrementVisitCount } from "./service";

export async function submitVisitIncrement(request: Request, repository: VisitsRepository) {
	const form = await superValidate(request, zod4(incrementVisitsSchema));
	if (!form.valid) return fail(400, { form });

	await incrementVisitCount(repository, form.data.amount);
	return message(form, "Counter incremented");
}
