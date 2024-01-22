<script>
	import { updateRFID } from './../lib/index.js';
	import Button from './Button.svelte';
	import { getCompanyData, getCompanyOwnedBuildings, getCompanyUsers } from '$lib';
	import { onMount } from 'svelte';
  import SimpleModal from './SimpleModal.svelte';
	import Input from './Input.svelte';
  
  let showModal = false;
  function close() {
    showModal = false;
    isRFIDLoading = false;
  }


  let companyID, companyName;
  let buildings = [];
  let users = [];

  let isCompanyLoading = true;
  let isBuildingsLoading = true;
  let isUsersLoading = true

  let selectedUserRow;
  let selectedUser;
  let editingRFID;
  let isRFIDLoading = false;

  onMount( async () => {
    const companyResult = await getCompanyData();
    if (companyResult.status && companyResult.status == 200) {
        companyID = companyResult.data.Result.id;
        companyName = companyResult.data.Result.company_name;
        isCompanyLoading = false;
    }
    
    getCompanyOwnedBuildings(companyID).then((x) =>{
      if (x.status && x.status == 200) {
        buildings = x.data.Result;
        isBuildingsLoading = false;
    }});
    
    getCompanyUsers(companyID).then((x) => {
      if (x.status && x.status == 200) {
        users = x.data.Result;
        isUsersLoading = false;
    }});
      
    console.log(buildings, users);
  });

  function handleSelectRow (user) {
    selectedUserRow = (selectedUserRow != user.id ? user.id : null);
    selectedUser = (selectedUserRow != null ? user : null);
    editingRFID = selectedUser.rfid;
  }

  async function sendRFID () {
    isRFIDLoading = true;
    const result = await updateRFID(selectedUser.id, editingRFID);
    if (result.status == 200){
      close();
    }

  }

</script>


<div class="flex flex-col justify-center items-center">
    <h1 class="mt-4 text-4xl">Moje podjetje</h1>

    {#if isCompanyLoading}
      Pridobivam podatke....
    {:else}
      <h1 class="text-3xl mt-4 mb-2">{companyName}</h1>
    {/if}

    <!-- Horizontal line -->
    <div class="my-2 w-full mx-auto border-t-2 border-gray-300"></div>
        
    <div class="flex justify-center w-full h-full">
      <!-- Left half -->
      <div class="w-1/2 flex-col items-center flex ">
          
        <h1 class="text-2xl m-2 mb-4 justify-self-center">Poslovne stavbe</h1>
        
        {#if isBuildingsLoading}
          Pridobivam podatke....
        {:else}

        <div>
          <table class="border-collapse border m-2 w-full">
            <thead class="bg-blue-400">
              <tr>
                <th class="border p-2">Ime stavbe:</th>
                <th class="border p-2">Lokacija stavbe:</th>
                <th class="border p-2">Geo. Širina:</th>
                <th class="border p-2">Geo. Dolžina:</th>
              </tr>
            </thead>
            <tbody>
              
              {#each buildings as b (b.buildingID)}
                <tr key={b.buildingID}>
                  <td class="border p-2">{b.buildingName}</td>
                  <td class="border p-2">{b.buildingLocation}</td>
                  <td class="border p-2">{b.buildingLatitude != null ? b.buildingLatitude : 'Ni podatka'}</td>
                  <td class="border p-2">{b.buildingLongitude != null ? b.buildingLongitude : 'Ni podatka'}</td>
                </tr>
              {/each}
              
            </tbody>
          </table>
                
        </div>
      
        {/if}

      </div>

      <!-- Vertical line -->
      <div class="mx-4 my-0 border-r-2 border-gray-300 min-h-screen flex-grow "></div>
      <!-- Right half -->
      <div class="w-1/2 flex-col items-center flex ">
        <h1 class="m-2 mb-4 text-2xl justify-self-center">Zaposleni</h1>

        {#if isUsersLoading}
          Pridobivam podatke....
        {:else}

        <div class="w-full px-10">
          <table class="border-collapse border w-full">
            <thead class="bg-blue-400">
              <tr>
                <th class="border p-2">Uporabniško ime:</th>
                <th class="border p-2">E-poštni naslov:</th>
                <th class="border p-2">RFID:</th>
              </tr>
            </thead>
            <tbody>
              {#each users as user (user.id)}
              <tr key={user.id} on:click={handleSelectRow(user)} 
                class="border p-2 hover:bg-blue-300 hover:shadow-[0_0_0_2px_#4a90e2] cursor-pointer"
                class:bg-blue-200 = {selectedUserRow == user.id}
                class:shadow-[0_0_0_2px_#4a90e2] = {selectedUserRow == user.id} >
                  <td class="border p-2">{user.username}</td>
                  <td class="border p-2">{user.email_account}</td>
                  <td class="border p-2">{user.rfid != undefined ? user.rfid : 'Ni nastavljeno'}</td>
                </tr>
              {/each}
            </tbody>
          </table>   
        </div>
      
        {#if selectedUserRow != null}
          <div class="flex px-4 align-middle">
            <Button on:click={() => showModal = true} type='blue'>Uredi RFID</Button>  
            <Button type='red'>Odstrani iz podjetja</Button>  
          </div>
        {/if}
          
        
        <SimpleModal show={showModal} {close}>
            <div class="w-/12 z-10 flex-col items-center flex">
              <h2 class="text-2xl m-4">Urejanje uporabnika: {selectedUser.username}</h2>
              
              <Input placeholder="RFID" bind:value={editingRFID} type="text" customClass='mx-4'/>	
              
              <div class="flex items-center justify-between w-full px-4">
                <Button on:click={sendRFID} isLoading='{isRFIDLoading}' type='green' customClass='min-w-48'>
                  {isRFIDLoading ? 'Shranjevanje...' : 'Shrani'}
                </Button>
                <Button on:click={close} type='red' customClass='min-w-48'>Prekliči</Button>
              </div>
            </div>
          </SimpleModal>


        {/if}

    </div>
  </div>

</div>
