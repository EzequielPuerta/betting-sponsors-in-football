<script lang="ts">
	import { onMount } from 'svelte';
	import { base } from '$app/paths';

	let {
		kicker,
		title,
		deck,
		byline,
		video
	}: {
		kicker: string;
		title: string;
		deck: string;
		byline?: string;
		/** Video de fondo (ruta dentro de static/), sin audio y en bucle */
		video?: string;
	} = $props();

	let player = $state<HTMLVideoElement>();

	// Siempre arranca solo y sin sonido. Si el navegador lo frena (algunos bloquean el autoplay),
	// se reintenta en el primer gesto del lector.
	onMount(() => {
		if (!player) return;
		player.muted = true;
		const start = () => void player?.play().catch(() => {});
		start();
		const gestures = ['pointerdown', 'touchstart', 'wheel', 'keydown', 'scroll'];
		const retry = () => {
			start();
			gestures.forEach((name) => window.removeEventListener(name, retry));
		};
		gestures.forEach((name) => window.addEventListener(name, retry, { passive: true }));
		return () => gestures.forEach((name) => window.removeEventListener(name, retry));
	});
</script>

<header class="relative isolate min-h-dvh overflow-hidden bg-black text-white">
	{#if video}
		<video
			bind:this={player}
			src="{base}/{video}"
			class="absolute inset-0 -z-20 size-full object-cover"
			autoplay
			muted
			loop
			playsinline
			disablepictureinpicture
			aria-hidden="true"
		></video>
		<!-- oscurece el video y funde el borde de abajo con la seccion que sigue -->
		<div class="absolute inset-0 -z-10 bg-black/60"></div>
		<div
			class="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-linear-to-t from-black to-transparent"
		></div>
	{/if}

	<div class="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-4 px-4 py-16">
		<span class="kicker">{kicker}</span>
		<h1 class="text-5xl leading-[1.02] text-white md:text-7xl">{title}</h1>
		<p class="prose-story max-w-2xl text-white/85 md:text-2xl">{deck}</p>
		{#if byline}
			<p class="border-t border-white/25 pt-3 font-sans text-sm text-white/65">{byline}</p>
		{/if}
	</div>
</header>
