<script lang="ts">
	let {
		kicker,
		title,
		deck,
		byline
	}: {
		kicker: string;
		title: string;
		deck: string;
		byline?: string;
	} = $props();
</script>

<header class="mx-auto flex max-w-3xl flex-col gap-4 px-4 pt-16 pb-12 md:pt-24">
	<span class="kicker">{kicker}</span>
	<h1 class="text-5xl leading-[1.02] md:text-7xl">{title}</h1>
	<p class="prose-story max-w-2xl text-base-content/80 md:text-2xl">{deck}</p>
	{#if byline}
		<p class="border-t border-base-300 pt-3 font-sans text-sm text-base-content/60">{byline}</p>
	{/if}
</header>
