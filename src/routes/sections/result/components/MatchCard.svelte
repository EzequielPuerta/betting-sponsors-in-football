<script lang="ts">
	import type { Match, Team } from '$lib/types/match';
	import MatchMeta from './MatchMeta.svelte';
	import MatchScore from './MatchScore.svelte';
	import TeamKit from './TeamKit.svelte';

	let {
		match,
		teams
	}: {
		match: Match;
		/** Equipos por id (para las camisetas y sponsors) */
		teams: Map<string, Team>;
	} = $props();

	const kits = $derived(
		[teams.get(match.home.id), teams.get(match.away.id)].filter((team): team is Team => !!team)
	);
</script>

<article class="flex flex-col gap-3 border border-base-300 bg-base-100 p-4 font-sans">
	<MatchMeta {match} />
	<MatchScore {match} />
	<div class="grid grid-cols-2 gap-3">
		{#each kits as team (team.id)}
			<TeamKit {team} />
		{/each}
	</div>
</article>
