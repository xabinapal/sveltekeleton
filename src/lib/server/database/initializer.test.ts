import { describe, expect, it, vi } from "vitest";
import { createDatabaseInitializer } from "./initializer";

function deferred() {
	let resolve!: () => void;
	let reject!: (error: unknown) => void;
	const promise = new Promise<void>((resolvePromise, rejectPromise) => {
		resolve = resolvePromise;
		reject = rejectPromise;
	});
	return { promise, resolve, reject };
}

describe("createDatabaseInitializer", () => {
	it("rejects a missing database binding", async () => {
		const createClient = vi.fn();
		const initialize = createDatabaseInitializer({
			createClient,
			migrate: vi.fn(),
			dispose: vi.fn(),
		});

		await expect(initialize(undefined)).rejects.toThrow("D1 binding DB is unavailable");
		expect(createClient).not.toHaveBeenCalled();
	});

	it("creates and migrates one client for repeated requests", async () => {
		const client = { id: "db-1" };
		const createClient = vi.fn(() => client);
		const migrate = vi.fn();
		const initialize = createDatabaseInitializer({ createClient, migrate, dispose: vi.fn() });

		await expect(initialize("binding")).resolves.toBe(client);
		await expect(initialize("binding")).resolves.toBe(client);

		expect(createClient).toHaveBeenCalledOnce();
		expect(migrate).toHaveBeenCalledOnce();
	});

	it("shares one migration across concurrent requests", async () => {
		const migration = deferred();
		const client = { id: "db-1" };
		const createClient = vi.fn(() => client);
		const migrate = vi.fn(() => migration.promise);
		const initialize = createDatabaseInitializer({ createClient, migrate, dispose: vi.fn() });

		const first = initialize("binding");
		const second = initialize("binding");
		expect(createClient).toHaveBeenCalledOnce();
		expect(migrate).toHaveBeenCalledOnce();

		migration.resolve();
		await expect(Promise.all([first, second])).resolves.toEqual([client, client]);
	});

	it("disposes a failed client and retries initialization", async () => {
		const firstClient = { id: "db-1" };
		const secondClient = { id: "db-2" };
		const createClient = vi.fn().mockReturnValueOnce(firstClient).mockReturnValueOnce(secondClient);
		const migrate = vi.fn().mockRejectedValueOnce(new Error("migration failed")).mockResolvedValueOnce(undefined);
		const dispose = vi.fn();
		const initialize = createDatabaseInitializer({ createClient, migrate, dispose });

		await expect(initialize("binding")).rejects.toThrow("migration failed");
		expect(dispose).toHaveBeenCalledWith(firstClient);
		await expect(initialize("binding")).resolves.toBe(secondClient);

		expect(createClient).toHaveBeenCalledTimes(2);
		expect(migrate).toHaveBeenCalledTimes(2);
	});
});
