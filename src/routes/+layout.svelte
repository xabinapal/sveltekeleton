<script lang="ts">
	import "../app.css";

	import {
		APP_BASE_URL,
		APP_META_AUTHOR,
		APP_META_DESCRIPTION,
		APP_META_KEYWORDS,
		APP_META_THEME_COLOR,
		APP_META_TITLE,
	} from "$env/static/public";

	let { children } = $props();
</script>

<svelte:head>
	<title>{APP_META_TITLE}</title>

	<meta charset="utf-8" />
	<meta name="robots" content="index,follow" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />

	<meta name="title" content={APP_META_TITLE} />
	<meta name="description" content={APP_META_DESCRIPTION} />
	<meta name="author" content={APP_META_AUTHOR} />
	<meta name="keywords" content={APP_META_KEYWORDS} />
	<meta name="theme-color" content={APP_META_THEME_COLOR} />

	<link rel="canonical" href={APP_BASE_URL} />
	<link rel="icon" type="image/svg+xml" href="{APP_BASE_URL}/favicon.svg" />
	<link rel="manifest" href="{APP_BASE_URL}/site.webmanifest" />
</svelte:head>

<main class="mx-auto max-w-screen-lg p-4">
	{@render children()}
</main>
