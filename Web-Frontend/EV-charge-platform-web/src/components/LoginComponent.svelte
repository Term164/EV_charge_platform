<script>
	import { login } from '../hooks/auth';
	import { store } from '../hooks/auth';
	import Input from './Input.svelte';
	import Button from './Button.svelte';
	import A from './A.svelte';

	let username = '';
	let password = '';
	let error = ''
	

	async function handleLogin() {
        /*if ( username.trim() === "" || password.trim() === "" ) {
			console.log("empty - error");
			error = 'Prosim izpolnite vsa polja.'
			return 0;
		}*/
		
		console.log("Good");
		
        const user = await login( username, password );
        console.log("got", user);
		return 0;
		if ( user ) {
			console.log(user)
			$store = user
			if ( error ) error = ''
		}
		else {
			error = 'Incorrect username and password.'
			console.log("Incorrect username and password.")
		}

	}
	
</script>

<div class="flex flex-col items-center justify-center ">
	<img class="m-2" src='/logo/Charge-Mate-Logo.png' alt='Logo'/>
	<h1 class="m-2 text-5xl font-bold">Dobrodošli nazaj</h1>
	<p class='mb-6 text-gray-500 text-lg'>Prijavite se za nadaljevanje</p>

<form on:submit|preventDefault={handleLogin} class="flex flex-col items-center justify-center">
	<Input placeholder="Uporabniško ime ali e-pošta" bind:value={username} type="text"/>	
	<Input placeholder="Geslo" bind:value={password} type="password" />	
	<Button>Prijava</Button>
	
	<div id="error_message" class="text-danger">
		<p class="text-danger">{error}</p>
	</div>

</form>

<div class="flex flex-row ">
	<p class="">Še nimate računa?</p>
	<A href="/register">Registrirajte se</A>
</div>


</div>



