import type { BetImpact, ImpactLabel } from '$lib/types/match';

export const IMPACT_LEVELS: BetImpact[] = [0, 0.5, 1];

export const IMPACT_LABELS: Record<BetImpact, ImpactLabel> = {
	0: 'Ninguno',
	0.5: 'Uno de los dos',
	1: 'Los dos'
};

/** Orden en que se apilan las barras y se listan las leyendas */
export const IMPACT_ORDER: ImpactLabel[] = ['Ninguno', 'Uno de los dos', 'Los dos'];

export const IMPACT_VALUES: Record<ImpactLabel, BetImpact> = {
	Ninguno: 0,
	'Uno de los dos': 0.5,
	'Los dos': 1
};
