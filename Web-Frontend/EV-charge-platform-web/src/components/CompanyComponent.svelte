<script>
import Button from './Button.svelte';
import { assignBuildingAccess, deleteAssignedBuildingAccess, getAssignedBuildingAccess, updateRFID, getCompanyDataOfAdmin, getCompanyOwnedBuildings, getCompanyUsers } from '$lib';
import SimpleModal from './SimpleModal.svelte';
import Input from './Input.svelte';
import { accountID, accountCompanyID, accountCompanyName } from '../store';
import { SvelteEasyToast, toast } from 'svelte-easy-toast';
import { CircleInfoSolid } from 'svelte-awesome-icons';

let getCompanyOwnedBuildingsPromise;
let getCompanyUsersPromise;
const getCompanyDataPromise = getCompanyDataOfAdmin($accountID).then(async x => {
  if (x.status && x.status == 200) {
    if (x.data.Result != undefined){
      accountCompanyID.set(x.data.Result.id);
      accountCompanyName.set(x.data.Result.company_name);
      getCompanyOwnedBuildingsPromise = await getCompanyOwnedBuildings($accountCompanyID).then(x =>{
        if (x.status && x.status == 200)
          allBuildings = x.data.Result ?? [];
        else
          showGeneralErrorToast();
      });
      getCompanyUsersPromise = await getCompanyUsers($accountCompanyID).then(x => {
        if (x.status && x.status == 200)
          users = x.data.Result;
        else
          showGeneralErrorToast();
      });
    }
  } else
    showGeneralErrorToast();
});


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
const showSuccessToast = (message) => {
  toast({
  type: 'success', // primary, dark, danger, success, info, warning, default, error
  position: 'top-center', // top-right top-left, top-center, bottom-left, bottom-right, bottom-center
  text: message,
  title: 'Uspeh'
  });
}


let showRFIDModal = false;
let showBuildingAccessModal = false;

function closeRFIDModal() {
  isRFIDLoading =
  showRFIDModal = false;
}
function closeBuildingAccessModal() {    
  isAddBuildingAccessDropdownOpen =
  isAddBuildingAccessLoading =
  isRemoveBuildingAccessLoading =
  showBuildingAccessModal = false;
}

let allBuildings = [];
let users = [];

let buildingAccessesID = [];

let selectedUser;
let editingRFID;
let isRFIDLoading = false;

let selectedBuildingID;
let isAddBuildingAccessDropdownOpen = false;
let isAddBuildingAccessLoading = false;
let isRemoveBuildingAccessLoading = false;

function handleUpdateRFID (user) {
  selectedUser = user;
  editingRFID = selectedUser.rfid;
  showRFIDModal = true;
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

async function handleShowBuildingAccess (user) {
  selectedUser = user;
  const res = await getAssignedBuildingAccess(user.id);
  if (res.status == 200) {
    buildingAccessesID = res.data.Result ?? [];
  }
    
  showBuildingAccessModal = true;
}

async function handleRemoveBuildingAccess (buildingID) {
  isRemoveBuildingAccessLoading = true;
  const res = await deleteAssignedBuildingAccess(selectedUser.id, buildingID);
  if (res.status == 200) {
    buildingAccessesID = buildingAccessesID.filter(x => x != buildingID);
    isRemoveBuildingAccessLoading = false;
  }

}

async function handleAddBuildingAccess () {
  isAddBuildingAccessLoading = true;
  const res = await assignBuildingAccess(selectedUser.id, selectedBuildingID, $accountCompanyID);
  if (res.status == 200) {
    buildingAccessesID.push(selectedBuildingID);
    buildingAccessesID = buildingAccessesID;
    isAddBuildingAccessLoading = false;
  }
  
}


$: if (buildingsLeftToChoose.length > 0 && !buildingsLeftToChoose.some(b => b.buildingID === selectedBuildingID)) {
  selectedBuildingID = buildingsLeftToChoose[0].buildingID;
}
$: actualBuildingAccesses = allBuildings.filter(x => buildingAccessesID.includes(x.buildingID));
$: buildingsLeftToChoose = allBuildings.filter(x => !actualBuildingAccesses.find(y => y.buildingID == x.buildingID));

function showInfoPanel() {
    var panel = document.getElementById('info-panel');
    panel.classList.remove('invisible', 'opacity-0');
    panel.classList.add('visible', 'opacity-100');
}

function hideInfoPanel() {
    var panel = document.getElementById('info-panel');
    panel.classList.remove('visible', 'opacity-100');
    panel.classList.add('invisible', 'opacity-0');
}

</script>
<SvelteEasyToast />

<div class="flex flex-col justify-center items-center"><!--Master div-->
  <div class="z-10 fixed flex-col right-10 top-20  bg-gray-300"><!-- Info div -->
    <CircleInfoSolid size=50 color='blue' class='absolute right-20' on:mouseenter={() => showInfoPanel()} on:mouseleave={() => hideInfoPanel()} />
    <div id="info-panel" class="px-4 py-6 text-center absolute -right-5 top-16 rounded-lg opacity-0 invisible transition-opacity duration-300 ease-in-out bg-white shadow-lg w-64">
      <p class="text-xl">Informacije:</p>
      <p>Za dodajanje zaposlenih pojdite pod zavihek Pregled Uporabnikov in iz tam najdite zaposlene.<br>
        Za spreminjanje poslovnih stavb se posvetuje s pravimi administratorji stavb.
      </p>
      </div>
  </div><!-- Info div -->
  
  <h1 class="mt-6 text-4xl">Moje podjetje</h1>
  {#if $accountCompanyID != -1}
    {#await getCompanyDataPromise}
      Pridobivam podatke....
    {:then _}
      <h1 class="text-3xl mt-4 mb-2">{$accountCompanyName}</h1>
    {/await}

    <!-- Horizontal line -->
    <div class="my-2 w-full mx-auto border-t-2 border-gray-300"></div>
        
    <div class="flex justify-center w-full h-full"><!--Main div-->
      
      <div class="w-5/12 px-20 flex-col items-center flex "><!-- Left half -->
          
        <h1 class="text-3xl m-2 mb-2 justify-self-center">Poslovne stavbe</h1>
        <p class="text-lg mb-2">To so vse poslovne stavbe, v katerih posluje naše podjetje.</p>

        {#await getCompanyOwnedBuildingsPromise}
          Pridobivam podatke....
        {:then _}

        <div class="w-full overflow-hidden rounded-lg">
          <table class="border w-full">
            <thead class="bg-blue-400">
              <tr>
                <th class="border p-2">Ime stavbe:</th>
                <th class="border p-2">Lokacija stavbe:</th>
              </tr>
            </thead>
            <tbody>
              
              {#each allBuildings as b (b.buildingID)}
                <tr key={b.buildingID}>
                  <td class="border p-3">{b.buildingName}</td>
                  <td class="border p-3">{b.buildingLocation}</td>                  
                </tr>
              {/each}
              
            </tbody>
          </table>
                
        </div>
      
        {/await}

      </div>

      <!-- Vertical line -->
      <div class="mx-4 my-0 border-r-2 border-gray-300 min-h-screen flex-grow "></div>
      
      <div class="w-7/12 px-10 flex-col items-center flex "><!-- Right half -->
        <h1 class="m-2 mb-2 text-3xl justify-self-center">Zaposleni</h1>
        <p class="text-lg mb-4">To so vsi zaposleni. Lahko se jim uredi RFID koda ali pa nastavi dostope do stavb.</p>

        {#await getCompanyUsersPromise}
          Pridobivam podatke....
        {:then _}

        <div class="w-full overflow-hidden rounded-lg"><!--Table div-->
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
                <td class="border p-2">{user.rfid == undefined || user.rfid == '' ? 'Ni nastavljeno' : user.rfid}</td>
                <td class="border w-64 justify-between bg-inherit bg-none cursor-default text-center">
                  <Button on:click={() => handleUpdateRFID(user)} type='green' customClass='my-1 scale-90 px-2 py-2 w-48'>
                    Uredi RFID
                  </Button>
                  <Button on:click={() => handleShowBuildingAccess(user)} type='orange' customClass='my-1 scale-90 px-2 py-2 w-48'>
                    Uredi dostope
                  </Button>
                </td>
              </tr>
              {/each}
            </tbody>
          </table>
        </div><!--Table div-->
        {/await}
      </div><!--Right half-->
 
  </div><!--Main div-->
  {:else}
  <p class="text-xl mt-10">Hmmm, kot kaže nimate pravic do nobenega podjetja.</p>
  <p class="text-xl mt-6">Posvetuje se z administratorjem stavbe ali pa z administratorjem platforme.</p>
  {/if}

  <!-- Modals for editing RFID or editing Building Accesses -->
  <SimpleModal show={showRFIDModal}>
    <div class=" z-10 flex-col items-center flex">
      <h2 class="text-2xl m-4 mb-2">Urejanje uporabnika: {selectedUser.username}</h2>
      <p class="mb-2">Pustite prazno za izbris RFID kode</p>
      <Input placeholder="RFID" bind:value={editingRFID} type="text" customClass='mx-4'/>	
        
      <div class="flex mt-2 items-center justify-between w-full px-4">
        <Button on:click={sendRFID} isLoading='{isRFIDLoading}' type='green' customClass='m-2 p-2 min-w-48'>
          Shrani
        </Button>
        <Button on:click={closeRFIDModal} type='red' customClass='m-2 p-2 min-w-48'>Izhod</Button>
      </div>
    </div>
  </SimpleModal>

  <SimpleModal show={showBuildingAccessModal} customInnerClass='w-5/12'>
    <div class="flex-col items-center flex justify-center">
      <h2 class="text-2xl m-4">Dostopi za uporabnika: {selectedUser.username}</h2>
      
      <!-- Existing Building Accesses content -->
      <div class="overflow-hidden rounded-lg">
        {#if actualBuildingAccesses.length != 0}
        <table class="border-collapse border w-full">
          <thead class="bg-blue-400">
            <tr>
              <th class="border p-2">Ime stavbe:</th>
              <th class="border p-2">Lokacija stavbe:</th>
              <th class="border p-2">Akcija:</th>
            </tr>
          </thead>
          <tbody>
            {#each actualBuildingAccesses as b (b.buildingID)}
              <tr key={b.buildingID}>
                <td class="border p-2">{b.buildingName}</td>
                <td class="border p-2">{b.buildingLocation}</td>
                <td class="border p-2">
                  <Button type='red' customClass='scale-90 mx-2 p-2' on:click={() => handleRemoveBuildingAccess(b.buildingID)}
                  isLoading='{isRemoveBuildingAccessLoading && selectedBuildingID == b.buildingID}'>
                    Odstrani dostop
                  </Button>
                </td>
              </tr>
            {/each}                  
          </tbody>
        </table>
        {:else}
          <p class="text-lg">Oseba nima nobenih dostopov.</p>
        {/if}
      </div>

      <!-- Horizontal line -->
      <div class="my-4 w-full mx-auto border-t-2 border-gray-300"></div>

      <!-- Add Building Access content -->
      <div class=" flex-col items-center flex">
        <p class="text-2xl">Dodaj dostop do poslovne stavbe:</p>
      {#if buildingsLeftToChoose.length != 0}
        <div class="flex items-center justify-between w-full px-4">
          <select bind:value={selectedBuildingID} class=" w-96 m-2 border-2 bg-white border-black rounded-lg px-4 py-2">
            {#each buildingsLeftToChoose as b (b.buildingID)}
              <option value={b.buildingID} class="bg-white hover:bg-blue-300 ">
              {b.buildingName}
              </option>
            {/each}
          </select>

          <Button on:click={handleAddBuildingAccess} isLoading='{isAddBuildingAccessLoading}' type='green' customClass='m-2 p-2 w-36 text-center'>
            Dodaj
          </Button>
        </div>
      {:else}
        <p class="text-lg">Oseba že ima vse dostope.</p>
      {/if}
      </div>

      <Button on:click={closeBuildingAccessModal} type='red' customClass='min-w-48 m-2 p-2'>
        Izhod
      </Button>
    </div>
  </SimpleModal>



</div><!--Master div-->
