<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		color = null
	}: {
		children?: Snippet;
		color?: string | null;
	} = $props();
</script>

<strong class="font-sans font-bold">
	{#if color}<span
			class="mr-1 inline-block size-3 translate-y-px rounded-full align-baseline"
			style:background-color={color}
		></span>{/if}{@render children?.()}
</strong>
