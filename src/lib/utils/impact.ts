import { IMPACT_LABELS, IMPACT_ORDER } from '$lib/constants/impact';
import { rounds } from '$lib/utils/matches';
import type { Match, RoundAverageRow, RoundImpactRow } from '$lib/types/match';

export const meanImpact = (matches: Match[]) =>
	matches.length === 0 ? 0 : matches.reduce((sum, m) => sum + m.betImpact, 0) / matches.length;

export const countWithImpact = (matches: Match[], atLeast: number) =>
	matches.filter((m) => m.betImpact >= atLeast).length;

/** Cantidad de partidos con impacto 0, 0.5 y 1 en cada fecha (las barras apiladas). */
export function impactByRound(matches: Match[]): RoundImpactRow[] {
	return rounds(matches).flatMap((round) =>
		IMPACT_ORDER.map((impact) => ({
			round,
			impact,
			matches: matches.filter((m) => m.round === round && IMPACT_LABELS[m.betImpact] === impact)
				.length
		}))
	);
}

/** Promedio del indice de cada fecha (la linea). */
export function averageByRound(matches: Match[]): RoundAverageRow[] {
	return rounds(matches).map((round) => ({
		round,
		average: meanImpact(matches.filter((m) => m.round === round))
	}));
}
