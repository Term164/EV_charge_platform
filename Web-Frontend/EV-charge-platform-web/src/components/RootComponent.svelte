<script>
import { setRoleAndUserProfile } from '$lib';
import { accountRole, accountUsername } from "../store";
import StartCardComponent from './StartCardComponent.svelte';
const promise = setRoleAndUserProfile();
</script>

{#await promise then _}

<div class="flex w-full flex-col justify-center items-center text-center align-middle">

<h1 class="text-4xl font-bold m-4">
    Pozdravljeni{$accountUsername ? ', '+$accountUsername: ''}
</h1>

<p class="text-xl">Vaša vloga je:
{#if $accountRole.includes('padmin')}
    <p class="text-2xl m-3">Administrator Platforme</p>
    <!-- Content -->
    <p class="mt-24 mb-8 text-2xl">Kje začeti?</p>
    <div class=" flex w-full justify-between gap-x-8">
        <StartCardComponent title='Stavbe' text='Preglej vse stavbe ter jih dodaj / uredi / zbriši.' link='/allBuildings'/>
        <StartCardComponent title='Podjetja' text='Preglej vsa podjetja ter jih dodaj / uredi / zbriši' link='/allCompanies'/>
        <StartCardComponent title='Administratorji' text='Uredi pravice vseh administratorjev, torej katera podjetja/stavbe imajo administratorji pravice upravljati.' link='/admins'/>
        <StartCardComponent title='Pregled Uporabnikov' text='Najdi pravega uporabnika ter jim dodeli pravice, torej administratorja katerega podjetja ali katere stavbe.' link='/users'/>
    </div>
{/if}
{#if $accountRole.includes('badmin')}
    <p class="text-2xl m-3">Administrator Stavbe</p>
    <!-- Content -->
    <p class="mt-24 mb-8 text-2xl">Kje začeti?</p>
    <div class=" flex w-full justify-between gap-x-8">
        <StartCardComponent title='Moje Stavbe' text='Preglej svoje stavbe, uredi podjetja, ki poslujejo v njih in dodaj/uredi električne polnilnice.' link='/buildings'/>
        <StartCardComponent title='Pregled Uporabnikov' text='Izmed uporabniki najdi tistega, ki ga boš nastavil za administratorja podjetja.' link='/users'/>
    </div>
{/if}
{#if $accountRole.includes('cadmin')}
    <p class="text-2xl m-3">Administrator Podjetja</p>
    <!-- Content -->
    <p class="mt-24 mb-8 text-2xl">Kje začeti?</p>
    <div class=" flex w-full justify-between gap-x-8">
        <StartCardComponent title='Moje Podjetje' text='Preglej svoje podjetje, v katerih stavbah posluje, predvsem pa dodeli dostop svojim zaposlenim do stavb ter uredi njihove RFID kode.' link='/company'/>
        <StartCardComponent title='Pregled Uporabnikov' text='Izmed uporabniki najdi svoje zaposlene in jih dodaj v podjetje.' link='/users'/>
    </div>
{/if}
{#if $accountRole.length == 0}
<p class="text-2xl m-3">Končni Uporabnik</p>
<p class="mt-2">Počakajte, da vam vaš administrator podjetja dodeli dostope.</p>
<p>Za dejansko uporabo platforme, naložite in uporabljajte mobilno aplikacijo.</p>
{/if}
</p>

</div>

{/await}
