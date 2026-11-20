<script lang="ts">
	import { Step } from '@fundar/data-scrolly-telling';
	import { threshold } from '$lib/stores/threshold';
	import { isSmallDevice } from '$lib/stores/device';
	import type { Snippet } from 'svelte';

	type ShowData = boolean | 'force-refresh';

	let {
		showData = false,
		transition,
		children,
		...stepProps
	}: {
		showData?: ShowData;
		transition?: any;
		children: Snippet;
		[key: string]: any;
	} = $props();

	const hasData = $derived(showData === true || showData === 'force-refresh');
	const forceRefresh = $derived(showData === 'force-refresh');
</script>

{#if $isSmallDevice}
	<Step threshold={$threshold} {...stepProps}>
		{@render children()}
	</Step>
{:else}
	<Step
		threshold={$threshold}
		{showData}
		layout={{ type: 'columns', columns: 6, gap: '2.5rem' }}
		container={{ maxWidth: '94%' }}
		{transition}
		{...stepProps}
	>
		<Step.Column span={2}>
			<div class="flex min-h-[98vh] flex-col justify-center">
				<div class="prose-story border-l-4 border-primary bg-base-100 py-2 pl-4">
					{@render children()}
				</div>
			</div>
		</Step.Column>

		{#if hasData}
			<Step.Column data span={4} {...forceRefresh ? { 'data-refresh': true } : {}} />
		{/if}
	</Step>
{/if}
