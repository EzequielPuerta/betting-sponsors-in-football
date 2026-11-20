<script lang="ts">
	import { ScatterPlot, type AxisBasedMarkersConfig } from '@fundar/data-chart-telling';
	import { DOT_RADIUS_RANGE, GOALS_DOMAIN, HOUR_DOMAIN, HOUR_TICKS } from '$lib/constants/chart';
	import { IMPACT_ORDER } from '$lib/constants/impact';
	import { isMobile } from '$lib/stores/device';
	import { formatHour } from '$lib/utils/format';
	import { IMPACT_COLORS, INK_COLOR, PICK_COLORS } from '$lib/constants/colors';
	import { MAX_PICKS } from '$lib/constants/picks';
	import { dataStore } from '$lib/stores/dataStore';
	import { pickedIds, togglePick } from '$lib/stores/picks';
	import { toPoints } from '$lib/utils/jitter';
	import type { MatchPoint } from '$lib/types/match';
	import MatchTooltip from './MatchTooltip.svelte';

	let {
		width,
		height,
		points: givenPoints,
		colorBy = 'pick',
		interactive = false,
		onpick = (match: MatchPoint) => togglePick(match.id),
		maxReached = $pickedIds.length >= MAX_PICKS,
		highlightPicked = false
	}: {
		width: number;
		height: number;
		points?: MatchPoint[];
		colorBy?: 'pick' | 'impact';
		interactive?: boolean;
		onpick?: (match: MatchPoint) => void;
		maxReached?: boolean;
		highlightPicked?: boolean;
	} = $props();

	const points = $derived(givenPoints ?? toPoints($dataStore.matches ?? [], new Set($pickedIds)));

	const rounds = Array.from({ length: 16 }, (_, i) => i + 1);

	const hint = (match: MatchPoint) => {
		if (!interactive) return undefined;
		if (match.pick === 'Elegido') return 'Elegido · tocá para sacarlo';
		return maxReached ? 'Ya elegiste todos los que podías' : 'Tocá para elegirlo';
	};

	const markers = $derived<AxisBasedMarkersConfig[]>([
		{ type: 'hover', format: () => '' } as AxisBasedMarkersConfig,
		...(interactive || highlightPicked
			? [
					{
						type: 'dot',
						data: points,
						x: 'x',
						y: 'hour',
						r: (d: MatchPoint) => d.goals + (highlightPicked ? 1.6 : 0),
						styles: {
							dotFillOpacity: 0,
							dotStroke: INK_COLOR,
							dotStrokeWidth: 2.5,
							dotStrokeOpacity: (d: MatchPoint) =>
								highlightPicked && d.pick === 'Elegido' ? 1 : 0,
							cursor: interactive ? 'pointer' : undefined
						} as any,
						onclick: interactive ? (_event: Event, row: MatchPoint) => onpick?.(row) : undefined
					} as AxisBasedMarkersConfig
				]
			: [])
	]);

	const scheme = $derived(colorBy === 'impact' ? IMPACT_COLORS : PICK_COLORS);
</script>

{#snippet content({ rows }: { rows: MatchPoint[] })}
	<MatchTooltip match={rows[0]} hint={hint(rows[0])} />
{/snippet}

<ScatterPlot
	{width}
	{height}
	data={points}
	x="x"
	y="hour"
	r="goals"
	color={colorBy === 'impact' ? 'impact' : 'pick'}
	tooltip={{ strategy: 'punctual', content }}
	legend={colorBy === 'impact'
		? {
				series: { title: 'Impacto de sponsors de apuestas', columns: $isMobile ? 1 : 3 },
				r: { title: 'Goles' }
			}
		: { series: { enabled: false }, r: { title: 'Goles' } }}
	{markers}
	scales={{
		x: {
			domain: [0.4, 16.6],
			ticks: rounds,
			tickFormat: (d: unknown) => (Number.isInteger(d) ? `F${d}` : ''),
			label: 'Fecha del torneo',
			grid: false
		},
		y: {
			domain: HOUR_DOMAIN,
			ticks: HOUR_TICKS,
			tickFormat: (d: unknown) => formatHour(Number(d)),
			label: 'Horario de inicio',
			grid: true
		},
		r: { domain: GOALS_DOMAIN, range: DOT_RADIUS_RANGE },
		color: {
			scheme,
			domain: colorBy === 'impact' ? IMPACT_ORDER : ['Resto', 'Elegido']
		}
	}}
	styles={{ dotOpacity: 0.78 } as any}
/>
