<script lang="ts">
	import { base } from '$app/paths';
	import { MAX_PICKS } from '$lib/constants/picks';
	import { clearPicks, fillRandomPicks, pickedMatches, removePick } from '$lib/stores/picks';
</script>

<div class="flex flex-col gap-1.5 font-sans text-sm">
	{#each Array.from({ length: MAX_PICKS }, (_, i) => $pickedMatches[i]) as match, i (i)}
		{#if match}
			<div class="flex items-center gap-1.5 border border-base-300 bg-base-100 py-1 pr-1 pl-2">
				<span class="w-6 shrink-0 text-xs font-bold text-primary">F{match.round}</span>
				<img src="{base}/{match.home.crest}" alt="" class="size-5 shrink-0 object-contain" />
				<span class="min-w-0 flex-1 truncate font-semibold">
					{match.home.name} <span class="tabular-nums">{match.home.goals}–{match.away.goals}</span>
					{match.away.name}
				</span>
				<img src="{base}/{match.away.crest}" alt="" class="size-5 shrink-0 object-contain" />
				<button
					type="button"
					class="px-1.5 text-lg leading-none text-base-content/50 hover:text-primary"
					aria-label="Sacar este partido"
					onclick={() => removePick(match.id)}>×</button
				>
			</div>
		{:else}
			<div class="border border-dashed border-base-300 px-2 py-1.5 text-xs text-base-content/40">
				{i + 1} · sin elegir
			</div>
		{/if}
	{/each}

	<div class="mt-1 flex gap-2">
		<button
			type="button"
			class="btn btn-primary btn-sm"
			onclick={fillRandomPicks}
			disabled={$pickedMatches.length >= MAX_PICKS}
		>
			Elegir al azar
		</button>
		<button
			type="button"
			class="btn btn-ghost btn-sm"
			onclick={clearPicks}
			disabled={$pickedMatches.length === 0}
		>
			Borrar
		</button>
	</div>
</div>
