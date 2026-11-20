import type { Industries } from '$lib/types/industry';
import type { Match, SponsorRow, Team } from '$lib/types/match';
import type { CsvEntry, JsonEntry } from '$lib/types/registry';

export const seasonRegistry = {
	matches: {
		type: 'json',
		path: 'data/matches.json'
	} satisfies JsonEntry<Match[]>,
	teams: {
		type: 'json',
		path: 'data/teams.json'
	} satisfies JsonEntry<Team[]>,
	industries: {
		type: 'json',
		path: 'data/industries.json'
	} satisfies JsonEntry<Industries>,
	sponsors: {
		type: 'csv',
		path: 'data/sponsors.csv',
		parse: (d: Record<string, string>): SponsorRow => ({
			teamId: d.team_id,
			team: d.team,
			sponsor: d.sponsor,
			industry: d.industry,
			region: d.region,
			isMain: d.is_main === 'true',
			isBet: d.is_bet === 'true'
		})
	} satisfies CsvEntry<SponsorRow>
};
