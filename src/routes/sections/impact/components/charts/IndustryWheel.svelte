<script lang="ts">
	import { base } from '$app/paths';
	import ChartTooltip from '$lib/components/charts/ChartTooltip.svelte';
	import type { IndustryClub, IndustryGroup } from '$lib/types/industry';

	let {
		width,
		height,
		groups
	}: {
		width: number;
		height: number;
		groups: IndustryGroup[];
	} = $props();

	// Geometria en unidades del viewBox (700 x 700)
	const SIZE = 700;
	const C = SIZE / 2;
	const R_HOLE = 72;
	const R_INDUSTRY = [76, 142] as const;
	const R_CLUB = [146, 216] as const;
	const R_CREST = 181;
	const R_TEXT = 224;

	const clubCount = $derived(groups.reduce((sum, group) => sum + group.clubs.length, 0));
	const step = $derived(360 / Math.max(clubCount, 1));

	const rad = (deg: number) => (deg * Math.PI) / 180;
	const point = (r: number, deg: number) => [
		C + r * Math.cos(rad(deg)),
		C + r * Math.sin(rad(deg))
	];

	function wedge(r0: number, r1: number, a0: number, a1: number) {
		const [x0, y0] = point(r1, a0);
		const [x1, y1] = point(r1, a1);
		const [x2, y2] = point(r0, a1);
		const [x3, y3] = point(r0, a0);
		const large = a1 - a0 > 180 ? 1 : 0;
		return `M${x0},${y0} A${r1},${r1} 0 ${large} 1 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 ${large} 0 ${x3},${y3} Z`;
	}

	/** Texto en sentido radial, siempre legible (en la mitad izquierda se da vuelta). */
	function radial(r: number, deg: number, anchorAtStart: boolean) {
		const flip = Math.cos(rad(deg)) < 0;
		const shift = flip ? -r : r;
		return {
			transform: `translate(${C},${C}) rotate(${flip ? deg + 180 : deg}) translate(${shift},0)`,
			anchor: anchorAtStart ? (flip ? 'end' : 'start') : 'middle'
		};
	}

	const short = (text: string, max = 19) =>
		text.length > max ? `${text.slice(0, max - 1)}…` : text;

	/** Los clubes en el orden de la rueda, con su angulo */
	const slots = $derived.by(() => {
		let index = 0;
		return groups.map((group) => {
			const from = -90 + index * step;
			const members = group.clubs.map((club) => {
				const a0 = -90 + index * step;
				index += 1;
				return { club, a0, a1: a0 + step, mid: a0 + step / 2 };
			});
			return { group, from, to: from + group.clubs.length * step, members };
		});
	});

	let container = $state<HTMLDivElement>();
	let hovered = $state<{ club: IndustryClub; x: number; y: number } | null>(null);

	function track(club: IndustryClub, event: PointerEvent) {
		const box = container?.getBoundingClientRect();
		if (!box) return;
		hovered = { club, x: event.clientX - box.left, y: event.clientY - box.top };
	}

	const side = $derived(Math.min(width, height));
	const tooltipLeft = $derived(hovered ? Math.min(hovered.x + 16, width - 270) : 0);
</script>

<div
	bind:this={container}
	class="relative flex items-center justify-center"
	style:width="{width}px"
	style:height="{height}px"
>
	<svg
		viewBox="0 0 {SIZE} {SIZE}"
		width={side}
		height={side}
		role="img"
		aria-label="Rubro del sponsor principal de cada club"
	>
		{#each slots as { group, from, to, members } (group.label)}
			<!-- anillo de industrias -->
			<path
				d={wedge(R_INDUSTRY[0], R_INDUSTRY[1], from, to)}
				style:fill={group.isBet
					? 'var(--color-primary)'
					: 'color-mix(in srgb, var(--color-base-content) 14%, transparent)'}
				style:stroke="var(--color-base-100)"
				stroke-width="3"
			/>
			{@const mid = (from + to) / 2}
			{@const label = radial((R_INDUSTRY[0] + R_INDUSTRY[1]) / 2, mid, false)}
			<text
				transform={label.transform}
				text-anchor="middle"
				dominant-baseline="central"
				font-size="14"
				font-weight="800"
				style:fill={group.isBet ? 'var(--color-primary-content)' : 'var(--color-base-content)'}
			>
				{group.label}
			</text>

			<!-- anillo de clubes -->
			{#each members as { club, a0, a1, mid: clubMid } (club.team.id)}
				{@const [cx, cy] = point(R_CREST, clubMid)}
				{@const name = radial(R_TEXT, clubMid, true)}
				<g
					role="presentation"
					onpointerenter={(e) => track(club, e)}
					onpointermove={(e) => track(club, e)}
					onpointerleave={() => (hovered = null)}
					style:cursor="default"
				>
					<path
						d={wedge(R_CLUB[0], R_CLUB[1], a0, a1)}
						style:fill={club.isBet
							? 'color-mix(in srgb, var(--color-primary) 30%, transparent)'
							: 'color-mix(in srgb, var(--color-base-content) 7%, transparent)'}
						style:stroke="var(--color-base-100)"
						stroke-width="2"
					/>
					<image href="{base}/{club.team.crest}" x={cx - 15} y={cy - 15} width="30" height="30" />
					<text
						transform={name.transform}
						text-anchor={name.anchor}
						dominant-baseline="central"
						font-size="11.5"
						font-weight={club.isBet ? 800 : 500}
						style:fill={club.isBet ? 'var(--color-primary)' : 'var(--color-base-content)'}
						style:opacity={club.sponsor ? 1 : 0.5}
					>
						{club.sponsor ? short(club.sponsor) : 'Sin sponsor'}
					</text>
				</g>
			{/each}
		{/each}

		<circle cx={C} cy={C} r={R_HOLE} style:fill="var(--color-base-100)" />
		<text
			x={C}
			y={C - 8}
			text-anchor="middle"
			font-size="15"
			font-weight="800"
			style:fill="var(--color-base-content)"
		>
			Sponsor principal
		</text>
		<text
			x={C}
			y={C + 12}
			text-anchor="middle"
			font-size="12"
			style:fill="var(--color-base-content)"
			opacity="0.65"
		>
			{clubCount} clubes
		</text>
	</svg>

	{#if hovered}
		<div
			class="pointer-events-none absolute z-10"
			style:left="{tooltipLeft}px"
			style:top="{Math.max(hovered.y - 20, 0)}px"
		>
			<ChartTooltip
				title={hovered.club.team.name}
				entries={[
					{ label: 'Sponsor principal', value: hovered.club.sponsor ?? 'Sin sponsor' },
					{ label: 'Rubro', value: hovered.club.industry }
				]}
				footer={hovered.club.isBet ? 'Casa de apuestas' : undefined}
			/>
		</div>
	{/if}
</div>
