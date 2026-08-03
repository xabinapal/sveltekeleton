<script lang="ts">
	import "../app.css";

	import * as env from "$env/static/public";

	let { children } = $props();
</script>

<svelte:head>
	<title>{env.APP_META_TITLE}</title>

	<meta charset="utf-8" />
	<meta name="robots" content="index,follow" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />

	<meta name="title" content={env.APP_META_TITLE} />
	<meta name="description" content={env.APP_META_DESCRIPTION} />
	<meta name="author" content={env.APP_META_AUTHOR} />
	<meta name="keywords" content={env.APP_META_KEYWORDS} />
	<meta name="theme-color" content={env.APP_META_THEME_COLOR} />

	<link rel="canonical" href={env.APP_BASE_URL} />
	<link rel="icon" type="image/svg+xml" href="{env.APP_BASE_URL}/favicon.svg" />
	<link rel="manifest" href="{env.APP_BASE_URL}/site.webmanifest" />
</svelte:head>

<main class="mx-auto max-w-screen-lg p-4">
	{@render children()}
</main>
