<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="prose-story mx-auto flex max-w-2xl flex-col gap-5 px-4 py-10">
	{@render children()}
</div>
