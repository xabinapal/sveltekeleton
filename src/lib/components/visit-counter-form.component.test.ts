import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import type { SuperValidated } from "sveltekit-superforms";
import VisitCounterForm from "./visit-counter-form.svelte";

const form = {
	id: "increment-visits",
	valid: true,
	posted: false,
	errors: {},
	data: { amount: 1 },
	constraints: { amount: { required: true, min: 1, max: 100 } },
} satisfies SuperValidated<{ amount: number }>;

describe("VisitCounterForm", () => {
	it("gives the amount input an accessible name", () => {
		render(VisitCounterForm, { data: form });

		const input = screen.getByRole<HTMLInputElement>("spinbutton", { name: "Increment by" });
		expect(input.value).toBe("1");
	});
});
