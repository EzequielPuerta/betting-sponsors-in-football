import type { ImpactLabel, PickLabel } from '$lib/types/match';

export const IMPACT_COLORS: Record<ImpactLabel, string> = {
	Ninguno: 'var(--impact-0)',
	'Uno de los dos': 'var(--impact-05)',
	'Los dos': 'var(--impact-1)'
};

export const PICK_COLORS: Record<PickLabel, string> = {
	Resto: 'var(--match-plain)',
	Elegido: 'var(--match-picked)'
};

export const ACCENT_COLOR = 'var(--color-primary)';
export const INK_COLOR = 'var(--color-base-content)';

/** Aclara un color mezclandolo con blanco (el brillo de la barra sobre la que esta el mouse). */
export const brighten = (color: string, amount = 0.1) =>
	`color-mix(in srgb, ${color} ${Math.round((1 - amount) * 100)}%, white)`;
