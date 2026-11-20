<script lang="ts">
	import { LinePlot, type AxisBasedMarkersConfig } from '@fundar/data-chart-telling';
	import { ACCENT_COLOR } from '$lib/constants/colors';
	import { formatNumber } from '$lib/utils/format';
	import type { RoundAverageRow } from '$lib/types/match';
	import ChartTooltip from '$lib/components/charts/ChartTooltip.svelte';

	let {
		width,
		height,
		rows,
		seasonAverage
	}: {
		width: number;
		height: number;
		rows: RoundAverageRow[];
		/** Promedio de toda la temporada: se rotula sobre la linea */
		seasonAverage: number;
	} = $props();

	const rounds = Array.from({ length: 16 }, (_, i) => i + 1);
	const accent = ACCENT_COLOR;

	const markers = $derived<AxisBasedMarkersConfig[]>([
		{
			type: 'text',
			data: [{ round: 16, average: seasonAverage }],
			x: 'round',
			y: 'average',
			text: `Promedio de la temporada: ${formatNumber(seasonAverage)}`,
			dy: -12,
			styles: { fill: accent, fontWeight: 700, textAnchor: 'end' } as any
		},
		{ type: 'hover', decimals: 2 }
	]);
</script>

{#snippet content({ rows: hovered }: { rows: RoundAverageRow[] })}
	<ChartTooltip
		title="Fecha {hovered[0].round}"
		entries={[{ label: 'Índice promedio', value: formatNumber(hovered[0].average), color: accent }]}
	/>
{/snippet}

<LinePlot
	{width}
	{height}
	data={rows}
	x="round"
	y="average"
	segments={{ default: [{ styles: { stroke: { stroke: accent, strokeWidth: 3 } } }] } as any}
	{markers}
	tooltip={{ strategy: 'x', content }}
	legend={false}
	scales={{
		x: {
			domain: [1, 16],
			ticks: rounds,
			tickFormat: (d: unknown) => `F${d}`,
			label: 'Fecha del torneo'
		},
		y: {
			domain: [0, 1],
			ticks: [0, 0.25, 0.5, 0.75, 1],
			label: 'Índice promedio de la fecha',
			grid: true
		}
	}}
	styles={{ strokeWidth: 3 } as any}
/>
