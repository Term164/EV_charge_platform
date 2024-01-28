<script>
import Button from './Button.svelte';
import { getBuildingAdmins, getCompaniesInBuilding, deleteAssignedCompanyFromBuilding, getAllCompanies, setRoleAndUserProfile, assignCompanyToBuilding } from '$lib';
import SimpleModal from './SimpleModal.svelte';
import Input from './Input.svelte';
import { accountID } from '../store';
import { SvelteEasyToast, toast } from 'svelte-easy-toast';
  
setRoleAndUserProfile();

let buildingsOfAdmin = []
let allCompanies = [];

const getBuildingOfAdminPromise = getBuildingAdmins().then(x => {
  if (x.status && x.status == 200)
    buildingsOfAdmin = x.data.result.filter(x => x.account.id == $accountID).map(x => x.building);
  else
    showGeneralErrorToast();
});

getAllCompanies().then(x => {
  if (x.status && x.status == 200)
    allCompanies = x.data.Result;
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


let showCompaniesModal = false;
let isRemoveCompanyAccessLoading = false;
let isAddCompanyAccessLoading = false;
function closeCompaniesModal() {
  selectedCompanyID = null;
  isAddCompanyAccessLoading =
  isRemoveCompanyAccessLoading =
  showCompaniesModal = false;
}

let selectedCompanyID = null;
let selectedBuildingID = null;
let companiesInBuilding = [];
let companiesLeftToChoose = [];

async function handleCompanies (buildingID) {
  selectedBuildingID = buildingID;
  const res = await getCompaniesInBuilding(buildingID);
  if (res.status && res.status == 200)
    companiesInBuilding = res.data.Result;
  showCompaniesModal = true;
}

async function handleRemoveCompanyAccess (companyID) {
  isRemoveCompanyAccessLoading = true;
  const res = await deleteAssignedCompanyFromBuilding(selectedBuildingID, companyID);
  if (res.status == 200) {
    companiesInBuilding = companiesInBuilding.filter(x => x.companyID != companyID);
    isRemoveCompanyAccessLoading = false;
  } else
    showErrorToast('Napaka pri odstranjevanju podjetja.');
}

async function handleAssignCompanyAccess () {
  isAddCompanyAccessLoading = true;
  const res = await assignCompanyToBuilding(selectedBuildingID, selectedCompanyID);
  if (res.status == 200) {
    companiesInBuilding.push(allCompanies.find(x => x.companyID == selectedCompanyID));
    companiesInBuilding = companiesInBuilding;
    isAddCompanyAccessLoading = false;
  } else
    showErrorToast('Napaka pri dodajanju podjetja.');
}


$: if (companiesLeftToChoose.length > 0 && !companiesLeftToChoose.some(c => c.companyID === selectedCompanyID)) {
  selectedCompanyID = companiesLeftToChoose[0].companyID;
}
$: console.log("companiesInBuilding", companiesInBuilding);
$: companiesLeftToChoose = allCompanies.filter(x => !companiesInBuilding.find(y => y.companyID == x.companyID));
  </script>
  <SvelteEasyToast />
  
  <div class="flex flex-col justify-center items-center"><!--Master div-->
    <h1 class="mt-6 m-4 text-4xl">Moje poslovne stavbe</h1>
    {#if 1 != -1}
    
      <!-- Horizontal line -->
      <div class="my-2 w-full mx-auto border-t-2 border-gray-300"></div>
          
      <div class="flex flex-col justify-center items-center w-full h-full"><!--Main div-->
        <p class="text-lg mb-2 text-wrap text-center">Tu lahko urejate katera podjetja poslujejo v posamezni stavbi
        <br> in urejate električne polnilnice pri stavbi.</p>

        {#await getBuildingOfAdminPromise}
          Pridobivam podatke....
        {:then _}

        <div class="w-full px-20 mt-4 flex justify-center">
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
              {#each buildingsOfAdmin as b (b.id)}
                <tr key={b.id}>
                  <td class="border p-3">{b.building_name}</td>
                  <td class="border p-3">{b.building_location}</td>
                  <td class="border p-2 w-64 justify-between bg-inherit bg-none cursor-default text-center">                  
                    <Button on:click={() => handleCompanies(b.id)} type='green' customClass='scale-90 px-2 py-2 w-52'>
                      Uredi podjetja
                    </Button>
                  </td>
                  <td class="border p-2 w-64 justify-between bg-inherit bg-none cursor-default text-center">                  
                    <Button on:click={() => selectedBuildingID = b.id} type='green' customClass='scale-90 px-2 py-2 w-52'>
                      Uredi polnilnice
                    </Button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
                
        </div>
      
        {/await}
   
    </div><!--Main div-->
    {:else}
    <p class="text-xl mt-10">Hmmm, kot kaže nimate pravic do nobenega podjetja.</p>
    <p class="text-xl mt-6">Posvetuje se z administratorjem stavbe ali pa z administratorjem platforme.</p>
    {/if}
  
    
    <SimpleModal show={showCompaniesModal} customInnerClass='w-5/12'>
      <div class="flex-col items-center flex justify-center">
        <h2 class="text-2xl m-4">Podjetja, ki poslujejo v stavbi:</h2>
        
        <!-- Existing Building Accesses content -->
        <div>
          {#if companiesInBuilding.length != 0}
          <table class="border-collapse border m-2 w-full">
            <thead class="bg-blue-400">
              <tr>
                <th class="border p-2">Ime podjetja:</th>
                <th class="border p-2">Akcija:</th>
              </tr>
            </thead>
            <tbody>
              {#each companiesInBuilding as c (c.companyID)}
                <tr key={c.companyID}>
                  <td class="border p-2">{c.companyName}</td>
                  <td class="border p-2 w-64 justify-between bg-inherit bg-none cursor-default text-center">
                    <Button type='red' customClass='scale-90 mx-2 p-2' on:click={() => handleRemoveCompanyAccess(c.companyID)}
                    isLoading='{isRemoveCompanyAccessLoading && selectedCompanyID == c.companyID}'>
                      Odstrani dostop
                    </Button>
                  </td>
                </tr>
              {/each}                  
            </tbody>
          </table>
          {:else}
            <p class="text-lg">V stavbi ne posluje nobeno podjetje.</p>
          {/if}
        </div>
  
        <!-- Horizontal line -->
        <div class="my-4 w-full mx-auto border-t-2 border-gray-300"></div>
  
        <!-- Add Companies content -->
        <div class=" flex-col items-center flex">
          <p class="text-2xl">Dodaj podjetje v poslovno stavbo:</p>
        {#if companiesLeftToChoose.length != 0}
          <div class="flex items-center justify-between w-full px-4">
            <select bind:value={selectedCompanyID} class=" w-96 m-2 border-2 bg-white border-black rounded-lg px-4 py-2">
              {#each companiesLeftToChoose as c (c.companyID)}
                <option value={c.companyID} class="bg-white hover:bg-blue-300 ">
                {c.companyName}
                </option>
              {/each}
            </select>
  
            <Button on:click={handleAssignCompanyAccess} isLoading='{isAddCompanyAccessLoading}' type='green' customClass='m-2 p-2 w-36 text-center'>
              Dodaj
            </Button>
          </div>
        {:else}
          <p class="text-lg">Stavba že vsebuje vsa podjetja.</p>
        {/if}
        </div>
  
        <Button on:click={closeCompaniesModal} type='red' customClass='min-w-48 m-2 p-2'>Izhod</Button>
      </div>
    </SimpleModal>
  
  
  
  </div><!--Master div-->
  