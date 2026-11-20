import { DODGE_STEP, JITTER_AMOUNT } from '$lib/constants/chart';
import { IMPACT_LABELS } from '$lib/constants/impact';
import type { Match, MatchPoint, PickLabel } from '$lib/types/match';

/** Generador pseudoaleatorio con semilla: el grafico se ve igual en cada visita. */
function _mulberry32(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function _hash(text: string) {
	let h = 2166136261;
	for (const char of text) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
	return h >>> 0;
}

/**
 * Posicion horizontal de cada partido dentro de su fecha: los que arrancan a la misma hora se reparten
 * parejo (dodge) y a todos se les suma un poco de azar (jitter) para que no queden en fila.
 */
export function toPoints(matches: Match[], picked: ReadonlySet<string> = new Set()): MatchPoint[] {
	const byRoundAndTime = new Map<string, Match[]>();
	for (const match of matches) {
		const key = `${match.round}|${match.time}`;
		byRoundAndTime.set(key, [...(byRoundAndTime.get(key) ?? []), match]);
	}

	const offsets = new Map<string, number>();
	for (const group of byRoundAndTime.values()) {
		group.forEach((match, i) => offsets.set(match.id, (i - (group.length - 1) / 2) * DODGE_STEP));
	}

	return matches.map((match) => {
		const random = _mulberry32(_hash(match.id))();
		const jitter = (random - 0.5) * 2 * JITTER_AMOUNT;
		const pick: PickLabel = picked.has(match.id) ? 'Elegido' : 'Resto';
		return {
			...match,
			x: match.round + (offsets.get(match.id) ?? 0) + jitter,
			impact: IMPACT_LABELS[match.betImpact],
			pick
		};
	});
}
