<script lang="ts">
	import { onMount } from 'svelte';
	import Highlight from '$lib/components/Highlight.svelte';
	import ScrollyStep from '$lib/components/scrolly/ScrollyStep.svelte';
	import AdaptiveScrolly from '$lib/components/scrolly/AdaptiveScrolly.svelte';
	import { dataStore } from '$lib/stores/dataStore';
	import { formatNumber, formatPercent } from '$lib/utils/format';
	import { IMPACT_COLORS } from '$lib/constants/colors';
	import { BET_INDUSTRY } from '$lib/constants/industry';
	import { averageByRound, countWithImpact, meanImpact } from '$lib/utils/impact';
	import { configurations, type ImpactState } from './chartConfigurations';
	import Main from './components/Main.svelte';

	let chartState = $state<ImpactState>('all');
	const sectionProps = $derived(configurations[chartState]);

	const show = (state: ImpactState) => () => {
		chartState = state;
	};

	const matches = $derived($dataStore.matches ?? []);
	const total = $derived(matches.length);
	const none = $derived(matches.filter((m) => m.betImpact === 0).length);
	const one = $derived(matches.filter((m) => m.betImpact === 0.5).length);
	const both = $derived(countWithImpact(matches, 1));
	const atLeastOne = $derived(countWithImpact(matches, 0.5));
	const seasonAverage = $derived(meanImpact(matches));

	const teams = $derived($dataStore.teams ?? []);
	const sponsors = $derived($dataStore.sponsors ?? []);
	const teamCount = $derived(teams.length);
	const betTeams = $derived(teams.filter((t) => t.betBrands.length > 0));
	const matchesPerRound = $derived(teamCount / 2);

	const byRound = $derived(averageByRound(matches));
	const flat = $derived(
		byRound.length > 0 &&
			Math.max(...byRound.map((r) => r.average)) - Math.min(...byRound.map((r) => r.average)) < 1e-9
	);

	// Zona de la camiseta de las casas de apuestas: ¿alguna aparece fuera del pecho?
	const betRows = $derived(sponsors.filter((s) => s.isBet));
	const betOutsideChest = $derived(betRows.filter((s) => s.region !== 'pecho'));

	// Industria del sponsor principal de cada club
	const counts = $derived($dataStore.industries?.counts ?? []);
	const betCount = $derived(counts.find((c) => c.industry === BET_INDUSTRY)?.clubs ?? 0);
	const betRank = $derived(counts.findIndex((c) => c.industry === BET_INDUSTRY) + 1);
	const topIndustry = $derived(counts[0] ?? { industry: '', clubs: 0 });
	const RANKS = ['primer', 'segundo', 'tercer', 'cuarto', 'quinto'];

	const list = (names: string[]) =>
		names.length < 2
			? names.join('')
			: `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;

	// El gráfico "engancha" al llegar: al pasar cerca del comienzo de esta sección, la pantalla se acomoda sola.
	onMount(() => {
		document.documentElement.classList.add('snap-proximity');
		return () => document.documentElement.classList.remove('snap-proximity');
	});
</script>

<div id="impacto" class="snap-start">
	{#snippet telling()}
		<ScrollyStep showData="force-refresh" symmetric="onEnter" onEnter={show('all')}>
			<p>
				Volvamos al gráfico completo, con los <strong>{total} partidos</strong>. Los tuyos están
				marcados en el color de tu selección.
			</p>
		</ScrollyStep>

		<ScrollyStep showData symmetric="onEnter" onEnter={show('impact')}>
			<p>
				Ahora pintamos cada partido según el <strong
					>índice de sponsors de casas de apuestas online</strong
				>: <Highlight color={IMPACT_COLORS['Ninguno']}>0</Highlight> si ninguno de los dos equipos tiene
				una en la camiseta,
				<Highlight color={IMPACT_COLORS['Uno de los dos']}>0,5</Highlight> si la tiene uno y
				<Highlight color={IMPACT_COLORS['Los dos']}>1</Highlight> si la tienen los dos.
			</p>
		</ScrollyStep>

		<ScrollyStep showData symmetric="onEnter" onEnter={show('impact')}>
			<p>
				En <Highlight color={IMPACT_COLORS['Ninguno']}
					>{none} partidos ({formatPercent(none / total)})</Highlight
				>
				ninguno de los dos equipos tenía una casa de apuestas en el pecho, la manga o cualquier otra zona
				visible de la camiseta. En
				<Highlight color={IMPACT_COLORS['Uno de los dos']}
					>{one} ({formatPercent(one / total)})</Highlight
				>
				la tenía uno, y en
				<Highlight color={IMPACT_COLORS['Los dos']}
					>{both} ({formatPercent(both / total)})</Highlight
				>, los dos.
			</p>
		</ScrollyStep>

		<ScrollyStep showData symmetric="onEnter" onEnter={show('impact')} dvhHeightFactor={1.5}>
			<p class="mb-4">
				En más de la mitad de los partidos de la primera fase (<strong
					>{formatPercent(atLeastOne / total)}</strong
				>) hubieras visto una casa de apuestas en alguna camiseta.
			</p>
			<ul class="flex flex-col gap-3 font-sans">
				<li class="border-t border-base-300 pt-2">
					<span class="block text-4xl font-extrabold tabular-nums">{total}</span>
					<span class="text-base">partidos en la primera fase</span>
				</li>
				<li class="border-t border-base-300 pt-2">
					<span
						class="block text-4xl font-extrabold tabular-nums"
						style:color={IMPACT_COLORS['Uno de los dos']}>{atLeastOne}</span
					>
					<span class="text-base">con al menos un equipo con casa de apuestas</span>
				</li>
				<li class="border-t border-base-300 pt-2">
					<span
						class="block text-4xl font-extrabold tabular-nums"
						style:color={IMPACT_COLORS['Los dos']}>{both}</span
					>
					<span class="text-base">con los dos equipos con casa de apuestas</span>
				</li>
				<li class="border-t border-base-300 pt-2">
					<span class="block text-4xl font-extrabold tabular-nums"
						>{formatNumber(seasonAverage)}</span
					>
					<span class="text-base">índice promedio de toda la temporada</span>
				</li>
			</ul>
		</ScrollyStep>

		<ScrollyStep showData symmetric="onEnter" onEnter={show('bars')}>
			<p>
				Si juntamos los partidos de cada fecha, la pregunta es cuánto pesa cada tipo. Cada barra es
				una fecha y cada color, la cantidad de partidos de ese nivel.
			</p>
		</ScrollyStep>

		<ScrollyStep showData symmetric="onEnter" onEnter={show('line')}>
			{#if flat}
				<p>
					Promediamos el índice de cada fecha y la línea quedó <strong>perfectamente plana</strong>:
					{formatNumber(seasonAverage)} en las {byRound.length} fechas.
				</p>
				<p class="mt-3 font-sans text-base text-base-content/70">
					No es casualidad: en cada fecha juega cada equipo una vez, y {betTeams.length} de {teamCount}
					equipos llevan una casa de apuestas en la camiseta.
				</p>
			{:else}
				<p>
					Promediamos el índice de cada fecha. La línea se movió poco, entre
					<strong>{formatNumber(Math.min(...byRound.map((r) => r.average)))}</strong> y
					<strong>{formatNumber(Math.max(...byRound.map((r) => r.average)))}</strong>.
				</p>
			{/if}
		</ScrollyStep>

		{#if flat}
			<ScrollyStep showData symmetric="onEnter" onEnter={show('line')} dvhHeightFactor={1.4}>
				<p class="font-sans text-xl font-bold">¿Por qué da siempre lo mismo?</p>
				<ol class="mt-2 flex list-decimal flex-col gap-2 pl-5 font-sans text-base">
					<li>
						Cada equipo juega <strong>un solo partido por fecha</strong>: hay {teamCount} camisetas repartidas
						en {matchesPerRound} partidos.
					</li>
					<li>
						El índice de un partido es <strong>(a + b) ÷ 2</strong>, con <em>a</em> y <em>b</em> en 1
						si ese equipo tiene casa de apuestas y en 0 si no.
					</li>
					<li>
						Al sumar los {matchesPerRound} partidos, cada equipo entra una sola vez: la suma es
						{betTeams.length} ÷ 2, y el promedio, {betTeams.length} ÷ 2 ÷ {matchesPerRound} =
						<strong
							>{betTeams.length} ÷ {teamCount} = {formatNumber(betTeams.length / teamCount)}</strong
						>.
					</li>
				</ol>
				<p class="mt-2 font-sans text-sm text-base-content/70">
					El promedio de cada fecha es la proporción de equipos con casa de apuestas. El fixture
					decide quién enfrenta a quién, pero no puede cambiarlo.
				</p>
			</ScrollyStep>
		{/if}

		<ScrollyStep showData symmetric="onEnter" onEnter={show('clubs')} dvhHeightFactor={1.2}>
			<p>
				Detrás de ese número hay <strong>{betTeams.length} clubes de {teamCount}</strong> con una
				casa de apuestas en la camiseta: {list(betTeams.map((t) => t.name))}.
			</p>
		</ScrollyStep>

		<ScrollyStep showData symmetric="onEnter" onEnter={show('clubs')} dvhHeightFactor={1.2}>
			{#if betOutsideChest.length === 0}
				<p>
					Las {betRows.length} marcas están en el <strong>pecho</strong>. En las camisetas que
					analizamos, ninguna casa de apuestas aparece en el pecho superior, el cuello, la manga ni
					la parte baja.
				</p>
			{:else}
				<p>
					{betRows.length - betOutsideChest.length} de las {betRows.length} marcas están en el
					<strong>pecho</strong>. Las otras {betOutsideChest.length} aparecen en otra zona de la camiseta
					({list([
						...new Set(betOutsideChest.map((s) => `${s.sponsor} (${s.region.replace('_', ' ')})`))
					])}).
				</p>
			{/if}
		</ScrollyStep>

		<ScrollyStep showData symmetric="onEnter" onEnter={show('industries')} dvhHeightFactor={1.4}>
			<p>
				Si miramos solo el sponsor principal de cada club, las casas de apuestas son el
				<strong>{RANKS[betRank - 1] ?? `${betRank}.º`} rubro</strong>: {betCount} de {teamCount} clubes
				({formatPercent(betCount / teamCount)}).
				{#if betRank > 1}
					{topIndustry.industry} las supera por poco, con {topIndustry.clubs}.
				{/if}
			</p>
			<p class="mt-3 font-sans text-sm text-base-content/70">
				Como ninguna casa de apuestas aparece fuera del pecho, este gráfico no deja ninguna afuera.
			</p>
		</ScrollyStep>
	{/snippet}

	<AdaptiveScrolly {telling} content={Main} props={sectionProps} />
</div>
