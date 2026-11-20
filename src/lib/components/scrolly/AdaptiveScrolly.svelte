<script lang="ts">
	import { isSmallDevice } from '$lib/stores/device';
	import MobileScrolly from './MobileScrolly.svelte';
	import DesktopScrolly from './DesktopScrolly.svelte';
	import type { TimelineEntry } from '@fundar/data-scrolly-telling';
	import type { Component, Snippet } from 'svelte';

	let {
		telling,
		content,
		props = {},
		timeline = []
	}: {
		telling: Snippet;
		content: Component<any>;
		props?: Record<string, unknown>;
		timeline?: TimelineEntry[];
	} = $props();
</script>

{#if $isSmallDevice}
	<MobileScrolly {telling} {content} {props} {timeline} />
{:else}
	<DesktopScrolly {telling} {content} {props} {timeline} />
{/if}
