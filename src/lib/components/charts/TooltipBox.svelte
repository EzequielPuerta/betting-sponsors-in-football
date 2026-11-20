<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		footer,
		children
	}: {
		title: string;
		footer?: string;
		children: Snippet;
	} = $props();
</script>

<div class="w-64 border border-base-300 bg-base-100 font-sans text-base-content shadow-lg">
	<div
		class="border-b border-base-300 px-3 py-1.5 text-[11px] font-bold tracking-wide text-primary uppercase"
	>
		{title}
	</div>
	{@render children()}
	{#if footer}
		<div class="border-t border-base-300 bg-base-200 px-3 py-1.5 text-xs font-semibold italic">
			{footer}
		</div>
	{/if}
</div>
