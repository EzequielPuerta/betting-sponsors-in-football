import type { Industries } from '$lib/types/industry';
import type { Match, SponsorRow, Team } from '$lib/types/match';
import { seasonRegistry } from './season';

export const dataRegistry = {
	...seasonRegistry
};

export type DataKey = keyof typeof dataRegistry;

/** Filas que devuelve cada entrada del registry una vez cargada. */
type DataMap = {
	matches: Match[];
	teams: Team[];
	sponsors: SponsorRow[];
	industries: Industries;
};

export type DataResult<K extends DataKey> = DataMap[K];
