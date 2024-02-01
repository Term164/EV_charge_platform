<script>
    export let isLoading;
    export let type;
    export let customClass = '';

    if (isLoading == null)
        isLoading = false;
</script>

{#if type == 'blue'}
<button disabled={isLoading} on:click class="btn btn-primary text-white bg-blue-500 border-2 focus:outline-none hover:bg-blue-600 rounded-lg text-xl {customClass}">
    <slot />
</button>
{:else if type == 'green'}
<button disabled={isLoading} on:click class="btn btn-primary text-white bg-green-500 border-2 focus:outline-none hover:bg-green-600 rounded-lg text-xl {customClass}">
    <slot />
</button>
{:else if type == 'orange'}
<button disabled={isLoading} on:click class="btn btn-primary text-white bg-orange-400 border-2 focus:outline-none hover:bg-orange-500 rounded-lg text-xl {customClass}">
    <slot />
</button>
{:else if type == 'red'}
<button disabled={isLoading} on:click class="btn btn-primary text-white bg-red-500 border-2 focus:outline-none hover:bg-red-600 rounded-lg text-xl {customClass}">
    <slot />
</button>
{/if}