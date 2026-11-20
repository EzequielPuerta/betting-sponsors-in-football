<script lang="ts">
	import { MAX_PICKS } from '$lib/constants/picks';
	import { fillRandomPicks } from '$lib/stores/picks';

	let { picked }: { picked: number } = $props();
</script>

<div class="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
	<span class="kicker">Tu resultado</span>
	<h2 class="text-3xl md:text-4xl">Todavía te faltan partidos</h2>
	<p class="prose-story text-base-content/80">
		Elegiste {picked} de {MAX_PICKS}. Volvé al gráfico o dejá que el azar complete el resto.
	</p>
	<button type="button" class="btn btn-primary" onclick={fillRandomPicks}>
		Completar al azar
	</button>
</div>
