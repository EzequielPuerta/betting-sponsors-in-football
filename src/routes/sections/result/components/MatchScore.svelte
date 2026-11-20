<script lang="ts">
	import { base } from '$app/paths';
	import type { Match } from '$lib/types/match';

	let { match }: { match: Match } = $props();
</script>

<!-- escudo, nombre y goles del local | goles, nombre y escudo del visitante -->
<div class="grid grid-cols-[auto_1fr_auto_auto_auto_1fr_auto] items-center gap-x-2">
	<img src="{base}/{match.home.crest}" alt="" class="size-7 object-contain" />
	<span class="text-sm leading-tight font-semibold">{match.home.name}</span>
	<span class="text-xl font-extrabold tabular-nums">{match.home.goals}</span>
	<span class="text-base-content/40">–</span>
	<span class="text-xl font-extrabold tabular-nums">{match.away.goals}</span>
	<span class="text-right text-sm leading-tight font-semibold">{match.away.name}</span>
	<img src="{base}/{match.away.crest}" alt="" class="size-7 object-contain" />
</div>
