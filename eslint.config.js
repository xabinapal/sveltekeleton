import js from "@eslint/js";
import tseslint from "typescript-eslint";
import svelte from "eslint-plugin-svelte";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";
import { fileURLToPath } from "node:url";

export default tseslint.config(
	{
		ignores: [
			"build/",
			".svelte-kit/",
			"dist/",
			"node_modules/",
			".wrangler/",
			".env",
			".env.*",
			"!.env.example",
			"package-lock.json",
		],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	...svelte.configs["flat/recommended"],
	...svelte.configs["flat/prettier"],
	prettierConfig,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node },
		},
	},
	{
		files: ["**/*.d.ts"],
		rules: {
			"@typescript-eslint/no-empty-object-type": "off",
		},
	},
	{
		files: ["**/*.svelte"],
		languageOptions: {
			parserOptions: {
				project: "./tsconfig.json",
				tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)),
				extraFileExtensions: [".svelte"],
			},
		},
	},
);
