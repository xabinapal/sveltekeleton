<script lang="ts">
	import { APP_META_DESCRIPTION, APP_META_TITLE } from "$env/static/public";

	let { data, form } = $props();
</script>

<section class="flex flex-col items-center justify-center gap-6 py-16 text-center">
	<h1 class="text-4xl font-bold text-primary">{APP_META_TITLE}</h1>
	<p class="max-w-prose text-lg opacity-70">{APP_META_DESCRIPTION}</p>

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
			<div class="stat-desc">{form ? "counter incremented" : "total page loads"}</div>
		</div>
	</div>

	<form method="POST">
		<button class="btn btn-primary">Increment</button>
	</form>
</section>
