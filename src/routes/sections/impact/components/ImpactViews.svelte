<script lang="ts" module>
	export type ImpactView =
		'scatter-plain' | 'scatter-impact' | 'bars' | 'line' | 'clubs' | 'industries';
</script>

<script lang="ts">
	import { fade } from 'svelte/transition';
	import MatchScatter from '$sections/pick/components/Main.svelte';
	import type { IndustryGroup } from '$lib/types/industry';
	import type {
		MatchPoint,
		RoundAverageRow,
		RoundImpactRow,
		SponsorRow,
		Team
	} from '$lib/types/match';
	import BetClubs from './charts/BetClubs.svelte';
	import ImpactBars from './charts/ImpactBars.svelte';
	import ImpactLine from './charts/ImpactLine.svelte';
	import IndustryWheel from './charts/IndustryWheel.svelte';

	let {
		width,
		height,
		view,
		points,
		barRows,
		lineRows,
		teams,
		sponsors,
		groups,
		seasonAverage
	}: {
		width: number;
		height: number;
		view: ImpactView;
		points: MatchPoint[];
		barRows: RoundImpactRow[];
		lineRows: RoundAverageRow[];
		teams: Team[];
		sponsors: SponsorRow[];
		groups: IndustryGroup[];
		seasonAverage: number;
	} = $props();

	const scatter = $derived(view === 'scatter-plain' || view === 'scatter-impact');
</script>

<!-- Cada vista se dibuja en su propia capa y se funden entre si: son graficos distintos de la misma historia. -->
<div class="relative" style:width="{width}px" style:height="{height}px">
	{#if scatter}
		<div class="absolute inset-0" transition:fade={{ duration: 450 }}>
			<MatchScatter
				{width}
				{height}
				{points}
				colorBy={view === 'scatter-impact' ? 'impact' : 'pick'}
				highlightPicked={view === 'scatter-impact'}
			/>
		</div>
	{:else if view === 'bars'}
		<div class="absolute inset-0" transition:fade={{ duration: 450 }}>
			<ImpactBars {width} {height} rows={barRows} />
		</div>
	{:else if view === 'clubs'}
		<div class="absolute inset-0" transition:fade={{ duration: 450 }}>
			<BetClubs {width} {height} {teams} {sponsors} />
		</div>
	{:else if view === 'industries'}
		<div class="absolute inset-0" transition:fade={{ duration: 450 }}>
			<IndustryWheel {width} {height} {groups} />
		</div>
	{:else}
		<div class="absolute inset-0" transition:fade={{ duration: 450 }}>
			<ImpactLine {width} {height} rows={lineRows} {seasonAverage} />
		</div>
	{/if}
</div>
