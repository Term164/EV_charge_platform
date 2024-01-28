<script>
import Button from './Button.svelte';
import { patchBuilding, getAllBuildings, deleteBuilding, createNewBuilding } from '$lib';
import SimpleModal from './SimpleModal.svelte';
import Input from './Input.svelte';
import { SvelteEasyToast, toast } from 'svelte-easy-toast';
  
let allBuildings = [];

const getAllBuildingsPromise = getAllBuildings().then(x => {
  if (x.status && x.status == 200)
    allBuildings = x.data.Result;
  else
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

let selectedBuilding = null;
let showEditBuildingModal = false;
let isEditBuildingLoading = false;
let editBuildingName = '';
let editBuildingLocation = '';
function closeEditBuildingModal () {
  selectedBuilding = null;
  isEditBuildingLoading =
  showEditBuildingModal = false;
}

let showDeleteBuildingModal = false;
let isDeleteBuildingLoading = false;
function closeDeleteBuildingModal () {
  selectedBuilding = null;
  isDeleteBuildingLoading =
  showDeleteBuildingModal = false;
}

let showCreateBuildingModal = false;
let isCreateBuildingLoading = false;
let createBuildingName = '';
let createBuildingLocation = '';
let createBuildingLongitude = '';
let createBuildingLatitude = '';
function closeCreateBuildingModal () {
  selectedBuilding = null;
  createBuildingName =
  createBuildingLocation =
  createBuildingLongitude =
  createBuildingLatitude = '';
  isCreateBuildingLoading =
  showCreateBuildingModal = false;
}

async function handleEditBuilding (building) {
  selectedBuilding = building;
  editBuildingName = building.buildingName;
  editBuildingLocation = building.buildingLocation;
  showEditBuildingModal = true;
}

async function handleDeleteBuilding (building) {
  selectedBuilding = building;
  showDeleteBuildingModal = true;
}

async function handleCreateBuilding () {
  showCreateBuildingModal = true;
}

async function editBuilding () {
  isEditBuildingLoading = true;
  if (editBuildingName.trim() == '' || editBuildingLocation.trim() == '' ) {
    showErrorToast('Prazne vrednosti niso dovoljene');
    isEditBuildingLoading = false;
    return;
  }
  let newName = editBuildingName != selectedBuilding.buildingName ? editBuildingName : null;
  let newLocation = editBuildingLocation != selectedBuilding.buildingLocation ? editBuildingLocation : null;
  if (newName == null && newLocation == null) {
    showSuccessToast('Nobenih sprememb');
    isEditBuildingLoading = false;
    return;
  }
  const res = await patchBuilding(selectedBuilding.buildingID, newName, newLocation);
  if (res.status == 200) {
    showSuccessToast('Stavba je bila urejena.');
    if (newName != null)
      allBuildings.find(x => x.buildingID == selectedBuilding.buildingID).buildingName = newName;    
    if (newLocation != null) 
      allBuildings.find(x => x.buildingID == selectedBuilding.buildingID).buildingLocation = newLocation;
    allBuildings = allBuildings;
  } else
    showErrorToast('Napaka pri urejanju podrobnosti stavbe.');
  isEditBuildingLoading = false;
}

async function removeBuilding () {
  isDeleteBuildingLoading = true;
  const res = await deleteBuilding(selectedBuilding.buildingID);
  if (res.status == 200) {
    showSuccessToast('Stavba je bila uspešno izbrisana.');
    allBuildings = allBuildings.filter(x => x.buildingID != selectedBuilding.buildingID);
  } else
    showErrorToast('Napaka pri brisanju stavbe.');
  setTimeout(() => closeDeleteBuildingModal(), 1000);
}

async function createBuilding () {
  isCreateBuildingLoading = true;
  if (createBuildingName.trim() == '' || createBuildingLocation.trim() == '' || String(createBuildingLongitude).trim() == '' || String(createBuildingLatitude).trim() == '') {
    showErrorToast('Vsa polja je potrebno izpolniti.');
    isCreateBuildingLoading = false;
    return;
  }
  createBuildingLongitude = Number(createBuildingLongitude);
  createBuildingLatitude = Number(createBuildingLatitude);
  if (isNaN(createBuildingLongitude)){
    showErrorToast('Geo. dolžina mora biti število.');
    createBuildingLongitude = '';
    isCreateBuildingLoading = false;
    return;
  }
  if (isNaN(createBuildingLatitude)){
    showErrorToast('Geo. širina mora biti število.');
    createBuildingLatitude = '';
    isCreateBuildingLoading = false;
    return;
  }
  
  const res = await createNewBuilding(createBuildingName, createBuildingLocation, createBuildingLongitude, createBuildingLatitude);
  if (res.status == 200) {
    showSuccessToast('Stavba uspešno ustvarjena. Osvežujem stran...');
    closeCreateBuildingModal();
    window.location.reload(true);
  } else
    showErrorToast('Napaka pri ustvarjanju stavbe.');
  isCreateBuildingLoading = false;
}

</script>
<SvelteEasyToast />
  
<div class="flex flex-col justify-center items-center"><!-- Master div -->
  <h1 class="mt-6 m-4 text-4xl">Vse poslovne stavbe</h1>
  {#if allBuildings.length != 0}
  
    <!-- Horizontal line -->
    <div class="my-2 w-full mx-auto border-t-2 border-gray-300"></div>
        
    <div class="flex flex-col justify-center items-center w-full h-full"><!-- Main div -->
      <p class="text-lg mb-2 text-wrap text-center">Tu lahko urejate podrobnosti o stavbi,<br>dodate novo stavbo ali pa jo izbrišete.</p>

      <Button on:click={() => handleCreateBuilding()} type='green' customClass='scale-90 mt-2 px-2 py-2 w-52'>
        Dodaj novo stavbo
      </Button>

      {#await getAllBuildingsPromise}
        Pridobivam podatke....
      {:then _}

      <div class="w-full px-20 mt-4 flex justify-center"><!-- Table div -->
        <table class="border-collapse border m-2 w-10/12">
          <thead class="bg-blue-400">
            <tr>
              <th class="border p-2">Ime stavbe:</th>
              <th class="border p-2">Lokacija stavbe:</th>
              <th class="border p-2">Akcija:</th>
              <th class="border p-2">Akcija:</th>
            </tr>
          </thead>
          <tbody>
            {#each allBuildings as b (b.buildingID)}
              <tr key={b.buildingID}>
                <td class="border p-3">{b.buildingName}</td>
                <td class="border p-3">{b.buildingLocation}</td>
                <td class="border p-2 w-64 justify-between bg-inherit bg-none cursor-default text-center">                  
                  <Button on:click={() => handleEditBuilding(b)} type='orange' customClass='scale-90 px-2 py-2 w-52'>
                    Uredi podrobnosti
                  </Button>
                </td>
                <td class="border p-2 w-64 justify-between bg-inherit bg-none cursor-default text-center">                  
                  <Button on:click={() => handleDeleteBuilding(b)} type='red' customClass='scale-90 px-2 py-2 w-52'>
                    Zbriši stavbo
                  </Button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
              
      </div><!-- Table div -->
    
      {/await}
  
  </div><!-- Main div -->
  {:else}
  <p class="text-xl mt-10">Hmmm, kot kaže ni nobenih stavb.</p>
  {/if}

  <!-- Modals -->
  
  <SimpleModal show={showEditBuildingModal} customInnerClass='w-5/12 flex p-0 justify-center'><!-- Edit building modal -->
    <div class=" z-10 flex-col items-center flex text-center">
      <h2 class="text-2xl m-4 mb-2">Urejanje stavbe:<br> {selectedBuilding.buildingName}</h2>
      <p class="mb-2"></p>
      <Input placeholder='Vnesi ime stavbe' bind:value={editBuildingName} type="text" customClass='mx-4'/>
      <Input placeholder='Vnesi lokacijo stavbe' bind:value={editBuildingLocation} type="text" customClass='mx-4'/>
      <div class="flex m-2 mb-4 items-center justify-between w-full px-4">
        <Button on:click={() => editBuilding()} isLoading='{isEditBuildingLoading}' type='green' customClass='m-2 p-2 min-w-48'>
          Shrani
        </Button>
        <Button on:click={() => closeEditBuildingModal()} type='red' customClass='m-2 p-2 min-w-48'>
          Izhod
        </Button>
      </div>
    </div>
  </SimpleModal><!-- Edit building modal -->

  <SimpleModal show={showDeleteBuildingModal} customInnerClass='w-5/12 flex p-0 justify-center'><!-- Delete building modal -->
    <div class=" z-10 flex-col items-center flex text-center">
      <h2 class="text-2xl m-4 mb-2">Pravkar boste izbrisali stavbo: <br>{selectedBuilding.buildingName}</h2>
      <p class="m-4 text-2xl">Ali res želite to storiti?</p>
      <div class="flex m-2 mb-4 items-center justify-between w-full px-4">
        <Button on:click={() => removeBuilding()} isLoading='{isDeleteBuildingLoading}' type='green' customClass='m-2 p-2 min-w-48'>
          Izbriši
        </Button>
        <Button on:click={() => closeDeleteBuildingModal()} type='red' customClass='m-2 p-2 min-w-48'>
          Prekliči
        </Button>
      </div>
    </div>
  </SimpleModal><!-- Delete building modal -->

  <SimpleModal show={showCreateBuildingModal} customInnerClass='w-5/12 flex p-0 justify-center'><!-- Create building modal -->
    <div class=" z-10 flex-col items-center flex text-center">
      <h2 class="text-2xl m-4 mb-2">Ustvarjanje nove stavbe:</h2>
      <p class="mb-2"></p>
      <Input placeholder='Vnesi ime stavbe' bind:value={createBuildingName} type="text" customClass='mx-4'/>
      <Input placeholder='Vnesi lokacijo stavbe' bind:value={createBuildingLocation} type="text" customClass='mx-4'/>
      <Input placeholder='Vnesi geo. dolžino stavbe - npr. 14.54' bind:value={createBuildingLongitude} type="text" customClass='mx-4'/>
      <Input placeholder='Vnesi geo. širino stavbe - npr. 46.07' bind:value={createBuildingLatitude} type="text" customClass='mx-4'/>
      <p class="m-1 text-sm">Geo. dolžina in širina sta potrebna za integracijo z zemljevidi v mobilni aplikaciji.<br> Biti morata decimalni števili, ločeni s piko.</p>
      <div class="flex m-2 mb-4 items-center justify-between w-full px-4">
        <Button on:click={() => createBuilding()} isLoading='{isCreateBuildingLoading}' type='green' customClass='m-2 p-2 min-w-48'>
          Shrani
        </Button>
        <Button on:click={() => closeCreateBuildingModal()} type='red' customClass='m-2 p-2 min-w-48'>
          Izhod
        </Button>
      </div>
    </div>
  </SimpleModal><!-- Create building modal -->



</div><!--Master div-->
  