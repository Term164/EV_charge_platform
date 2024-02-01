<script>
import Button from './Button.svelte';
import { getAllCompanies, patchCompany, deleteCompany, createNewCompany } from '$lib';
import SimpleModal from './SimpleModal.svelte';
import Input from './Input.svelte';
import { SvelteEasyToast, toast } from 'svelte-easy-toast';
import { CircleInfoSolid } from 'svelte-awesome-icons';

let allCompanies = [];

const getAllCompaniesPromise = getAllCompanies().then(x => {
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

let selectedCompany = null;
let showEditCompanyModal = false;
let isEditCompanyLoading = false;
let editCompanyName = '';
function closeEditCompanyModal () {
  selectedCompany = null;
  isEditCompanyLoading =
  showEditCompanyModal = false;
}

let showDeleteCompanyModal = false;
let isDeleteCompanyLoading = false;
function closeDeleteCompanyModal () {
  selectedCompany = null;
  isDeleteCompanyLoading =
  showDeleteCompanyModal = false;
}

let showCreateCompanyModal = false;
let isCreateCompanyLoading = false;
let createCompanyName = '';
function closeCreateCompanyModal () {
  selectedCompany = null;
  createCompanyName = '';
  isCreateCompanyLoading =
  showCreateCompanyModal = false;
}

async function handleEditCompany (company) {
  selectedCompany = company;
  editCompanyName = company.companyName;
  showEditCompanyModal = true;
}

async function handleDeleteCompany (company) {
  selectedCompany = company;
  showDeleteCompanyModal = true;
}

async function handleCreateCompany () {
  showCreateCompanyModal = true;
}

async function editCompany () {
  isEditCompanyLoading = true;
  if (editCompanyName.trim() == '') {
    showErrorToast('Prazne vrednosti niso dovoljene');
    isEditCompanyLoading = false;
    return;
  }
  let newName = editCompanyName != selectedCompany.companyName ? editCompanyName : null;
  if (newName == null) {
    showSuccessToast('Nobenih sprememb');
    isEditCompanyLoading = false;
    return;
  }
  const res = await patchCompany(selectedCompany.companyID, newName);
  if (res.status == 200) {
    showSuccessToast('Podjetje je bilo urejeno.');
    if (newName != null)
      allCompanies.find(x => x.companyID == selectedCompany.companyID).companyName = newName;
    allCompanies = allCompanies;
  } else
    showErrorToast('Napaka pri urejanju podrobnosti podjetja.');
  isEditCompanyLoading = false;
}

async function removeCompany () {
  isDeleteCompanyLoading = true;
  const res = await deleteCompany(selectedCompany.companyID);
  if (res.status == 200) {
    showSuccessToast('Podjetje je bilo uspešno izbrisano.');
    allCompanies = allCompanies.filter(x => x.companyID != selectedCompany.companyID);
  } else
    showErrorToast('Napaka pri brisanju podjetja.');
  setTimeout(() => closeDeleteCompanyModal(), 1000);
}

async function createCompany () {
  isCreateCompanyLoading = true;
  if (createCompanyName.trim() == '') {
    showErrorToast('Vsa polja je potrebno izpolniti.');
    isCreateCompanyLoading = false;
    return;
  }
  
  const res = await createNewCompany(createCompanyName);
  if (res.status == 200) {
    showSuccessToast('Podjetje uspešno ustvarjeno. Osvežujem stran...');
    closeCreateCompanyModal();
    window.location.reload(true);
  } else
    showErrorToast('Napaka pri ustvarjanju podjetja.');
  isCreateCompanyLoading = false;
}

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
  
<div class="flex flex-col justify-center items-center"><!-- Master div -->
  <div class="z-10 fixed flex-col right-10 top-20  bg-gray-300"><!-- Info div -->
    <CircleInfoSolid size=50 color='blue' class='absolute right-20' on:mouseenter={() => showInfoPanel()} on:mouseleave={() => hideInfoPanel()} />
    <div id="info-panel" class="px-4 py-6 text-center absolute -right-5 top-16 rounded-lg opacity-0 invisible transition-opacity duration-300 ease-in-out bg-white shadow-lg w-64">
      <p class="text-xl">Informacije:</p>
      <p>Ko ustvarite podjetje, pojdite pod zavihek Pregled Uporabnikov in iz tam določite osebo, ki bo administrator podjetja.<br>
        Alternativno lahko to delo prepustite administratorju stavbe, če je tako zmenjeno.
      </p>
      </div>
  </div><!-- Info div -->

  <h1 class="mt-6 m-4 text-4xl">Vsa podjetja</h1>	
  
  {#if allCompanies != 0}
  
    <!-- Horizontal line -->
    <div class="my-2 w-full mx-auto border-t-2 border-gray-300"></div>
        
    <div class="flex flex-col justify-center items-center w-full h-full"><!-- Main div -->
      <p class="text-lg mb-2 text-wrap text-center">Tu lahko urejate podrobnosti o podjetju,<br>dodate novo podjetje ali pa ga izbrišete.</p>

      <Button on:click={() => handleCreateCompany()} type='green' customClass='scale-90 mt-2 px-2 py-2 w-52'>
        Dodaj novo podjetje
      </Button>

      {#await getAllCompaniesPromise}
        Pridobivam podatke....
      {:then _}

      <div class="w-7/12 mt-4 m-2 flex justify-center overflow-hidden rounded-lg"><!-- Table div -->
        <table class="border-collapse border w-full">
          <thead class="bg-blue-400">
            <tr>
              <th class="border p-2">Ime podjetja:</th>
              <th class="border p-2">Akcija:</th>
              <th class="border p-2">Akcija:</th>
            </tr>
          </thead>
          <tbody>
            {#each allCompanies as c (c.companyID)}
              <tr key={c.companyID}>
                <td class="border p-3">{c.companyName}</td>
                <td class="border p-2 w-64 justify-between bg-inherit bg-none cursor-default text-center">                  
                  <Button on:click={() => handleEditCompany(c)} type='orange' customClass='scale-90 px-2 py-2 w-52'>
                    Uredi podrobnosti
                  </Button>
                </td>
                <td class="border p-2 w-64 justify-between bg-inherit bg-none cursor-default text-center">                  
                  <Button on:click={() => handleDeleteCompany(c)} type='red' customClass='scale-90 px-2 py-2 w-52'>
                    Zbriši podjetje
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
  <p class="text-xl mt-10">Hmmm, kot kaže ni nobenih podjetij.</p>
  {/if}

  <!-- Modals -->
  
  <SimpleModal show={showEditCompanyModal} customInnerClass='w-5/12 flex p-0 justify-center'><!-- Edit company modal -->
    <div class=" z-10 flex-col items-center flex text-center">
      <h2 class="text-2xl m-4 mb-2">Urejanje podjetja:<br> {selectedCompany.companyName}</h2>
      <p class="mb-2"></p>
      <Input placeholder='Vnesi ime podjetja' bind:value={editCompanyName} type="text" customClass='mx-4'/>
      <div class="flex m-2 mb-4 items-center justify-between w-full px-4">
        <Button on:click={() => editCompany()} isLoading='{isEditCompanyLoading}' type='green' customClass='m-2 p-2 min-w-48'>
          Shrani
        </Button>
        <Button on:click={() => closeEditCompanyModal()} type='red' customClass='m-2 p-2 min-w-48'>
          Izhod
        </Button>
      </div>
    </div>
  </SimpleModal><!-- Edit company modal -->

  <SimpleModal show={showDeleteCompanyModal} customInnerClass='w-5/12 flex p-0 justify-center'><!-- Delete company modal -->
    <div class=" z-10 flex-col items-center flex text-center">
      <h2 class="text-2xl m-4 mb-2">Pravkar boste izbrisali podjetje: <br>{selectedCompany.companyName}</h2>
      <p class="m-4 text-2xl">Ali res želite to storiti?</p>
      <div class="flex m-2 mb-4 items-center justify-between w-full px-4">
        <Button on:click={() => removeCompany()} isLoading='{isDeleteCompanyLoading}' type='green' customClass='m-2 p-2 min-w-48'>
          Izbriši
        </Button>
        <Button on:click={() => closeDeleteCompanyModal()} type='red' customClass='m-2 p-2 min-w-48'>
          Prekliči
        </Button>
      </div>
    </div>
  </SimpleModal><!-- Delete company modal -->

  <SimpleModal show={showCreateCompanyModal} customInnerClass='w-5/12 flex p-0 justify-center'><!-- Create company modal -->
    <div class=" z-10 flex-col items-center flex text-center">
      <h2 class="text-2xl m-4 mb-2">Ustvarjanje novega podjetja:</h2>
      <p class="mb-2"></p>
      <Input placeholder='Vnesi ime podjetja' bind:value={createCompanyName} type="text" customClass='mx-4'/>
      <div class="flex m-2 mb-4 items-center justify-between w-full px-4">
        <Button on:click={() => createCompany()} isLoading='{isCreateCompanyLoading}' type='green' customClass='m-2 p-2 min-w-48'>
          Shrani
        </Button>
        <Button on:click={() => closeCreateCompanyModal()} type='red' customClass='m-2 p-2 min-w-48'>
          Izhod
        </Button>
      </div>
    </div>
  </SimpleModal><!-- Create company modal -->



</div><!--Master div-->
  