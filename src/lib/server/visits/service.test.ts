import { describe, expect, it, vi } from "vitest";
import { getVisitCount, incrementVisitCount, VisitCounterNotFoundError } from "./service";
import type { VisitsRepository } from "./repository";

function createRepository(): VisitsRepository {
	return {
		getCount: vi.fn(),
		increment: vi.fn(),
	};
}

describe("visit counter service", () => {
	it("returns the persisted count", async () => {
		const repository = createRepository();
		vi.mocked(repository.getCount).mockResolvedValue(7);

		await expect(getVisitCount(repository)).resolves.toBe(7);
	});

	it("rejects a missing counter row", async () => {
		const repository = createRepository();
		vi.mocked(repository.getCount).mockResolvedValue(undefined);

		await expect(getVisitCount(repository)).rejects.toBeInstanceOf(VisitCounterNotFoundError);
	});

	it("requires exactly one counter row to be updated", async () => {
		const repository = createRepository();
		vi.mocked(repository.increment).mockResolvedValue(false);

		await expect(incrementVisitCount(repository, 3)).rejects.toBeInstanceOf(VisitCounterNotFoundError);
	});
});
