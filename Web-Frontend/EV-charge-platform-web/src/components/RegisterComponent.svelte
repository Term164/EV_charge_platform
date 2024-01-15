<script>
	
	import { store } from '../hooks/auth';
	import Input from './Input.svelte';
	import Button from './Button.svelte';
	import A from './A.svelte';

	let username = '';
	let email = '';
	let password = '';
	let password_confirm = '';
	let error = ''
	

	async function handleLogin() {
        if ( username.trim() === "" || password.trim() === "" ) {
			console.log("empty - error");
			error = 'Prosim izpolnite vsa polja.'
			return 0;
		}
		
		console.log("Good");
		return 1;
        
	}
	
</script>

<div class="flex flex-col items-center justify-center ">
	
		<img class="m-2 scale-50" src='/logo/Charge-Mate-Logo.png' alt='Logo'/>
	
	<h1 class="mb-4 text-5xl font-bold">Ustvarite račun</h1>

<form on:submit|preventDefault={handleLogin} class="flex flex-col items-center justify-center">
	<Input placeholder="Uporabniško ime" bind:value={username} type="text"/>	
	<Input placeholder="E-pošta" bind:value={email} type="password" />	
	<Input placeholder="Geslo" bind:value={password} type="password" />	
	<Input placeholder="Potrdite geslo" bind:value={password_confirm} type="password" />	
	<Button>Registracija</Button>
	
	<div id="error_message" class="text-danger">
		<p class="text-danger">{error}</p>
	</div>

</form>

<div class="flex flex-row ">
	<p class="">Že imate račun?</p>
	<A href="/login">Prijavite se</A>
</div>


</div>



