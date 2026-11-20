/** Nivel de impacto de sponsors de casas de apuestas online de un partido. */
export type BetImpact = 0 | 0.5 | 1;

export type MatchSide = {
	id: string;
	name: string;
	/** Ruta relativa a la carpeta estatica */
	crest: string;
	goals: number;
};

export type Match = {
	id: string;
	/** Numero de fecha del torneo (1 a 16) */
	round: number;
	/** AAAA-MM-DD, hora de Argentina */
	date: string;
	weekday: string;
	/** HH:MM */
	time: string;
	/** Hora de inicio en decimal (21.25 = 21:15) */
	hour: number;
	venue: string | null;
	city: string | null;
	home: MatchSide;
	away: MatchSide;
	goals: number;
	/**
	 * 0: ningun equipo con casa de apuestas en la camiseta
	 * 0.5: uno
	 * 1: los dos
	 * */
	betImpact: BetImpact;
	/** Marcas de casas de apuestas que se ven entre las dos camisetas */
	betBrands: number;
};

/** Un partido listo para dibujar: con la posicion horizontal ya separada (jitter / dodge). */
export type MatchPoint = Match & {
	x: number;
	impact: ImpactLabel;
	pick: PickLabel;
};

export type ImpactLabel = 'Ninguno' | 'Uno de los dos' | 'Los dos';
export type PickLabel = 'Elegido' | 'Resto';

export type Sponsor = {
	name: string;
	/** Industria de la marca (Finanzas, Apuestas Online...) */
	category: string | null;
	/** true si es una casa de apuestas: es lo que se destaca */
	isBet: boolean;
	/** Zonas de la camiseta donde se detecto: pecho, manga, etc. */
	regions: string[];
};

export type Team = {
	id: string;
	slug: string;
	name: string;
	officialName: string;
	crest: string;
	kit: string;
	manufacturer: string | null;
	sponsor: string | null;
	/** Todos los sponsors matcheados en la camiseta */
	sponsors: Sponsor[];
	/** Solo las casas de apuestas */
	betBrands: Sponsor[];
	/** Sponsor principal, el del pecho */
	mainSponsor: string | null;
};

export type RoundImpactRow = {
	round: number;
	impact: ImpactLabel;
	matches: number;
};

export type RoundAverageRow = {
	round: number;
	average: number;
};

/** Un sponsor detectado en la camiseta de un equipo (una fila de data/sponsors.csv). */
export type SponsorRow = {
	teamId: string;
	team: string;
	sponsor: string;
	/** Industria agrupada: las dos categorias de apuestas son "Apuestas" */
	industry: string;
	/** Zona de la camiseta: pecho, pecho_superior, manga... */
	region: string;
	/** Es el sponsor principal (el del pecho) */
	isMain: boolean;
	isBet: boolean;
};
