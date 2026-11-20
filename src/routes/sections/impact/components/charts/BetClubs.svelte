<script lang="ts">
	import { base } from '$app/paths';
	import type { SponsorRow, Team } from '$lib/types/match';

	let {
		width,
		height,
		teams,
		sponsors
	}: {
		width: number;
		height: number;
		teams: Team[];
		sponsors: SponsorRow[];
	} = $props();

	/** Los clubes con casa de apuestas, con la marca y la zona de la camiseta donde aparece */
	const clubs = $derived(
		teams
			.filter((team) => team.betBrands.length > 0)
			.map((team) => ({
				team,
				brands: team.betBrands.map((b) => ({
					name: b.name,
					regions: sponsors
						.filter((s) => s.teamId === team.id && s.sponsor === b.name)
						.map((s) => s.region.replace('_', ' '))
				}))
			}))
	);

	const narrow = $derived(width < 560);
</script>

<div
	class="grid content-center gap-3 overflow-auto"
	style:width="{width}px"
	style:height="{height}px"
	style:grid-template-columns="repeat({narrow ? 2 : 5}, minmax(0, 1fr))"
>
	{#each clubs as { team, brands } (team.id)}
		<article
			class="flex flex-col items-center gap-1.5 border border-base-300 bg-base-100 p-2 font-sans"
		>
			<img
				src="{base}/{team.kit}"
				alt="Camiseta de {team.name}"
				class="aspect-square w-full object-contain"
			/>
			<div class="flex items-center gap-1.5">
				<img src="{base}/{team.crest}" alt="" class="size-5 object-contain" />
				<span class="text-xs leading-tight font-semibold">{team.name}</span>
			</div>
			{#each brands as brand (brand.name)}
				<span class="bg-primary px-2 py-0.5 text-xs font-bold text-primary-content"
					>{brand.name}</span
				>
				<span class="text-[11px] text-base-content/60">{brand.regions.join(', ') || 'pecho'}</span>
			{/each}
		</article>
	{/each}
</div>
