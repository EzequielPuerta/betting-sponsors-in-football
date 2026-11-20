import type { Match } from '$lib/types/match';

/** Fechas del torneo presentes en los partidos, ordenadas. */
export const rounds = (matches: Match[]) =>
	[...new Set(matches.map((m) => m.round))].sort((a, b) => a - b);
