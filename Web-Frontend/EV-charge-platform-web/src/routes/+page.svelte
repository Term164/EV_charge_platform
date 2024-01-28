<script>
	import { setRoleAndUserProfile } from '$lib';
	import { onMount } from 'svelte';
    import { accountRole, accountID, accountUsername } from '../store';

    let isLoading = true;

    onMount(async () => {
        await setRoleAndUserProfile();
        isLoading = false;
    });

</script>

<div class="flex flex-col justify-center text-center align-middle">

<h1 class="text-4xl font-bold m-4">
    Pozdravljeni{$accountUsername ? ', '+$accountUsername: ''}
</h1>

<p class="text-lg">Vaša vloga je:
{#if $accountRole.includes('padmin')}Administrator Platforme{/if}
{#if $accountRole.includes('badmin')}Administrator Stavbe{/if}
{#if $accountRole.includes('cadmin')}Administrator Podjetja{/if}
{#if $accountRole.length==0}Končni Uporabnik{/if}
</p>


</div>