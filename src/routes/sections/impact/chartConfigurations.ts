import type { ImpactView } from './components/ImpactViews.svelte';

export type ImpactState = 'all' | 'impact' | 'bars' | 'line' | 'clubs' | 'industries';

export type ImpactConfig = {
	view: ImpactView;
};

export const configurations: Record<ImpactState, ImpactConfig> = {
	all: { view: 'scatter-plain' },
	impact: { view: 'scatter-impact' },
	bars: { view: 'bars' },
	line: { view: 'line' },
	clubs: { view: 'clubs' },
	industries: { view: 'industries' }
};
