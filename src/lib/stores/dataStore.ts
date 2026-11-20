import { writable, derived } from 'svelte/store';
import { tick } from 'svelte';
import { csvParse } from 'd3-dsv';
import { base } from '$app/paths';
import { dataRegistry } from '$lib/registry';
import type { DataKey, DataResult } from '$lib/registry';
import type { RegistryEntry } from '$lib/types/registry';

type StoreData = Partial<{ [K in DataKey]: DataResult<K> }>;

// Los graficos se suscriben solo a este store: se escribe UNA vez, cuando terminaron todos los fetch.
const _data = writable<StoreData>({});
export const dataStore = { subscribe: _data.subscribe };

const _progress = writable({ loaded: 0, total: 0 });
const _allLoaded = writable(false);

export const loadingProgress = derived(_progress, ($p) =>
	$p.total === 0 ? 0 : Math.round(($p.loaded / $p.total) * 100)
);

export const isDataLoaded = derived(_allLoaded, ($v) => $v);

const FONTS_TO_LOAD = [
	'400 1em "Source Sans 3"',
	'700 1em "Source Sans 3"',
	'800 1em "Source Sans 3"',
	'400 1em "Source Serif 4"'
];

function preloadImage(src: string): Promise<void> {
	return new Promise((resolve) => {
		const img = new Image();
		const done = () => {
			_progress.update((p) => ({ ...p, loaded: p.loaded + 1 }));
			resolve();
		};
		img.onload = done;
		img.onerror = done;
		img.src = src;
	});
}

export async function loadAll(criticalImages: string[] = []) {
	const keys = Object.keys(dataRegistry) as DataKey[];
	// +1 por las fuentes, +n por las imagenes criticas
	_progress.set({ loaded: 0, total: keys.length + 1 + criticalImages.length });
	_allLoaded.set(false);

	const results: Record<string, unknown> = {};

	const dataPromises = keys.map(async (key) => {
		const entry: RegistryEntry = dataRegistry[key];
		const response = await fetch(`${base}/${entry.path}`);
		if (entry.type === 'csv') {
			results[key] = csvParse(
				await response.text(),
				(row) => entry.parse(row as Record<string, string>) as object
			);
		} else {
			const raw = await response.json();
			results[key] = entry.parse ? entry.parse(raw) : raw;
		}
		_progress.update((p) => ({ ...p, loaded: p.loaded + 1 }));
	});

	const fontPromise = Promise.all(FONTS_TO_LOAD.map((f) => document.fonts.load(f))).then(() =>
		_progress.update((p) => ({ ...p, loaded: p.loaded + 1 }))
	);

	await Promise.all([...dataPromises, fontPromise, ...criticalImages.map(preloadImage)]);
	await tick();
	_data.set(results as StoreData);
	_allLoaded.set(true);
}
