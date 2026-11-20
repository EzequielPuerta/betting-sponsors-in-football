<script lang="ts">
	import { onMount } from 'svelte';
	import VideoStage, { type VideoMode } from './components/VideoStage.svelte';

	type Step = {
		kicker?: string;
		text: string;
		/** Donde se pone el texto: abajo (el video se sigue viendo) o al centro (sobre el video quieto) */
		place: 'bottom' | 'center';
		/** Cuanto se oscurece el video detras del texto (0 a 1) */
		dim: number;
	};

	// Mientras el video se reproduce solo (el scroll no hace nada), los textos pasan segun el segundo del video.
	const TIMED: (Step & { at: number })[] = [
		{
			at: 0,
			kicker: 'Publicidad de BetWarrior',
			text: 'En pleno Mundial 2026, una casa de apuestas lanzó esta publicidad en Argentina...',
			place: 'bottom',
			dim: 0
		},
		{
			at: 2.5,
			text: '...en medio del debate por la creciente ludopatía.',
			place: 'bottom',
			dim: 0
		},
		{ at: 5.5, text: 'La voz suena como la de Diego Maradona', place: 'bottom', dim: 0 },
		{ at: 8, text: 'quién murió en noviembre de 2020.', place: 'bottom', dim: 0 }
	];

	// Despues del corte, el scroll avanza el relato: cada paso arranca en un punto del recorrido (0 a 1).
	const SCROLLED: (Step & { at: number })[] = [
		{
			at: 0,
			kicker: 'Paremos la pelota',
			text: 'Su imagen y su voz fueron recreadas con inteligencia artificial con fines publicitarios.',
			place: 'center',
			dim: 0.45
		},
		{
			at: 0.2,
			text: 'En medio de fuertes críticas, se reveló que la familia lo había autorizado.',
			place: 'center',
			dim: 0.45
		},
		// el video sigue hasta que Maradona termina de hablar
		{ at: 0.45, text: '', place: 'center', dim: 0 }
	];
	// Aparece sola cuando el video termina, sin scroll.
	const FINAL: Step = {
		kicker: 'Hasta dónde llegan las casas de apuestas',
		text: '¿Qué ocurre en el fútbol de todos los días?',
		place: 'center',
		dim: 0.8
	};
	const RESUME_STEP = 2;
	const STEPS: Step[] = [...TIMED, ...SCROLLED, FINAL];

	let section = $state<HTMLElement>();
	let progress = $state(0);
	let muted = $state(true);
	let time = $state(0);
	let entered = $state(false); // la seccion llego a la pantalla: arranca el video
	let cutReached = $state(false); // el video llego al corte: se puede seguir bajando
	let ended = $state(false); // el video termino

	const timedStep = $derived(TIMED.findLastIndex((s) => time >= s.at));
	const scrolledStep = $derived(SCROLLED.findLastIndex((s) => progress >= s.at));
	const finalShown = $derived(ended && scrolledStep >= RESUME_STEP);
	const active = $derived(
		finalShown
			? STEPS.length - 1
			: cutReached
				? TIMED.length + Math.max(scrolledStep, 0)
				: timedStep
	);
	const mode = $derived<VideoMode>(
		!entered ? 'idle' : !cutReached ? 'intro' : scrolledStep >= RESUME_STEP ? 'resume' : 'frozen'
	);
	// el scroll no hace nada mientras el video se reproduce solo: al inicio y despues de reanudarlo
	const locked = $derived(entered && (!cutReached || (mode === 'resume' && !ended)));

	const _top = () => (section?.getBoundingClientRect().top ?? 0) + window.scrollY;

	onMount(() => {
		const update = () => {
			if (!section) return;
			const rect = section.getBoundingClientRect();
			if (!entered && rect.top <= 0) entered = true;
			const total = rect.height - window.innerHeight;
			progress = Math.min(1, Math.max(0, -rect.top / total));
		};
		update();
		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		return () => {
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	});

	// Mientras el video se reproduce solo, el scroll no hace nada.
	$effect(() => {
		if (!locked) return;
		// al inicio se queda donde empieza la seccion; al reanudar, donde esta el lector
		const y = cutReached ? window.scrollY : _top();
		window.scrollTo(0, y);
		const keep = () => {
			if (Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y);
		};
		const stop = (event: Event) => event.preventDefault();
		const stopKeys = (event: KeyboardEvent) => {
			if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'End', 'Home', ' '].includes(event.key))
				event.preventDefault();
		};
		window.addEventListener('scroll', keep);
		window.addEventListener('wheel', stop, { passive: false });
		window.addEventListener('touchmove', stop, { passive: false });
		window.addEventListener('keydown', stopKeys);
		return () => {
			window.removeEventListener('scroll', keep);
			window.removeEventListener('wheel', stop);
			window.removeEventListener('touchmove', stop);
			window.removeEventListener('keydown', stopKeys);
		};
	});
</script>

<section bind:this={section} class="relative h-[300dvh]" aria-label="La publicidad con Maradona">
	<div class="sticky top-0 h-dvh overflow-hidden bg-black text-white">
		<VideoStage
			{mode}
			{muted}
			bind:time
			oncut={() => (cutReached = true)}
			onend={() => (ended = true)}
		/>

		<!-- oscurece el video cuando hay texto -->
		<div
			class="pointer-events-none absolute inset-0 bg-black transition-opacity duration-700"
			style:opacity={STEPS[active]?.dim ?? 0}
		></div>
		<div
			class="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/80 to-transparent transition-opacity duration-700"
			class:opacity-0={STEPS[active]?.place !== 'bottom'}
		></div>

		{#each STEPS as s, i (i)}
			<div
				class="pointer-events-none absolute inset-0 flex flex-col items-center gap-4 px-6 text-center transition-opacity duration-700"
				class:justify-center={s.place === 'center'}
				class:justify-end={s.place === 'bottom'}
				class:pb-24={s.place === 'bottom'}
				class:opacity-0={active !== i}
				aria-hidden={active !== i}
			>
				{#if s.kicker}
					<span class="kicker text-primary">{s.kicker}</span>
				{/if}
				{#if s.text}
					<p
						class="max-w-3xl font-serif leading-tight font-semibold {s.place === 'bottom'
							? 'text-2xl md:text-4xl'
							: 'text-3xl md:text-5xl'}"
					>
						{s.text}
					</p>
				{/if}
			</div>
		{/each}

		{#if cutReached && (active === TIMED.length || finalShown)}
			<div
				class="pointer-events-none absolute inset-x-0 bottom-6 flex animate-bounce justify-center font-sans text-sm text-white/70"
			>
				Seguí bajando ↓
			</div>
		{/if}

		<button
			type="button"
			class="btn absolute top-4 right-4 z-20 min-w-40 touch-manipulation border-white/30 bg-black/50 text-white btn-sm hover:bg-black/70"
			class:animate-pulse={muted && !cutReached}
			onclick={() => (muted = !muted)}
		>
			{muted ? '🔇 Activar sonido' : '🔊 Silenciar'}
		</button>
	</div>
</section>
