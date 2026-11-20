<script lang="ts">
	import { base } from '$app/paths';
	import type { Team } from '$lib/types/match';

	let { team }: { team: Team } = $props();
</script>

<div class="flex flex-col items-center gap-2">
	<img
		src="{base}/{team.kit}"
		alt="Camiseta de {team.name}"
		class="aspect-square w-full object-contain"
		loading="lazy"
	/>
	<ul class="flex min-h-8 flex-wrap justify-center gap-1 text-xs leading-snug">
		{#each team.sponsors as sponsor (sponsor.name)}
			<li
				class="border px-1.5 py-0.5"
				class:border-primary={sponsor.isBet}
				class:bg-primary={sponsor.isBet}
				class:text-primary-content={sponsor.isBet}
				class:font-bold={sponsor.isBet}
				class:border-base-300={!sponsor.isBet}
			>
				{sponsor.name}
			</li>
		{:else}
			<li class="text-base-content/50">Sin sponsors detectados</li>
		{/each}
	</ul>
</div>
