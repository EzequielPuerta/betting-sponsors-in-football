<script lang="ts">
	import { dataStore } from '$lib/stores/dataStore';
	import { pickedIds } from '$lib/stores/picks';
	import { toPoints } from '$lib/utils/jitter';
	import { averageByRound, impactByRound, meanImpact } from '$lib/utils/impact';
	import ImpactViews, { type ImpactView } from './ImpactViews.svelte';

	let {
		width,
		height,
		view
	}: {
		width: number;
		height: number;
		view: ImpactView;
	} = $props();

	const matches = $derived($dataStore.matches ?? []);
	const points = $derived(toPoints(matches, new Set($pickedIds)));
	const barRows = $derived(impactByRound(matches));
	const lineRows = $derived(averageByRound(matches));
	const seasonAverage = $derived(meanImpact(matches));
</script>

<ImpactViews
	{width}
	{height}
	{view}
	{points}
	{barRows}
	{lineRows}
	teams={$dataStore.teams ?? []}
	sponsors={$dataStore.sponsors ?? []}
	groups={$dataStore.industries?.groups ?? []}
	{seasonAverage}
/>
