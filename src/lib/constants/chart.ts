/** Eje vertical: de las 13 a las 23 (hay partidos desde las 13:30 hasta las 22:00) */
export const HOUR_DOMAIN: [number, number] = [13, 23];
export const HOUR_TICKS = [14, 16, 18, 20, 22];

/** Goles de un partido: 0 a 7 (el tamaño del punto sale de este rango) */
export const GOALS_DOMAIN: [number, number] = [0, 7];
export const DOT_RADIUS_RANGE: [number, number] = [2.5, 10];

/** Cuanto se separan horizontalmente los partidos de una misma fecha (en unidades de fecha) */
export const DODGE_STEP = 0.2;
export const JITTER_AMOUNT = 0.09;
