<script lang="ts">
	import { formatMatchDate, formatNumber } from '$lib/utils/format';
	import type { Match } from '$lib/types/match';

	let { match }: { match: Match } = $props();
</script>

<div class="flex items-baseline justify-between gap-2">
	<span class="text-[11px] font-bold tracking-wide text-primary uppercase">
		Fecha {match.round} · {formatMatchDate(match)}
	</span>
	<span
		class="shrink-0 border px-1.5 py-0.5 text-xs font-bold tabular-nums"
		class:border-primary={match.betImpact > 0}
		class:text-primary={match.betImpact > 0}
		class:border-base-300={match.betImpact === 0}
	>
		índice {formatNumber(match.betImpact)}
	</span>
</div>
