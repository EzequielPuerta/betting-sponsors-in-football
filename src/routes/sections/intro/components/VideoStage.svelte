<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { base } from '$app/paths';

	export type VideoMode = 'idle' | 'intro' | 'frozen' | 'resume';

	let {
		mode,
		muted = true,
		time = $bindable(0),
		oncut,
		onend
	}: {
		/** idle: quieto al inicio. intro: se reproduce solo hasta el corte. frozen: quieto en el corte. resume: sigue hasta el final */
		mode: VideoMode;
		muted?: boolean;
		/** Segundo actual del video */
		time?: number;
		/** Se llama una vez, cuando el video llega al corte */
		oncut?: () => void;
		/** Se llama una vez, cuando el video llega al final (donde se corta) */
		onend?: () => void;
	} = $props();

	// Publicidad del Mundial 2026 con la imagen y la voz de Maradona recreadas con IA.
	// Esta en static/ porque el video de YouTube tiene restriccion de edad y no se puede embeber.
	const SRC = 'video/maradona-ad.mp4';
	const YOUTUBE_URL = 'https://www.youtube.com/watch?v=yv0NYRq2afI';
	const PAUSE_AT = 9.99;
	const END_AT = 11.95;

	let video = $state<HTMLVideoElement>();
	let failed = $state(false);

	// El video avanza en un solo sentido: cada tramo se reproduce una unica vez.
	// Si el lector vuelve para atras, queda quieto en el ultimo cuadro (no se relanza).
	let started = false; // ya se lanzo el primer tramo (0 -> corte)
	let firstPartDone = false; // llego al corte
	let resumed = false; // ya se lanzo el segundo tramo (corte -> final)
	let finished = false; // llego al final

	/** Lo deja quieto en `at`, sin relanzarlo */
	function _hold(at: number) {
		if (!video) return;
		video.pause();
		if (Math.abs(video.currentTime - at) > 0.3) video.currentTime = at;
	}

	function _play() {
		void video?.play().catch(() => {});
	}

	function _apply(current: VideoMode) {
		if (!video) return;
		if (current === 'resume') {
			resumed = true;
			if (finished) video.pause();
			else _play();
		} else if (resumed) {
			video.pause(); // no se vuelve a empezar: sigue desde donde quedo
		} else if (current === 'intro') {
			if (!started) {
				started = true;
				_play();
			}
		} else if (current === 'frozen') {
			_hold(PAUSE_AT);
		} else if (!started) {
			_hold(0);
		}
	}

	function _watch() {
		if (!video) return;
		time = video.currentTime;
		if (!resumed && !firstPartDone && video.currentTime >= PAUSE_AT) {
			firstPartDone = true;
			_hold(PAUSE_AT);
			oncut?.();
		}
		if (resumed && !finished && video.currentTime >= END_AT) {
			finished = true;
			video.pause();
			onend?.();
		}
	}

	// El sonido se cambia sobre la propiedad del elemento (el atributo `muted` solo vale como valor inicial)
	$effect(() => {
		const silent = muted;
		if (!video) return;
		video.muted = silent;
		if (!silent) video.volume = 1;
	});

	$effect(() => {
		const current = mode;
		if (video) untrack(() => _apply(current));
	});

	onMount(() => {
		const timer = setInterval(_watch, 50);
		return () => clearInterval(timer);
	});
</script>

<div class="absolute inset-0 overflow-hidden bg-black">
	<!-- sin controles: ni el scroll ni el lector pueden adelantarlo -->
	<video
		bind:this={video}
		src="{base}/{SRC}"
		class="size-full object-cover"
		muted
		playsinline
		disablepictureinpicture
		preload="auto"
		onerror={() => (failed = true)}
	></video>
	<!-- oscurece las esquinas: tapa el logo de la marca que aparece arriba a la izquierda -->
	<div class="vignette pointer-events-none absolute inset-0"></div>
	{#if failed}
		<div class="absolute inset-0 flex items-center justify-center">
			<a href={YOUTUBE_URL} class="btn btn-primary" target="_blank" rel="noopener">
				Ver el video en YouTube
			</a>
		</div>
	{/if}
</div>

<style>
	/* viñeta: el centro se ve entero y hacia las esquinas se va oscureciendo (ahi esta el logo de la marca) */
	.vignette {
		background: radial-gradient(
			ellipse at center,
			transparent 25%,
			rgb(0 0 0 / 0.7) 45%,
			rgb(0 0 0) 62%
		);
	}
</style>
