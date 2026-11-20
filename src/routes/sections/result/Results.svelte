<script lang="ts">
	import AverageIndex from './components/AverageIndex.svelte';
	import ImpactIndex from './components/ImpactIndex.svelte';
	import IncompleteNotice from './components/IncompleteNotice.svelte';
	import MatchCard from './components/MatchCard.svelte';
	import ResultHeadline from './components/ResultHeadline.svelte';
	import { MAX_PICKS } from '$lib/constants/picks';
	import { dataStore } from '$lib/stores/dataStore';
	import { pickedMatches } from '$lib/stores/picks';
	import { formatNumber } from '$lib/utils/format';
	import { meanImpact } from '$lib/utils/impact';
	import type { Match, Team } from '$lib/types/match';

	const teams = $derived(new Map(($dataStore.teams ?? []).map((t) => [t.id, t])));
	const picked = $derived($pickedMatches);
	const complete = $derived(picked.length >= MAX_PICKS);

	const betTeams = (match: Match) =>
		[teams.get(match.home.id), teams.get(match.away.id)].filter(
			(team): team is Team => !!team && team.betBrands.length > 0
		);

	/** Partidos con al menos una casa de apuestas en alguna camiseta */
	const withBet = $derived(picked.filter((m) => m.betImpact > 0).length);
	/** Marcas distintas (una marca en las dos camisetas cuenta una sola vez) y apariciones totales */
	const distinctBrands = $derived([
		...new Set(picked.flatMap((m) => betTeams(m).flatMap((t) => t.betBrands.map((b) => b.name))))
	]);
	const sightings = $derived(picked.reduce((sum, m) => sum + m.betBrands, 0));
	const average = $derived(meanImpact(picked));
	/** La cuenta a la vista: (1 + 0 + 1 + 0,5 + 0) / 6 */
	const sum = $derived(picked.map((m) => formatNumber(m.betImpact)).join(' + '));
</script>

<section id="resultado" class="border-y border-base-300 bg-base-200 px-4 py-16">
	<div class="mx-auto flex max-w-5xl flex-col gap-10">
		{#if !complete}
			<IncompleteNotice picked={picked.length} />
		{:else}
			<ResultHeadline {withBet} {sightings} {distinctBrands} />

			<div class="grid gap-8 md:grid-cols-2">
				<div class="flex flex-col gap-2">
					<h3 class="text-lg">Cómo se calcula el índice de cada partido</h3>
					<ImpactIndex />
				</div>
				<AverageIndex {average} {sum} />
			</div>

			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each picked as match (match.id)}
					<MatchCard {match} {teams} />
				{/each}
			</div>

			<p class="prose-story max-w-2xl text-base-content/80">
				¿Tuviste suerte o mala suerte? Para saberlo hay que mirar los {$dataStore.matches?.length}
				partidos, no solo {MAX_PICKS}.
			</p>
		{/if}
	</div>
</section>
