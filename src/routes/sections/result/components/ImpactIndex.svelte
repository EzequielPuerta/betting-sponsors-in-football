<script lang="ts">
	import { IMPACT_ORDER, IMPACT_VALUES } from '$lib/constants/impact';
	import { formatNumber } from '$lib/utils/format';
	import { IMPACT_COLORS } from '$lib/constants/colors';

	const DESCRIPTIONS = {
		Ninguno: 'Ninguno de los dos equipos tiene una casa de apuestas en la camiseta',
		'Uno de los dos': 'Solo uno de los dos equipos la tiene',
		'Los dos': 'Los dos equipos la tienen'
	} as const;
</script>

<table class="w-full max-w-xl border-collapse font-sans text-sm">
	<thead>
		<tr class="border-b-2 border-base-content text-left text-xs tracking-wide uppercase">
			<th class="py-1.5 pr-3 font-bold">Índice</th>
			<th class="py-1.5 font-bold">Cuando…</th>
		</tr>
	</thead>
	<tbody>
		{#each IMPACT_ORDER as impact (impact)}
			<tr class="border-b border-base-300">
				<td class="py-2 pr-3 whitespace-nowrap">
					<span
						class="mr-2 inline-block size-3 rounded-full align-middle"
						style:background-color={IMPACT_COLORS[impact]}
					></span>
					<strong class="text-lg tabular-nums">{formatNumber(IMPACT_VALUES[impact])}</strong>
				</td>
				<td class="py-2">{DESCRIPTIONS[impact]}</td>
			</tr>
		{/each}
	</tbody>
</table>
<p class="mt-2 font-sans text-xs text-base-content/60">
	En cualquier zona visible de la camiseta de frente: pecho, pecho superior, cuello, manga o parte
	baja.
</p>
