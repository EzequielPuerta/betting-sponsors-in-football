<script lang="ts">
	import { MAX_PICKS } from '$lib/constants/picks';
	import { formatNumber } from '$lib/utils/format';

	let {
		average,
		sum
	}: {
		average: number;
		/** La cuenta a la vista: "1 + 0 + 1 + 0,5 + 0" */
		sum: string;
	} = $props();
</script>

<div class="flex flex-col justify-end gap-1 border-l-4 border-primary pl-4">
	<span class="kicker">Índice promedio de tus partidos</span>
	<span class="text-5xl font-extrabold text-primary tabular-nums">{formatNumber(average)}</span>
	<span class="font-sans text-sm text-base-content/70">({sum}) ÷ {MAX_PICKS}</span>
</div>
