<script lang="ts">
	import { page } from "$app/state";
</script>

<section class="flex flex-col items-center justify-center gap-2 py-16 text-center">
	<h1 class="text-4xl font-bold text-secondary-600">{page.status}</h1>
	<p class="text-lg text-primary-600">{page.error?.message ?? "Unknown error"}</p>

	<a href="/" class="mt-6 rounded-md border border-secondary-600 bg-secondary-500 px-3 py-2 font-mono text-sm font-medium text-white">
		Go Home
	</a>
</section>
