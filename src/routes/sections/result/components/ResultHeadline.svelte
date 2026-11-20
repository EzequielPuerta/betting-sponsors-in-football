<script lang="ts">
	import { MAX_PICKS } from '$lib/constants/picks';

	let {
		withBet,
		sightings,
		distinctBrands
	}: {
		/** Partidos elegidos con al menos una casa de apuestas */
		withBet: number;
		/** Apariciones totales de marcas de apuestas */
		sightings: number;
		/** Nombres de las casas distintas */
		distinctBrands: string[];
	} = $props();
</script>

<div class="flex max-w-3xl flex-col gap-4">
	<span class="kicker">Tu resultado</span>
	<h2 class="text-3xl leading-tight md:text-5xl">
		En <span class="text-primary">{withBet} de tus {MAX_PICKS} partidos</span> hubo casas de apuestas
		en las camisetas
	</h2>
	{#if sightings > 0}
		<p class="prose-story text-base-content/80">
			Entre los dos equipos de cada partido se vieron
			<strong class="font-sans">{sightings} {sightings === 1 ? 'marca' : 'marcas'}</strong>
			en total, de
			<strong class="font-sans">
				{distinctBrands.length}
				{distinctBrands.length === 1 ? 'casa distinta' : 'casas distintas'}
			</strong>
			({distinctBrands.join(', ')}).
		</p>
	{:else}
		<p class="prose-story text-base-content/80">
			Ninguna camiseta de los equipos de tus partidos llevaba una casa de apuestas.
		</p>
	{/if}
</div>
