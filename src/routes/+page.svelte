<script lang="ts">
	import { untrack } from "svelte";
	import { superForm } from "sveltekit-superforms";
	import DataTable from "$lib/components/data-table.svelte";
	import type { DataTableColumn, DataTableRow } from "$lib/components/data-table";
	import { site } from "$lib/site";
	import type { PageProps } from "./$types";

	const capabilities: DataTableRow[] = [
		{ id: "routing", capability: "Routing", library: "SvelteKit", layer: "Application" },
		{ id: "forms", capability: "Forms", library: "Superforms + Zod", layer: "Application" },
		{
			id: "tables",
			capability: "Data tables",
			library: "Svelte Headless Table",
			layer: "Application",
		},
		{ id: "database", capability: "Database", library: "Kysely + D1", layer: "Data" },
		{ id: "key-value", capability: "Key-value storage", library: "Cloudflare KV", layer: "Data" },
		{ id: "styles", capability: "Components", library: "daisyUI", layer: "Interface" },
		{ id: "css", capability: "Styling", library: "Tailwind CSS", layer: "Interface" },
		{ id: "runtime", capability: "Runtime", library: "Cloudflare Workers", layer: "Platform" },
		{ id: "testing", capability: "Unit testing", library: "Vitest", layer: "Quality" },
	];
	const capabilityColumns: DataTableColumn[] = [
		{ key: "capability", label: "Capability" },
		{ key: "library", label: "Library" },
		{ key: "layer", label: "Layer" },
	];

	let { data }: PageProps = $props();
	const { form, errors, enhance, message, submitting } = superForm(untrack(() => data.form));
</script>

<section class="flex flex-col items-center justify-center gap-6 py-16 text-center">
	<h1 class="text-4xl font-bold text-primary">{site.title}</h1>
	<p class="max-w-prose text-lg opacity-70">{site.description}</p>

	<div class="flex flex-wrap justify-center gap-2">
		<span class="badge badge-outline badge-primary">SvelteKit</span>
		<span class="badge badge-outline badge-primary">Svelte 5</span>
		<span class="badge badge-outline badge-primary">Tailwind CSS</span>
		<span class="badge badge-outline badge-primary">daisyUI</span>
		<span class="badge badge-outline badge-primary">Cloudflare D1</span>
		<span class="badge badge-outline badge-primary">Cloudflare KV</span>
	</div>

	<div class="stats stats-vertical bg-base-200 shadow-lg sm:stats-horizontal">
		<div class="stat">
			<div class="stat-title">D1 visits</div>
			<div class="stat-value text-primary">{data.count}</div>
			<div class="stat-desc">total page loads</div>
		</div>
		<div class="stat">
			<div class="stat-title">KV cache</div>
			<div class="stat-value text-primary uppercase">{data.cache.status}</div>
			<div class="stat-desc">
				{data.cache.generatedAt ? `cached ${data.cache.generatedAt}` : "binding unavailable"}
			</div>
		</div>
	</div>

	<form method="POST" use:enhance class="flex flex-col items-center gap-4">
		<fieldset class="fieldset">
			<legend class="fieldset-legend">Increment by</legend>
			<input
				type="number"
				name="amount"
				min="1"
				max="100"
				class="input w-24 text-center"
				class:input-error={$errors.amount}
				bind:value={$form.amount}
				aria-invalid={$errors.amount ? "true" : undefined}
				aria-describedby={$errors.amount ? "amount-errors" : undefined}
			/>
			{#if $errors.amount}
				<p id="amount-errors" class="label text-error">{$errors.amount.join(", ")}</p>
			{/if}
		</fieldset>

		<button class="btn btn-primary" disabled={$submitting}>
			{$submitting ? "Incrementing…" : "Increment"}
		</button>
	</form>

	{#if $message}
		<div class="alert alert-success max-w-sm" role="status">{$message}</div>
	{/if}

	<div class="divider"></div>

	<div class="flex w-full flex-col gap-4 text-left">
		<div>
			<h2 class="text-2xl font-bold">Starter capabilities</h2>
			<p class="opacity-70">Filter, sort, and paginate the included application stack.</p>
		</div>
		<DataTable columns={capabilityColumns} rows={capabilities} searchLabel="Filter capabilities" />
	</div>
</section>
