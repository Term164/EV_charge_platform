<script>
import { goto } from '$app/navigation';
export let title;
export let text;
export let link;
</script>

<div class="flex-col w-80 min-h-48 border-2 px-2 py-3 rounded-lg cursor-pointer bg-blue-200 hover:bg-blue-300 transition-colors duration-300" on:click={() => goto(link)}>
    <h1 class="text-3xl m-2 mb-4">{title}</h1>
    <p>{text}</p>
</div>