export type PickState = 'overview' | 'pick';

export type PickConfig = {
	interactive: boolean;
};

export const configurations: Record<PickState, PickConfig> = {
	overview: { interactive: false },
	pick: { interactive: true }
};
