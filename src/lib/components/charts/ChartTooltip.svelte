<script lang="ts">
	import TooltipBox from './TooltipBox.svelte';

	export type TooltipEntry = {
		label: string;
		value: string;
		color?: string;
	};

	let {
		title,
		entries,
		footer
	}: {
		title: string;
		entries: TooltipEntry[];
		footer?: string;
	} = $props();
</script>

<TooltipBox {title} {footer}>
	<ul class="flex flex-col gap-1 px-3 py-2">
		{#each entries as entry (entry.label)}
			<li class="flex items-center justify-between gap-3 text-sm">
				<span class="flex items-center gap-1.5">
					{#if entry.color}
						<span class="inline-block size-2.5 shrink-0" style:background-color={entry.color}
						></span>
					{/if}
					{entry.label}
				</span>
				<span class="font-bold tabular-nums">{entry.value}</span>
			</li>
		{/each}
	</ul>
</TooltipBox>
