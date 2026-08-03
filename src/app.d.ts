declare global {
	namespace App {
		interface Locals {}
		interface Platform {}
	}
}

declare module "@sveltejs/kit" {
	interface RequestEvent<Params = Partial<Record<string, string>>, RouteId extends string | null = string | null> {
		platform: App.Platform;
	}
}

export {};
