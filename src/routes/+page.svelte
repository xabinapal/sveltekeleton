<script lang="ts">
	import { untrack } from "svelte";
	import { superForm } from "sveltekit-superforms";
	import { site } from "$lib/site";
	import type { PageProps } from "./$types";

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
	</div>

	<div class="stats bg-base-200 shadow-lg">
		<div class="stat">
			<div class="stat-title">D1 visits</div>
			<div class="stat-value text-primary">{data.count}</div>
			<div class="stat-desc">total page loads</div>
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
</section>
