<script>
import ConnectorInfoComponent from './ConnectorInfoComponent.svelte';
import Button from './Button.svelte';
import { deleteStation, createNewStation, getAllStations,getBuildingAdmins, getCompaniesInBuilding, deleteAssignedCompanyFromBuilding, getAllCompanies, setRoleAndUserProfile, assignCompanyToBuilding, getAllChargingTypes } from '$lib';
import SimpleModal from './SimpleModal.svelte';
import Input from './Input.svelte';
import { accountID } from '../store';
import { SvelteEasyToast, toast } from 'svelte-easy-toast';
import { MinusSolid, PlusSolid, CircleInfoSolid } from 'svelte-awesome-icons';
  
setRoleAndUserProfile();

let buildingsOfAdmin = []
let allCompanies = [];
let allTypes = [];

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

getAllChargingTypes().then(x => {
  if (x.status == 200) {
    allTypes = x.data.Result;
    createChargingConnector = {
      serialNumber: null,
      powerOutput: null,
      chargingTypeID: allTypes[0].chargingTypeID
    };
  }
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
let selectedBuilding = null;
let companiesInBuilding = [];
let companiesLeftToChoose = [];

async function handleCompanies (building) {
  selectedBuilding = building;
  const res = await getCompaniesInBuilding(selectedBuilding.id);
  if (res.status && res.status == 200)
    companiesInBuilding = res.data.Result;
  showCompaniesModal = true;
}

async function handleRemoveCompanyAccess (companyID) {
  isRemoveCompanyAccessLoading = true;
  const res = await deleteAssignedCompanyFromBuilding(selectedBuilding.id, companyID);
  if (res.status == 200) {
    companiesInBuilding = companiesInBuilding.filter(x => x.companyID != companyID);
    isRemoveCompanyAccessLoading = false;
  } else
    showErrorToast('Napaka pri odstranjevanju podjetja.');
}

async function handleAssignCompanyAccess () {
  isAddCompanyAccessLoading = true;
  const res = await assignCompanyToBuilding(selectedBuilding.id, selectedCompanyID);
  if (res.status == 200) {
    companiesInBuilding.push(allCompanies.find(x => x.companyID == selectedCompanyID));
    companiesInBuilding = companiesInBuilding;
    isAddCompanyAccessLoading = false;
  } else
    showErrorToast('Napaka pri dodajanju podjetja.');
}

let showStationsModal = false;
function closeStationsModals () {
  showStationsModal = false;
}

let stationsForBuilding = [];
let selectedStation = null;
async function handleStations (building) {
  selectedBuilding = building;
  const res = await getAllStations(selectedBuilding.id);
  if (res.status == 200) {
    stationsForBuilding = res.data.Result;
    showStationsModal = true;
  } else
    showErrorToast('Napaka pri pridobivanju polnilnic.');
  
}

let showDeleteStationModal = false;
let isDeleteStationLoading = false;
function closeDeleteStationModal () {
  isDeleteStationLoading = 
  showDeleteStationModal = false;
}

async function handleDeleteStation (station) {
  closeStationsModals();
  selectedStation = station;
  showDeleteStationModal = true;
}

async function removeStation () {
  isDeleteStationLoading = true;
  const res = await deleteStation(selectedStation.chargingStationID);
  if (res.status == 200) {
    showSuccessToast('Polnilnica je bila uspešno izbrisana.');
    stationsForBuilding = stationsForBuilding.filter(x => x.chargingStationID != selectedStation.chargingStationID);
  } else
    showErrorToast('Napaka pri brisanju polnilnice.');
  setTimeout(() => closeDeleteStationModal(), 1000);
}


let isCreateStationLoading = false;
let showCreateStationModal = false;
function closeCreateStationModal () {
  createStationName = '';
  createChargingConnectors = [];
  createChargingConnector = {
    serialNumber: null,
    powerOutput: null,
    chargingTypeID: allTypes[0].chargingTypeID
  };
  isCreateStationLoading =
  showCreateStationModal = false;
}

let createStationName = '';
let createChargingConnectors = [];
let createChargingConnector = {};

async function handleCreateStation () {
  closeStationsModals();
  showCreateStationModal = true;
}

function handleAddConnector () {
  if (!checkConnectorFields())
    return;
  let c = {
    serialNumber: createChargingConnector.serialNumber,
    powerOutput: createChargingConnector.powerOutput,
    chargingTypeID: createChargingConnector.chargingTypeID
  }
  createChargingConnectors.push(c);
  createChargingConnectors = createChargingConnectors;
  
  createChargingConnector = {
    serialNumber: null,
    powerOutput: null,
    chargingTypeID: allTypes[0].chargingTypeID
  };
}

function handleRemoveConnector () {
  let c = createChargingConnectors.pop();
  createChargingConnector = {
    serialNumber: c.serialNumber,
    powerOutput: c.powerOutput,
    chargingTypeID: c.chargingTypeID
  };
  createChargingConnectors = createChargingConnectors;
}

async function createStation () {
  if (createStationName == null || createStationName.trim() == '') {
    showErrorToast('Ime polnilnice mora biti izpolnjeno');
    return;
  }

  if (!checkConnectorFields())
    return;
  let c = {
    serialNumber: createChargingConnector.serialNumber,
    powerOutput: createChargingConnector.powerOutput,
    chargingTypeID: createChargingConnector.chargingTypeID
  }
  createChargingConnectors.push(c);
  
  let obj = {
    buildingID: selectedBuilding.id,
    stationName: createStationName,
    chargingConnectors: createChargingConnectors 
  }

  const res = await createNewStation(obj);
  if (res.status == 200) {
    showSuccessToast('Polnilna postaja uspešno ustvarjena.');
    stationsForBuilding.push(obj);
    stationsForBuilding = stationsForBuilding;
    setTimeout(() => closeCreateStationModal(), 1000);
  } else if (res.status == 400 && res.message == "This station name already exists") {
    createStationName = '';
    handleRemoveConnector();
    showErrorToast('Ime polnilnice že obstaja. Imena morajo biti enolična med vsemi polnilnicami.');
  } else
    showGeneralErrorToast();
}

function checkConnectorFields () {
  if (createChargingConnector.serialNumber == null  || String(createChargingConnector.serialNumber).trim() == '' || 
      createChargingConnector.powerOutput == null   || String(createChargingConnector.powerOutput).trim() == '') {
    showErrorToast('Vsa polja morajo biti izpolnjena');
    return false;
  }
  
  let serialNumberInt = parseInt(createChargingConnector.serialNumber);
  let powerOutputInt = parseInt(createChargingConnector.powerOutput);
  if (isNaN(serialNumberInt) || serialNumberInt != Number(createChargingConnector.serialNumber)){
    showErrorToast('Zaporedna št. mora biti celo število.');
    createChargingConnector.serialNumber = '';
    return false;
  }
  if (isNaN(powerOutputInt) || powerOutputInt != Number(createChargingConnector.powerOutput)){
    showErrorToast('Moč mora biti število.');
    createChargingConnector.powerOutput = '';
    return false;
  }
  createChargingConnector.powerOutput = powerOutputInt;
  createChargingConnector.serialNumber = serialNumberInt;
  return checkSerialNumberUnique();
}

function checkSerialNumberUnique () {
  for (const x of createChargingConnectors) {
    if (x.serialNumber == createChargingConnector.serialNumber) {
      createChargingConnector.serialNumber = '';
      showErrorToast('Zaporedne št. konektorjev morajo biti enolične pri postaji.');
      return false;
    }
  }
  return true;
}

$: if (companiesLeftToChoose.length > 0 && !companiesLeftToChoose.some(c => c.companyID === selectedCompanyID)) {
  selectedCompanyID = companiesLeftToChoose[0].companyID;
}
$: companiesLeftToChoose = allCompanies.filter(x => !companiesInBuilding.find(y => y.companyID == x.companyID));

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
        <p>za ustvarjanje polnilnice, kliknite gumb pri določeni stavbi. Ustvarjanje polnilnice pomeni dati ji enolično ime, ter definirati vse konektorje pri polnilnici.<br>
          Če določengega tipa konektorja ni na voljo, ali za kakšrne druge težave, kontakrirajte administratorja platforme.
        </p>
        </div>
    </div><!-- Info div -->
    
    <h1 class="mt-6 m-4 text-4xl">Moje poslovne stavbe</h1>
    
      <!-- Horizontal line -->
      <div class="my-2 w-full mx-auto border-t-2 border-gray-300"></div>
          
      <div class="flex flex-col justify-center items-center w-full h-full"><!--Main div-->
        <p class="text-lg mb-2 text-wrap text-center">Tu lahko urejate katera podjetja poslujejo v posamezni stavbi
        <br> in urejate električne polnilnice pri stavbi.</p>

        {#await getBuildingOfAdminPromise}
          Pridobivam podatke....
        {:then _}
        {#if buildingsOfAdmin.length != 0}

        <div class="w-1/2 mt-4 mb-8 flex justify-center overflow-hidden rounded-lg">
          <table class="border-collapse border w-full">
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
                    <Button on:click={() => handleCompanies(b)} type='green' customClass='scale-90 px-2 py-2 w-52'>
                      Uredi podjetja
                    </Button>
                  </td>
                  <td class="border p-2 w-64 justify-between bg-inherit bg-none cursor-default text-center">                  
                    <Button on:click={() => handleStations(b)} type='green' customClass='scale-90 px-2 py-2 w-52'>
                      Uredi polnilnice
                    </Button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
                
        </div>
        {:else}
          <p class="text-xl mt-10">Hmmm, kot kaže nimate pravic do nobenega podjetja.</p>
          <p class="text-xl mt-6">Posvetuje se z administratorjem stavbe ali pa z administratorjem platforme.</p>
        {/if}
        {/await}
   
    </div><!--Main div-->
    
    <SimpleModal show={showCompaniesModal} customInnerClass='w-5/12'><!-- Companies modal -->
      <div class="flex-col items-center flex justify-center">
        <h2 class="text-2xl m-4">Podjetja, ki poslujejo v stavbi:</h2>
        
        <!-- Existing Building Accesses content -->
        <div class="overflow-hidden rounded-lg  m-2">
          {#if companiesInBuilding.length != 0}
          <table class="border-collapse border w-full">
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
    </SimpleModal><!-- Companies modal -->

    <SimpleModal show={showStationsModal} customInnerClass='w-7/12'><!-- All stations modal -->
      <div class="flex-col items-center flex justify-center">
        <h2 class="text-3xl m-4">Električne polnilnice pri stavbi {selectedBuilding.building_name}:</h2>
        <div class="flex justify-between items-center w-1/3">
          <p class="text-2xl">Št. polnilnic: {stationsForBuilding.length}</p>
          <Button type='green' customClass='scale-90 right-0  p-2' on:click={() => handleCreateStation()}
            isLoading='{isRemoveCompanyAccessLoading}'>
              Dodaj polnilnico
            </Button>
        </div>
        
        <div class="my-3 w-full mx-auto border-t-2 border-gray-300" />
        <!-- Existing Building Accesses content -->
        <div>
          {#if stationsForBuilding.length != 0}
          
          {#each stationsForBuilding as s (s.chargingStationID)}  
            
          <div class="m-2 flex justify-between w-full">
            <div class="">
              <p class="text-xl">Ime polnilnice: <b>{s.chargingStationName}</b></p>
              <p class="text-xl">Št. konektorjev: <b>{s.chargingConnectors.length}</b></p>
            </div>
            <div class="">
              <Button type='red' customClass='scale-90 right-0  p-2' on:click={() => handleDeleteStation(s)}
              isLoading='{isRemoveCompanyAccessLoading}'>
                Zbriši polnilnico
              </Button>
            </div>
          </div>
          
          <div class="m-2 w-full mb-4 rounded-lg overflow-hidden"><!-- Table div -->
          <table class="border-collapse w-full">
            <thead class="bg-blue-400">
              <tr>
                <th class="border p-2">Zaporedna št. konektorja:</th>
                <th class="border p-2">Moč konektorja:</th>
                <th class="border p-2">Tip konektorja:</th>
              </tr>
            </thead>
            <tbody>
              {#each s.chargingConnectors as c (c.chargingConnectorID)}
              <tr key={c.chargingConnectorID}>
                <td class="border p-2">{c.chargingConnectorSerialNumber}</td>
                <td class="border p-2">{c.chargingConnectorPowerOutput}</td>
                <td class="border p-2">{c.chargingType.chargingType}</td>
              </tr>
              {/each}
            </tbody>
          </table>
          </div><!-- Table div -->

          <div class="my-4 w-full mx-auto border-t-2 border-gray-300" />

          {/each}
          {:else}
            <p class="text-lg">Pri stavbi ni nobenih polnilnic.</p>
          {/if}
        </div>
  
        <Button on:click={closeStationsModals} type='red' customClass='min-w-48 m-2 p-2'>
          Izhod
        </Button>
      </div>
    </SimpleModal><!-- All stations modal -->
  
    <SimpleModal show={showDeleteStationModal} customInnerClass='w-5/12 flex p-0 justify-center'><!-- Delete station modal -->
      <div class=" z-10 flex-col items-center flex text-center">
        <h2 class="text-2xl m-4 mb-2">Pravkar boste izbrisali polnilnico: <br>{selectedStation.chargingStationName}</h2>
        <p class="m-4 text-2xl">Ali res želite to storiti?</p>
        <div class="flex m-2 mb-4 items-center justify-between w-full px-4">
          <Button on:click={() => removeStation()} isLoading='{isDeleteStationLoading}' type='green' customClass='m-2 p-2 min-w-48'>
            Izbriši
          </Button>
          <Button on:click={() => closeDeleteStationModal()} type='red' customClass='m-2 p-2 min-w-48'>
            Prekliči
          </Button>
        </div>
      </div>
    </SimpleModal><!-- Delete station modal -->

    <SimpleModal show={showCreateStationModal} customInnerClass='w-6/12 flex p-0 justify-center'><!-- Create station modal -->
      <div class=" z-10 flex-col items-center flex text-center"><!-- Master div -->
        <h2 class="text-2xl m-4 mb-2">Ustvarjanje nove polnilnice pri stavbi {selectedBuilding.building_name}:</h2>

        <div class="justify-between flex items-center"><!-- "Polnilnica"+input -->
          <p class="text-xl">Polnilnica:</p>
          <Input placeholder='Vnesi ime polnilnice' bind:value={createStationName} type="text" customClass='mx-4'/>
        </div><!-- 'Polnilnica' + ime -->
        
        <p class="text-xl my-2">Konektorji: {createChargingConnectors.length + 1}x</p>
        {#each createChargingConnectors as c}
          <ConnectorInfoComponent serialNumber={c.serialNumber} powerOutput={c.powerOutput} chargingType={allTypes.find(x => x.chargingTypeID == c.chargingTypeID)}/>
        {/each}

        <div class="flex-col border-2 rounded-lg"><!-- Connector component -->
          <div class="px-2 justify-between flex items-center"><!-- "Zaporedna"+input -->
            <p class="text-l">Zaporedna št.:</p>
            <Input placeholder='Npr. 1' bind:value={createChargingConnector.serialNumber} type="text" customClass='mx-4'/>
          </div><!-- "Zaporedna"+input -->
          <div class="px-2 justify-between flex items-center"><!-- "Moč"'input '-->
            <p class="text-l">Moč konektorja:</p>
            <Input placeholder='V kWh, celo število, npr. 25' bind:value={createChargingConnector.powerOutput} type="text" customClass='mx-4'/>
          </div><!-- "Moč"'input '-->
          <div class="px-2 justify-between flex items-center"><!-- "Tip"+select-->
            <p class="text-l">Tip konektorja:</p>
            <select bind:value={createChargingConnector.chargingTypeID} class="w-96 my-2 mx-6 border-2 bg-white border-black rounded-lg px-6 py-2 cursor-pointer">
              {#each allTypes as t (t.chargingTypeID)}
                <option value={t.chargingTypeID} class="bg-white hover:bg-blue-300 ">
                {t.chargingType}
                </option>
              {/each}
            </select>
          </div><!-- "Tip"+select -->
        </div><!-- Connector component -->

      <div class="flex items-center"><!-- + in - -->
        <Button on:click={() => handleAddConnector()} isLoading='{false}' type='green' customClass='m-2 p-2 w-18 text-center'>
          <PlusSolid color='white'/>
        </Button>
        {#if createChargingConnectors.length != 0}
        <Button on:click={() => handleRemoveConnector()} isLoading='{false}' type='red' customClass='m-2 p-2 w-18 text-center'>
          <MinusSolid color='white'/>
        </Button>
        {/if}
      </div><!-- + in - -->

      <div class="flex items-center justify-between w-4/5 px-12 my-4"><!-- Save & quit -->
        <Button on:click={() => createStation()} isLoading='{isCreateStationLoading}' type='green' customClass='m-2 p-2 min-w-48'>
          Shrani
        </Button>
        <Button on:click={() => closeCreateStationModal()} type='red' customClass='m-2 p-2 min-w-48'>
          Izhod
        </Button>
      </div><!-- Save & quit -->
    </div><!-- Master div -->
    </SimpleModal><!-- Create station modal -->

  
  </div><!--Master div-->
  