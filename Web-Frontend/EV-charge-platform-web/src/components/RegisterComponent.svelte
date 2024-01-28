<script>
	import { goto } from '$app/navigation';
	import { register, login } from '$lib';
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
		title: 'Uspeh',
	    });
    }

	let username = '';
	let email = '';
	let password = '';
	let password_confirm = '';
	
	let isLoading = false;

	async function handleRegister() {
        if (username.trim() === "" || password.trim() === "" ||
			email.trim() === "" || password_confirm.trim() === "") {
			showErrorToast("Izpolnite vsa polja");
			return;
		}
		
		if (password.trim() != password_confirm.trim()) {
			showErrorToast("Gesla se ne ujemata");
			return;
		}

		isLoading = true;
		const response = await register(username, email, password);
		isLoading = false;

		console.log("response:", response);

		if (response.status == 400) {
			if (response.message == "Username is already taken.") {
				showErrorToast('Uporabniško ime je že zasedeno');
				username = '';
				return;
			}
			if (response.message == "Email is already in use."){
				showErrorToast('E-poštni naslov je že v uporabi');
				email = '';
				return;
			}
		} else if (response.status == 200) {
			//showSuccessToast("Uspešna registracija. Prijavljanje...");
			await login(username, password);
			goto('/');
			username, email, password, password_confirm = '';
		} else {
			showGeneralErrorToast();
		}
	}
	
</script>

<SvelteEasyToast />

<div class="flex flex-col items-center justify-center">
	<img class="scale-75" src='/logo/Charge-Mate-Logo.png' alt='Logo'/>
	<h1 class="-mt-16 mb-4 text-5xl font-bold">Ustvarite račun</h1>

<form on:submit|preventDefault={handleRegister} class="flex flex-col items-center justify-center">
	<Input placeholder="Uporabniško ime" bind:value={username} type="text"/>	
	<Input placeholder="E-pošta" bind:value={email} type="text" />
	<Input placeholder="Geslo" bind:value={password} type="password" />	
	<Input placeholder="Potrdite geslo" bind:value={password_confirm} type="password" />	
	<Button isLoading='{isLoading}' type='blue' customClass='px-4 py-2 m-4 mt-6 w-56'>
		{isLoading ? 'Registracija poteka...' : 'Registracija'}
	</Button>
</form>

<div class="flex flex-row ">
	<p class="">Že imate račun?</p>
	<A href="/login">Prijavite se</A>
</div>

</div>



