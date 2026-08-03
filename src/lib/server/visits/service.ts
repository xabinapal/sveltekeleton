import type { VisitsRepository } from "./repository";

export class VisitCounterNotFoundError extends Error {
	constructor() {
		super("Visit counter row is missing");
		this.name = "VisitCounterNotFoundError";
	}
}

export async function getVisitCount(repository: VisitsRepository): Promise<number> {
	const count = await repository.getCount();
	if (count === undefined) throw new VisitCounterNotFoundError();
	return count;
}

export async function incrementVisitCount(repository: VisitsRepository, amount: number): Promise<void> {
	const updated = await repository.increment(amount);
	if (!updated) throw new VisitCounterNotFoundError();
}
