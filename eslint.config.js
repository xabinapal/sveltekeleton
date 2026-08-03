import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import svelte from "eslint-plugin-svelte";
import prettier from "eslint-config-prettier";
import globals from "globals";
import { fileURLToPath } from "node:url";

export default [
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
	...svelte.configs["flat/recommended"],
	...svelte.configs.prettier,
	prettier,
	...svelte.configs["flat/prettier"],
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node },
		},
	},
	{
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: "./tsconfig.json",
				tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)),
			},
		},
		plugins: { "@typescript-eslint": ts },
		rules: {
			...ts.configs.recommended.rules,
			"no-undef": "off",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
			"@typescript-eslint/no-explicit-any": "warn",
		},
	},
	{
		files: ["**/*.d.ts"],
		rules: {
			"@typescript-eslint/no-empty-object-type": "off",
			"@typescript-eslint/no-unused-vars": "off",
		},
	},
	{
		files: ["**/*.svelte"],
		languageOptions: {
			parser: svelte.parser,
			parserOptions: {
				parser: tsParser,
				project: "./tsconfig.json",
				tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)),
				extraFileExtensions: [".svelte"],
			},
		},
		rules: {
			"no-undef": "off",
		},
	},
];
