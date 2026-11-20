<script lang="ts">
	import { Layer, Responsive, Scrolly, Slide } from '@fundar/data-scrolly-telling';
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

{#snippet data()}
	<Layer fill position="relative">
		<Responsive {content} {props} />
	</Layer>
{/snippet}

<Scrolly
	{data}
	{telling}
	{timeline}
	layout={Slide as any}
	layoutProps={{
		offsetTop: '0px',
		offsetBottom: '0px',
		dvhHeightPerStep: 80,
		transition: { enter: null, exit: null }
	}}
	cssClass="slide-steps"
/>

<style>
	:global(.slide-steps) {
		--step-padding: 0.5%;
		--step-background-color: var(--color-base-100);
		--step-color: var(--color-base-content);
		--step-font-size: 20px;
		--step-font-weight: 400;
		--step-line-height: 1.5;
	}
</style>
