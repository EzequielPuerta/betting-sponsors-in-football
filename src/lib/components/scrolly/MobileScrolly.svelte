<script lang="ts">
	import { Layer, Responsive, Scrolly, Overlay } from '@fundar/data-scrolly-telling';
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
	<Layer fill cssClasses="p-2 bg-base-100">
		<Responsive {content} {props} />
	</Layer>
{/snippet}

<Scrolly
	{data}
	{telling}
	{timeline}
	layout={Overlay as any}
	layoutProps={{
		offsetTop: '0px',
		offsetBottom: '0px'
	}}
	cssClass="overlay-steps"
/>

<style>
	/* El contenedor de los pasos tapa todo el grafico: deja pasar los toques y solo las tarjetas los reciben */
	:global(.overlay-steps .telling) {
		pointer-events: none;
	}
	:global(.overlay-steps [data-telling-step]) {
		pointer-events: auto;
	}

	:global(.overlay-steps) {
		--step-padding: 1rem;
		--step-background-color: var(--color-base-100);
		--step-color: var(--color-base-content);
		--step-border-radius: 0px;
		--step-max-width: 300px;
		--step-margin-y: 50vh;
		--step-margin-x: 16px;
		--step-font-size: 17px;
		--step-line-height: 1.45;
		--step-text-align: left;
		--step-box-shadow: 0 0 0 1px var(--color-base-300);
	}
</style>
