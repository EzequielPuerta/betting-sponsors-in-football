import { browser } from '$app/environment';
import { derived, readable } from 'svelte/store';

type Viewport = { width: number; height: number };

const viewport = readable<Viewport>({ width: 0, height: 0 }, (set) => {
	if (!browser) return;

	let raf = 0;
	let lastWidth = -1;
	let lastHeight = -1;

	const flush = () => {
		raf = 0;
		const width = window.innerWidth;
		const height = window.innerHeight;
		if (width === lastWidth && height === lastHeight) return;
		lastWidth = width;
		lastHeight = height;
		set({ width, height });
	};

	const schedule = () => {
		if (raf) return;
		raf = requestAnimationFrame(flush);
	};

	flush();
	window.addEventListener('resize', schedule);

	return () => {
		window.removeEventListener('resize', schedule);
		if (raf) cancelAnimationFrame(raf);
	};
});

export const isMobile = derived(viewport, ($viewport) => $viewport.width < 768);

export const isTablet = derived(
	viewport,
	($viewport) => $viewport.width >= 768 && $viewport.width < 1024
);

export const isSmallDevice = derived(
	[isMobile, isTablet],
	([$isMobile, $isTablet]) => $isMobile || $isTablet
);
