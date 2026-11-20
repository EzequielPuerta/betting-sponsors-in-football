<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { MAX_PICKS } from '$lib/constants/picks';
	import { pickedIds } from '$lib/stores/picks';

	let { targetId }: { targetId: string } = $props();

	const missing = $derived(MAX_PICKS - $pickedIds.length);

	let blocked = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	/**
	 * Mientras falten partidos por elegir, la pagina no baja de donde termina la escena `targetId`:
	 * el lector puede volver para arriba, pero no seguir leyendo sin haber elegido.
	 */
	function limit(): number | null {
		const el = document.getElementById(targetId);
		if (!el) return null;
		return el.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
	}

	function clamp() {
		if (missing <= 0) return;
		const max = limit();
		if (max === null || window.scrollY <= max) return;
		window.scrollTo({ top: max, behavior: 'instant' });
		blocked = true;
		clearTimeout(timer);
		timer = setTimeout(() => (blocked = false), 3000);
	}

	$effect(() => {
		if (missing <= 0) blocked = false;
	});

	onMount(() => {
		window.addEventListener('scroll', clamp, { passive: true });
		return () => {
			window.removeEventListener('scroll', clamp);
			clearTimeout(timer);
		};
	});
</script>

{#if blocked && missing > 0}
	<div
		class="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
		transition:fade={{ duration: 200 }}
		role="status"
	>
		<p
			class="border border-primary bg-base-100 px-4 py-2 font-sans text-sm font-semibold shadow-lg"
		>
			{missing === 1 ? 'Falta 1 partido' : `Faltan ${missing} partidos`} para seguir. Elegilos con un
			clic, o usá «Elegir al azar».
		</p>
	</div>
{/if}
