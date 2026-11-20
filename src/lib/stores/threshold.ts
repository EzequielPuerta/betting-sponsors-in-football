import { writable } from 'svelte/store';
import type { ThresholdConfig } from '@fundar/data-scrolly-telling';

export const threshold = writable<ThresholdConfig>({
	type: 'percentage',
	value: 60
});
