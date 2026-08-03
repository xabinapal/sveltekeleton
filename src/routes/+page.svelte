<script lang="ts">
	import { APP_META_DESCRIPTION, APP_META_TITLE } from "$env/static/public";

	let { data, form } = $props();
</script>

<section class="flex flex-col items-center justify-center gap-4 py-16 text-center">
	<h1 class="text-4xl font-bold text-secondary-600">{APP_META_TITLE}</h1>
	<p class="max-w-prose text-lg text-primary-600">{APP_META_DESCRIPTION}</p>

	<div class="mt-8 flex flex-wrap justify-center gap-3 font-mono text-sm">
		<span class="rounded-md border border-primary-300 bg-primary-50 px-3 py-2">SvelteKit</span>
		<span class="rounded-md border border-primary-300 bg-primary-50 px-3 py-2">Svelte 5</span>
		<span class="rounded-md border border-primary-300 bg-primary-50 px-3 py-2">Tailwind CSS</span>
		<span class="rounded-md border border-primary-300 bg-primary-50 px-3 py-2">Cloudflare D1</span>
		<span class="rounded-md border border-primary-300 bg-primary-50 px-3 py-2">mise</span>
	</div>

	<div class="mt-12 flex flex-col items-center gap-3 rounded-lg border border-primary-200 bg-primary-50 p-6">
		<p class="font-mono text-sm text-primary-600">D1 visits</p>
		<p class="text-5xl font-bold text-secondary-600">{data.count}</p>
		<form method="POST">
			<button
				class="rounded-md border border-secondary-600 bg-secondary-500 px-3 py-2 font-mono text-sm font-medium text-white"
			>
				Increment
			</button>
		</form>
		{#if form}
			<p class="font-mono text-xs text-primary-400">counter incremented</p>
		{/if}
	</div>
</section>
