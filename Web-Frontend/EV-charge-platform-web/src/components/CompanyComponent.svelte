<script>
	import { updateRFID } from './../lib/index.js';
	import Button from './Button.svelte';
	import { getCompanyData, getCompanyOwnedBuildings, getCompanyUsers } from '$lib';
	import { onMount } from 'svelte';
  import SimpleModal from './SimpleModal.svelte';
	import Input from './Input.svelte';
  import { accountCompanyID, accountCompanyName } from '../store';

  let showRFIDModal = false;
  let showBuildingAccessModal = false;
  
  function closeRFIDModal() {
    showRFIDModal = false;
    isRFIDLoading = false;
  }
  function closeBuildingAccessModal() {
    showBuildingAccessModal = false;
    isBuildingAccessLoading = false;
  }

  let buildings = [];
  let users = [];

  let buildingAccesses = [];

  let isCompanyLoading = true;
  let isBuildingsLoading = true;
  let isUsersLoading = true

  let selectedUser;
  let editingRFID;
  let isRFIDLoading = false;
  let isBuildingAccessLoading = false;

  onMount( async () => {
    const companyResult = await getCompanyData();
    if (companyResult.status && companyResult.status == 200) {
        accountCompanyID.set(companyResult.data.Result.id);
        accountCompanyName.set(companyResult.data.Result.company_name);
        isCompanyLoading = false;
    }
    
    getCompanyOwnedBuildings($accountCompanyID).then((x) =>{
      if (x.status && x.status == 200) {
        buildings = x.data.Result;
        isBuildingsLoading = false;
    }});
    
    getCompanyUsers($accountCompanyID).then((x) => {
      if (x.status && x.status == 200) {
        users = x.data.Result;
        isUsersLoading = false;
    }});
      
    console.log(buildings, users);
  });

  function handleUpdateRFID (user) {
    selectedUser = user;
    editingRFID = selectedUser.rfid;
    showRFIDModal = true;
  }

  function handleBuildingAccess (user) {
    selectedUser = user;
    showBuildingAccessModal = true;
  }

  async function sendRFID () {
    isRFIDLoading = true;
    const result = await updateRFID(selectedUser.id, editingRFID);
    if (result.status == 200){
      users[ users.findIndex(x => x.id == selectedUser.id) ].rfid = editingRFID;
      isRFIDLoading = false;
      close();
    }
  }

  async function getBuildingAccessesOfUser (userID) {
    const res = await getBuildingAccesses(userID);
    if (res.status == 200)
      buildingAccesses = res.data.Result;
  }



</script>


<div class="flex flex-col justify-center items-center">
    <h1 class="mt-4 text-4xl">Moje podjetje</h1>

    {#if isCompanyLoading}
      Pridobivam podatke....
    {:else}
      <h1 class="text-3xl mt-4 mb-2">{$accountCompanyName}</h1>
    {/if}

    <!-- Horizontal line -->
    <div class="my-2 w-full mx-auto border-t-2 border-gray-300"></div>
        
    <div class="flex justify-center w-full h-full">
      <!-- Left half -->
      <div class="w-5/12 flex-col items-center flex ">
          
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
      <div class="w-7/12 flex-col items-center flex ">
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
                <th class="border p-2">Akcije:</th>
              </tr>
            </thead>
            <tbody>
              {#each users as user (user.id)}
              <tr key={user.id} class="border p-2">
                <td class="border p-2">{user.username}</td>
                <td class="border p-2">{user.email_account}</td>
                <td class="border p-2">{user.rfid != undefined ? user.rfid : 'Ni nastavljeno'}</td>                
                <td class="border w-64 justify-between bg-inherit bg-none cursor-default text-center">
                  <Button on:click={() => handleUpdateRFID(user)} type='blue' customClass='my-1 scale-90 px-2 py-2'>
                    Uredi RFID
                  </Button>
                  <Button on:click={() => handleBuildingAccess(user)} type='blue' customClass='my-1 scale-90 px-2 py-2'>
                    Uredi dostope
                  </Button>
                </td>
              </tr>
              {/each}
            </tbody>
          </table>   
        </div>
      
        
        <SimpleModal show={showRFIDModal} {closeRFIDModal}>
          <div class="w-5/12 z-10 flex-col items-center flex">
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

        <SimpleModal show={showBuildingAccessModal} {closeBuildingAccessModal}>
          <div class="w-7/12 z-10 flex-col items-center flex">
            <h2 class="text-2xl m-4">Dostopi za uporabnika: {selectedUser.username}</h2>
            
              
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
