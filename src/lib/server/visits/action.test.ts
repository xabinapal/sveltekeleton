import { describe, expect, it, vi } from "vitest";
import { submitVisitIncrement } from "./action";
import type { VisitsRepository } from "./repository";

function createRepository(): VisitsRepository {
	return {
		getCount: vi.fn(),
		increment: vi.fn().mockResolvedValue(true),
	};
}

function createRequest(amount?: string) {
	const body = new URLSearchParams();
	if (amount !== undefined) body.set("amount", amount);
	return new Request("http://localhost/", { method: "POST", body });
}

describe("submitVisitIncrement", () => {
	it("returns validation failure without writing", async () => {
		const repository = createRepository();
		const result = await submitVisitIncrement(createRequest("0"), repository);

		expect(result).toMatchObject({ status: 400 });
		expect(repository.increment).not.toHaveBeenCalled();
	});

	it("increments by the validated amount", async () => {
		const repository = createRepository();
		const result = await submitVisitIncrement(createRequest("3"), repository);

		expect(repository.increment).toHaveBeenCalledWith(3);
		expect(result).toMatchObject({ form: { message: "Counter incremented" } });
	});

	it("uses the schema default when amount is omitted", async () => {
		const repository = createRepository();

		await submitVisitIncrement(createRequest(), repository);

		expect(repository.increment).toHaveBeenCalledWith(1);
	});
});
