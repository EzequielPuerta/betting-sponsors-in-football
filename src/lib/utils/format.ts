import type { Match } from '$lib/types/match';

const number = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

export const formatNumber = (value: number) => number.format(value);
export const formatPercent = (ratio: number) => `${percent.format(ratio * 100)} %`;

export const formatHour = (hour: number) => `${hour}:00`;

/** "jueves 23 de julio" */
export function formatMatchDate(match: Pick<Match, 'date'>): string {
	const [year, month, day] = match.date.split('-').map(Number);
	return new Date(year, month - 1, day).toLocaleDateString('es-AR', {
		weekday: 'long',
		day: 'numeric',
		month: 'long'
	});
}

export const formatRound = (round: number) => `Fecha ${round}`;
