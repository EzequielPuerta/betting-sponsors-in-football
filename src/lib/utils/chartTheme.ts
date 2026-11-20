import type { PlotStylesConfigInput } from '@fundar/data-chart-telling';
import { IMPACT_COLORS, PICK_COLORS } from '$lib/constants/colors';

/** Lee una variable CSS del tema activo. */
function _css(name: string, fallback: string): string {
	if (typeof document === 'undefined') return fallback;
	return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/**
 * Configuracion global de la libreria de graficos a partir del tema activo: texto, fondo, ejes, tooltips
 * y paleta salen de las mismas variables CSS que usa el resto de la pagina.
 */
export function chartConfiguration(mobile: boolean): PlotStylesConfigInput {
	const ink = _css('--color-base-content', '#1a1a1a');
	const background = _css('--color-base-100', '#ffffff');
	const line = _css('--color-base-300', '#dcdcdc');
	const muted = `color-mix(in srgb, ${ink} 65%, transparent)`;

	return {
		font: '"Source Sans 3", system-ui, sans-serif',
		color: ink,
		background,
		spacing: { bleed: '3px' },
		numbers: { decimals: 1 },
		divider: { color: line },
		title: { size: mobile ? '1.1rem' : '1.4rem' },
		subtitle: { size: mobile ? '0.8rem' : '0.95rem', color: muted },
		caption: { color: muted },
		legend: {
			color: ink,
			swatchSize: mobile ? '0.7rem' : '0.9rem',
			icon: { rounded: true }
		},
		palette: [
			PICK_COLORS.Resto,
			IMPACT_COLORS['Uno de los dos'],
			IMPACT_COLORS['Los dos'],
			IMPACT_COLORS.Ninguno
		],
		axis: { color: muted },
		tooltip: { background, color: ink },
		hover: { rule: { stroke: muted } }
	};
}
