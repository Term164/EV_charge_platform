<script>
    export let show = false;
    //export let close;
</script>

{#if show}
    <div class="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
        <div class="bg-white p-4 rounded" on:click|stopPropagation>
            <slot />
        </div>
    </div>
{/if}