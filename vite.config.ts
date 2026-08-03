import { defineConfig } from "vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { default as devtoolsJson } from "vite-plugin-devtools-json";

export default defineConfig(() => ({
	server: { host: true, port: 5173 },
	preview: { host: true, port: 4173 },
	plugins: [sveltekit(), devtoolsJson()],

	envPrefix: "APP_",
}));
