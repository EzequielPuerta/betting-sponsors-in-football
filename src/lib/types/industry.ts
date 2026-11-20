import type { Team } from '$lib/types/match';

export type IndustryClub = {
	team: Pick<Team, 'id' | 'name' | 'crest'>;
	/** Sponsor principal (null si no tiene) */
	sponsor: string | null;
	industry: string;
	isBet: boolean;
};

export type IndustryGroup = {
	/** Nombre en el grafico ("Otros" junta las industrias con un solo club) */
	label: string;
	isBet: boolean;
	clubs: IndustryClub[];
};

/** Sponsor principal de cada club agrupado por industria (se arma en scripts/build_data.py) */
export type Industries = {
	/** Clubes por industria, de mayor a menor */
	counts: { industry: string; clubs: number }[];
	/** Grupos en el orden en que se dibujan en la rueda */
	groups: IndustryGroup[];
};
