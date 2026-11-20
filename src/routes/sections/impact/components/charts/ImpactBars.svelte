<script lang="ts">
	import { BarPlot, type AxisBasedMarkersConfig } from '@fundar/data-chart-telling';
	import { IMPACT_ORDER } from '$lib/constants/impact';
	import { isMobile } from '$lib/stores/device';
	import { brighten, IMPACT_COLORS } from '$lib/constants/colors';
	import type { ImpactLabel } from '$lib/types/match';
	import type { RoundImpactRow } from '$lib/types/match';
	import ChartTooltip from '$lib/components/charts/ChartTooltip.svelte';

	let {
		width,
		height,
		rows
	}: {
		width: number;
		height: number;
		rows: RoundImpactRow[];
	} = $props();

	const data = $derived(rows.map((row) => ({ ...row, fecha: `F${row.round}` })));
</script>

{#snippet content({ rows: hovered }: { rows: (typeof data)[number][] })}
	<ChartTooltip
		title="Fecha {hovered[0].round}"
		entries={IMPACT_ORDER.map((impact) => ({
			label: impact,
			color: IMPACT_COLORS[impact],
			value: `${hovered.find((r) => r.impact === impact)?.matches ?? 0} partidos`
		}))}
	/>
{/snippet}

<BarPlot
	markers={[
		{
			type: 'hover',
			// la barra con el mouse se ve un poco mas clara
			active: { fill: (row: { impact: ImpactLabel }) => brighten(IMPACT_COLORS[row.impact]) }
		} as AxisBasedMarkersConfig
	]}
	{width}
	{height}
	{data}
	x="fecha"
	y="matches"
	color="impact"
	transforms={[{ type: 'stackY' }]}
	tooltip={{ strategy: 'x', content }}
	legend={{ series: { title: 'Impacto de sponsors de apuestas', columns: $isMobile ? 1 : 3 } }}
	scales={{
		x: {
			label: 'Fecha del torneo',
			domain: Array.from({ length: 16 }, (_, i) => `F${i + 1}`)
		},
		y: { label: 'Partidos', domain: [0, 15], ticks: [0, 5, 10, 15] },
		color: { scheme: IMPACT_COLORS, domain: IMPACT_ORDER }
	}}
/>
