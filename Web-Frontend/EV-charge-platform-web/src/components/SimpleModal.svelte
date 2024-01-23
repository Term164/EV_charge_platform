<script>
    export let show = false;
    //export let close;
    export let customClass='';
</script>

{#if show}
    <div class="fixed z-10 inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 ${customClass}">
        <div class="bg-white p-4 rounded" on:click|stopPropagation>
            <slot />
        </div>
    </div>
{/if}