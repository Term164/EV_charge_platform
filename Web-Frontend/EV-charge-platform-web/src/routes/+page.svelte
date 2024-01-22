<script>
	import { getRoleOfUser, getUserProfile } from '$lib';
	import { onMount } from 'svelte';
    import {accountRole} from '../store';

	import { Circle2 } from 'svelte-loading-spinners';

    let username;
    let isLoading = true;

    onMount(async () => {
        const result = await getUserProfile();
        username = result.data.username;
        
        await getRoleOfUser();
        isLoading = false;
    });

</script>

<div class="flex flex-col justify-center text-center align-middle">

<h1 class="text-4xl font-bold m-4">
    Pozdravljeni{username ? ', '+username : ''}
</h1>

<p class="text-lg">Vaša vloga je:
{#if $accountRole == 'padmin'}
    Administrator Platforme
{:else if $accountRole == 'badmin'}
    Administrator Stavbe
{:else if $accountRole == 'cadmin'}
    Administrator Podjetja
{:else}
    Končni Uporabnik
{/if}
</p>


</div>