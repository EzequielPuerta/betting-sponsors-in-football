<script lang="ts">
	import '../app.css';
	import { untrack } from 'svelte';
	import { setConfiguration } from '@fundar/data-chart-telling';
	import { isMobile } from '$lib/stores/device';
	import { chartConfiguration } from '$lib/utils/chartTheme';
	import favicon from '$lib/assets/favicon.svg';
	import Footer from '$lib/components/Footer.svelte';

	// Una sola configuracion para todos los graficos. Depende del viewport, asi que se aplica
	// reactivamente; `$effect.pre` la fija antes de que se dibuje el primero.
	$effect.pre(() => {
		const mobile = $isMobile;
		untrack(() => setConfiguration(chartConfiguration(mobile)));
	});

	let { children } = $props();
</script>

<svelte:head>
	<title>La camiseta no se mancha</title>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="bg-base-100">
	{@render children()}
	<Footer />
</div>
