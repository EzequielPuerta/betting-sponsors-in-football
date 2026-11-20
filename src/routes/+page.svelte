<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { base } from '$app/paths';
	import { dataStore, isDataLoaded, loadAll, loadingProgress } from '$lib/stores/dataStore';
	import Hero from '$lib/components/Hero.svelte';
	import TextBlock from '$lib/components/TextBlock.svelte';
	import ScrollGate from './ScrollGate.svelte';
	import Intro from './sections/intro/Intro.svelte';
	import Pick from './sections/pick/Pick.svelte';
	import Results from './sections/result/Results.svelte';
	import Impact from './sections/impact/Impact.svelte';

	onMount(() => {
		loadAll([`${base}/crests/boca-juniors.png`]);
	});

	const total = $derived($dataStore.matches?.length ?? 0);
</script>

{#if !$isDataLoaded}
	<div
		class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-base-100"
		out:fade={{ duration: 300 }}
	>
		<span class="kicker">Cargando partidos</span>
		<progress class="progress h-1 w-48 progress-primary" value={$loadingProgress} max="100"
		></progress>
	</div>
{:else}
	<Hero
		kicker="Fútbol argentino y apuestas online"
		title="La camiseta no se mancha"
		deck="Casas de apuestas en el fútbol y ludopatía."
		byline="Liga Profesional de Fútbol de AFA, Football Kit Archive"
		video="video/hero-collage.mp4"
	/>

	<Intro />

	<TextBlock>
		<p>
			Cuando mirás un partido de la Liga Profesional, ¿cuántas veces ves el logo de una casa de
			apuestas en las camisetas?
		</p>
		<p>
			Antes de contestar, probemos con partidos de verdad: los {total} que se jugaron en la primera fase
			del último torneo.
		</p>
	</TextBlock>

	<div id="pick">
		<Pick />
	</div>
	<ScrollGate targetId="pick" />
	<Results />
	<Impact />
{/if}
