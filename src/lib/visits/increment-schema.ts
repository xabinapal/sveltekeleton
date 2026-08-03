import { z } from "zod";

export const incrementVisitsSchema = z.object({
	amount: z.coerce.number().int().min(1).max(100).default(1),
});
