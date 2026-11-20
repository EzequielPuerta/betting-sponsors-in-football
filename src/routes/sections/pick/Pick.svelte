<script lang="ts">
	import Highlight from '$lib/components/Highlight.svelte';
	import PickList from './components/PickList.svelte';
	import ScrollyStep from '$lib/components/scrolly/ScrollyStep.svelte';
	import AdaptiveScrolly from '$lib/components/scrolly/AdaptiveScrolly.svelte';
	import { MAX_PICKS } from '$lib/constants/picks';
	import { PICK_COLORS } from '$lib/constants/colors';
	import { dataStore } from '$lib/stores/dataStore';
	import { pickedMatches } from '$lib/stores/picks';
	import { rounds } from '$lib/utils/matches';
	import { configurations, type PickState } from './chartConfigurations';
	import Main from './components/Main.svelte';

	let chartState = $state<PickState>('overview');
	const sectionProps = $derived(configurations[chartState]);

	const show = (state: PickState) => () => {
		chartState = state;
	};

	const matches = $derived($dataStore.matches ?? []);
	const picked = $derived($pickedMatches);
	const missing = $derived(MAX_PICKS - picked.length);

	// Lo que se le devuelve al lector mientras elige: nada que revele el indice, solo lo que ya ve en el grafico.
	const pickedGoals = $derived(picked.reduce((sum, m) => sum + m.goals, 0));
	const pickedRounds = $derived(new Set(picked.map((m) => m.round)).size);
	const feedback = $derived.by(() => {
		if (picked.length === 0) return 'Todavía no elegiste ninguno. Hacé clic en cualquier punto.';
		if (missing > 0) {
			const last = picked[picked.length - 1];
			return `Elegiste ${last.home.name} ${last.home.goals}–${last.away.goals} ${last.away.name}. ${
				missing === 1 ? 'Falta uno.' : `Faltan ${missing}.`
			}`;
		}
		return `Listo: ${pickedGoals} goles repartidos en ${pickedRounds} ${pickedRounds === 1 ? 'fecha' : 'fechas'}. Seguí bajando.`;
	});
</script>

{#snippet telling()}
	<ScrollyStep showData="force-refresh" symmetric="onEnter" onEnter={show('overview')}>
		<p>
			La primera fase del Torneo Clausura de la Liga Profesional dejó
			<strong>{matches.length} partidos</strong>
			en {rounds(matches).length} fechas.
		</p>
	</ScrollyStep>

	<ScrollyStep showData symmetric="onEnter" onEnter={show('overview')}>
		<p>
			Cada punto es uno de esos partidos. Lo ubicamos según la <strong>fecha del torneo</strong>
			y el <strong>horario</strong> en que arrancó.
		</p>
	</ScrollyStep>

	<ScrollyStep showData symmetric="onEnter" onEnter={show('overview')}>
		<p>
			El tamaño marca los <strong>goles</strong>: los partidos más chicos terminaron con pocos, los
			más grandes con muchos.
		</p>
	</ScrollyStep>

	<ScrollyStep showData symmetric="onEnter" onEnter={show('pick')} dvhHeightFactor={3}>
		<p class="mb-3">
			Ahora te toca a vos. Elegí <strong>{MAX_PICKS} partidos al azar</strong>, con un clic sobre
			<Highlight color={PICK_COLORS.Resto}>cualquier punto</Highlight>.
		</p>
		<p class="mb-3 font-sans text-base font-semibold text-primary">{feedback}</p>
		<PickList />
	</ScrollyStep>
{/snippet}

<AdaptiveScrolly {telling} content={Main} props={sectionProps} />
