<script>
	import { getAllUsers, getCompanyData, assignCompany } from '$lib';
	import { onMount } from 'svelte';
	import Button from './Button.svelte';
	import { accountID, accountRole, accountCompanyID, accountCompanyName } from '../store';
  import { SvelteEasyToast, toast } from 'svelte-easy-toast';

  const showGeneralErrorToast = () => {
    toast({
		type: 'error', // primary, dark, danger, success, info, warning, default, error
		position: 'top-center', // top-right top-left, top-center, bottom-left, bottom-right, bottom-center
		text: 'Poskusite kasneje',
		title: 'Neznana napaka',
	  });
	}
  const showErrorToast = (message) => {
    toast({
		type: 'error', // primary, dark, danger, success, info, warning, default, error
		position: 'top-center', // top-right top-left, top-center, bottom-left, bottom-right, bottom-center
		text: message,
		title: 'Napaka',
    });
  }

    let searchKeyword = '';
    let users = [];
    let filteredList = [];

    let isLoading = true;

    let selectedUserRow;
    
    let isUserAssigningLoading = false;

    onMount( async () => {
        const response = await getAllUsers();
        if (response.status && response.status == 200){
            users = response.data.Result;
            filteredList = users;
        }

        isLoading = false;
        console.log("users is now", users, users.length);
        
        const companyResult = await getCompanyData();
        if (companyResult.status && companyResult.status == 200){
          $accountCompanyID = companyResult.data.Result.id;
          $accountCompanyName = companyResult.data.Result.company_name;
        } else {
          showGeneralErrorToast();
        }
        
        console.log("C",$accountCompanyID, $accountCompanyName);
    });

  function filter() {
    filteredList = users.filter((x) => x.username.includes(searchKeyword.trim()));
  }

  async function assignUserToCompany (userID) {
    isUserAssigningLoading = true;
    selectedUserRow = userID;
    const assignResult = await assignCompany(userID, $accountCompanyID);
    console.log(assignResult);
    if (assignResult.status == 200){
      users[ users.findIndex(x => x.id == userID) ].company_name = $accountCompanyName;
      filteredList = users;
    } else {
      showErrorToast('Napaka pri dodeljevanju osebe v podjetje.');
    }
    selectedUserRow = null;
    isUserAssigningLoading = false;
  }


</script>
<SvelteEasyToast />  

<div class="flex flex-col justify-center items-center">
    <h1 class="mt-2 text-4xl">Pregled Uporabnikov</h1>

    <div class="mt-4 mb-2 flex w-3/5 items-center justify-center">
        <div class="flex border w-2/5 border-blue-200 rounded">
            <input
                type="text"
                bind:value={searchKeyword}
                class="block w-full px-4 py-2  bg-white border rounded-md focus:border-blue-400 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
                placeholder="Išči uporabniško ime..."
            />
            <button
                type="submit"
                class="px-4 text-white bg-blue-600 border-l rounded-md"
                on:click={() => filter()}
            >
                Iskanje
            </button>
        </div>
    </div>
    
    <div class="my-4 w-full mx-auto border-t-2 border-gray-300"></div>
    
    {#if isLoading}
        Pridobivam podatke....
    {:else}    
        
    <div class="flex w-3/5">
        <table class="border-collapse border w-full mb-8">
          <thead class="bg-blue-400">
            <tr>
              <th class="border p-2">Uporabniško ime:</th>
              <th class="border p-2">E-poštni naslov:</th>
              <th class="border p-2">RFID:</th>
              <th class="border p-2">V Podjetju:</th>
              <th class="border p-2">Akcija:</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredList as user (user.id)}
              {#if user.id != $accountID}
              <tr key={user.id} class="border p-2">
                <td class="border p-2 py-4">{user.username}</td>
                <td class="border p-2">{user.email_account}</td>
                <td class="border p-2">{user.rfid != undefined ? user.rfid : 'Ni nastavljeno'}</td>
                <td class="border p-2">{user.company_name != undefined ? user.company_name : 'Ni dodeljeno'}</td>
                <td class="border w-64 bg-inherit bg-none cursor-default text-center">
                {#if user.company_name == undefined}
                  <Button type='green' customClass='my-1 scale-90 px-2 py-2'
                  on:click={assignUserToCompany(user.id, $accountCompanyID)}
                  isLoading='{isUserAssigningLoading && user.id == selectedUserRow}'>
                    {isUserAssigningLoading && user.id == selectedUserRow ? 'Dodajanje...' : 'Dodaj v podjetje'}
                  </Button>
                {/if}
                </td>
              </tr>
              {/if}
            {/each}
          </tbody>
        </table>
          
      </div>
    
    {/if}

</div>
