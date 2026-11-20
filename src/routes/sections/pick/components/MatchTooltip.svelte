<script lang="ts">
	import { base } from '$app/paths';
	import { formatMatchDate } from '$lib/utils/format';
	import type { MatchPoint } from '$lib/types/match';
	import TooltipBox from '$lib/components/charts/TooltipBox.svelte';

	let {
		match,
		hint
	}: {
		match: MatchPoint;
		hint?: string;
	} = $props();
</script>

<TooltipBox title="Fecha {match.round} · {formatMatchDate(match)}, {match.time}" footer={hint}>
	<div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2">
		<div class="flex flex-col items-center gap-1 text-center">
			<img src="{base}/{match.home.crest}" alt="" class="size-9 object-contain" />
			<span class="text-xs leading-tight font-semibold">{match.home.name}</span>
		</div>
		<div class="text-2xl font-extrabold tabular-nums">{match.home.goals}–{match.away.goals}</div>
		<div class="flex flex-col items-center gap-1 text-center">
			<img src="{base}/{match.away.crest}" alt="" class="size-9 object-contain" />
			<span class="text-xs leading-tight font-semibold">{match.away.name}</span>
		</div>
	</div>

	{#if match.venue}
		<div class="border-t border-base-300 px-3 py-1.5 text-xs text-base-content/70">
			{match.venue}{match.city ? `, ${match.city}` : ''}
		</div>
	{/if}
</TooltipBox>
