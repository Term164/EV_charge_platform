<script>
import { accountID, accountUsername, accountRole } from './../store.js';
import { goto } from '$app/navigation';
import { login } from '$lib';
import Input from './Input.svelte';
import Button from './Button.svelte';
import A from './A.svelte';
import { SvelteEasyToast, toast } from 'svelte-easy-toast';

const showErrorToast = (message) => {
	toast({
	type: 'error', // primary, dark, danger, success, info, warning, default, error
	position: 'top-center', // top-right top-left, top-center, bottom-left, bottom-right, bottom-center
	text: message,
	title: 'Napaka',
	});
}
const showGeneralErrorToast = () => {
	toast({
	type: 'error', // primary, dark, danger, success, info, warning, default, error
	position: 'top-center', // top-right top-left, top-center, bottom-left, bottom-right, bottom-center
	text: 'Poskusite kasneje',
	title: 'Neznana napaka',
	});
}
const showSuccessToast = (message) => {
	toast({
	type: 'success', // primary, dark, danger, success, info, warning, default, error
	position: 'top-center', // top-right top-left, top-center, bottom-left, bottom-right, bottom-center
	text: message,
	title: 'Uspeh'
	});
}

accountID.set(-1);
accountRole.set(null);
accountUsername.set('');

let username = '';
let password = '';

let isLoading = false;

async function handleLogin() {
	if (username.trim() === "" || password.trim() === "") {
		showErrorToast("Izpolnite vsa polja");
		return;
	}

	isLoading = true;
	const status = await login(username, password);
	isLoading = false;
	
	if (status == 200)
		goto('/');
	else if (status == 400)
		showErrorToast('Napačno uporabniško ime ali geslo');
	else
		showGeneralErrorToast();
	username, password = '';
}

</script>

<SvelteEasyToast />  

<div class="flex flex-col items-center justify-center ">
	<img class="scale-75" src='/logo/Charge-Mate-Logo.png' alt='Logo'/>
	<h1 class="-mt-16 text-5xl font-bold">Dobrodošli nazaj</h1>
	<p class='mb-4 text-gray-500 text-lg'>Prijavite se za nadaljevanje</p>

<form on:submit|preventDefault={handleLogin} class="flex flex-col items-center justify-center">
	<Input placeholder="Uporabniško ime ali e-pošta" bind:value={username} type="text"/>	
	<Input placeholder="Geslo" bind:value={password} type="password" />	
	<Button isLoading='{isLoading}' type='blue' customClass='px-4 py-2 m-6 w-56'>
		{isLoading ? 'Prijavljanje...' : 'Prijava'}
	</Button>
</form>

<div class="flex flex-row">
	<p class="">Še nimate računa?</p>
	<A href="/register">Registrirajte se</A>
</div>

</div>



