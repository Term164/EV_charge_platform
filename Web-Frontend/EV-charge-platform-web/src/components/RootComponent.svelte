<script>
import { setRoleAndUserProfile } from '$lib';
import { accountRole, accountUsername } from "../store";
console.log("now i, root component, shall call setRole");
const promise = setRoleAndUserProfile();
</script>

{#await promise}
    <script>console.log("Waiting from root");</script>
{:then _}
    <script>console.log("Root rendering");</script>

<div class="flex flex-col justify-center text-center align-middle">

<h1 class="text-4xl font-bold m-4">
    Pozdravljeni{$accountUsername ? ', '+$accountUsername: ''}
</h1>

<p class="text-xl">Vaša vloga je:
{#if $accountRole.includes('padmin')}
<p class="text-2xl m-3">Administrator Platforme</p>
<!-- Content -->
{/if}
{#if $accountRole.includes('badmin')}
<p class="text-2xl m-3">Administrator Stavbe</p>
<!-- Content -->
{/if}
{#if $accountRole.includes('cadmin')}
<p class="text-2xl m-3">Administrator Podjetja</p>
<!-- Content -->
{/if}
{#if $accountRole.length == 0}
<p class="text-2xl m-3">Končni Uporabnik</p>
<p class="mt-2">Počakajte, da vam vaš administrator podjetja dodeli dostope.</p>
<p>Za dejansko uporabo platforme, naložite in uporabljajte mobilno aplikacijo.</p>
{/if}
</p>

</div>

{/await}
