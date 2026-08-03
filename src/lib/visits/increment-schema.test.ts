import { describe, expect, it } from "vitest";
import { incrementVisitsSchema } from "./increment-schema";

describe("incrementVisitsSchema", () => {
	it.each([1, 50, 100])("accepts integer amount %s", (amount) => {
		expect(incrementVisitsSchema.parse({ amount })).toEqual({ amount });
	});

	it("coerces form values and defaults to one", () => {
		expect(incrementVisitsSchema.parse({ amount: "2" })).toEqual({ amount: 2 });
		expect(incrementVisitsSchema.parse({})).toEqual({ amount: 1 });
	});

	it.each([0, 101, 1.5])("rejects invalid amount %s", (amount) => {
		expect(incrementVisitsSchema.safeParse({ amount }).success).toBe(false);
	});
});
