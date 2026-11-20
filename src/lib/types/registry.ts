export type JsonEntry<T> = {
	type: 'json';
	path: string;
	/** Pasa el JSON crudo a las filas que usa la app. */
	parse?: (raw: unknown) => T;
};

export type CsvEntry<T> = {
	type: 'csv';
	path: string;
	/** Pasa una fila del CSV (todo texto) a la fila que usa la app. */
	parse: (row: Record<string, string>) => T;
};

export type RegistryEntry = JsonEntry<unknown> | CsvEntry<unknown>;

export type RegistryEntries = Record<string, RegistryEntry>;
