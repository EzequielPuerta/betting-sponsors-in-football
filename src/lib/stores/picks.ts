import { derived, get, writable } from 'svelte/store';
import { MAX_PICKS } from '$lib/constants/picks';
import { dataStore } from './dataStore';

/** Ids de los partidos elegidos por el lector, en el orden en que los eligio. */
const _picked = writable<string[]>([]);

export const pickedIds = { subscribe: _picked.subscribe };

export const pickedMatches = derived([_picked, dataStore], ([$ids, $data]) =>
	$ids.flatMap((id) => $data.matches?.find((m) => m.id === id) ?? [])
);

export function togglePick(id: string) {
	_picked.update((ids) => {
		if (ids.includes(id)) return ids.filter((x) => x !== id);
		return ids.length >= MAX_PICKS ? ids : [...ids, id];
	});
}

export function removePick(id: string) {
	_picked.update((ids) => ids.filter((x) => x !== id));
}

export function clearPicks() {
	_picked.set([]);
}

/** Completa con partidos al azar hasta llegar a MAX_PICKS. */
export function fillRandomPicks() {
	const matches = get(dataStore).matches ?? [];
	_picked.update((ids) => {
		const pool = matches.map((m) => m.id).filter((id) => !ids.includes(id));
		const next = [...ids];
		while (next.length < MAX_PICKS && pool.length > 0) {
			next.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
		}
		return next;
	});
}
