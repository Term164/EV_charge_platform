<script>
import Button from './Button.svelte';
import { getCompanyAdmins, getBuildingAdmins, getAllBuildings, deleteCompanyAdmin, assignBuildingAdmin, deleteBuildingAdmin } from '$lib';
import SimpleModal from './SimpleModal.svelte';
import A from './A.svelte';

let buildingAdminsAllData = [];
const getBuildingAdminsPromise = getBuildingAdmins().then(x => {
  if (x.status && x.status == 200)
    buildingAdminsAllData = x.data.result;
  else
    showGeneralErrorToast();
});
  
const getCompanyAdminsPromise = getCompanyAdmins().then(x => {
  if (x.status && x.status == 200)
    companyAdmins = x.data.result;
  else
    showGeneralErrorToast();
});

getAllBuildings().then((x) => {
  if (x.status && x.status == 200)
    allBuildings = x.data.Result;
  else
    showGeneralErrorToast();
});

let showBuildingAdminModal = false;
let isAssigningBuildingLoading = false;
let isRemovingBuildingAdminLoading = false;

function closeBuildingAdminModal() {
  selectedUser = null;
  isAssigningBuildingLoading = 
  showBuildingAdminModal = false;
}

let companyAdmins = [];
let allBuildings = [];


let isRemoveCompanyAdminLoading = false;

let selectedUser;

let selectedBuildingID;

let buildingsOfAdmin = [];
let buildingsLeftToChoose = [];

let uniqueUsers = [];
$: {
  let map = new Map();
  buildingAdminsAllData.forEach(ba_pair =>{
    map.set(ba_pair.account.id, ba_pair.account);
  });
  uniqueUsers = Array.from(map.values());
}


function handleBuildingAdminModal (user) {
  buildingsOfAdmin = buildingAdminsAllData.filter(x => x.account.id == user.id).map(x => x.building);
  selectedUser = user;
  showBuildingAdminModal = true;
}

async function assignUserToBuilding () {
  isAssigningBuildingLoading = true;
  const res = await assignBuildingAdmin(selectedUser.id, selectedBuildingID);
  if (res.status == 200){
    const obj = allBuildings.find(x => x.buildingID == selectedBuildingID);
    buildingsOfAdmin.push({id: obj.buildingID, building_name: obj.buildingName, building_location: obj.buildingLocation});
    buildingsOfAdmin = buildingsOfAdmin;
    
    buildingAdminsAllData.push({
      account: {id: selectedUser.id, username: selectedUser.username, email_account: selectedUser.email_account},
      building: {id: obj.buildingID, building_name: obj.buildingName, building_location: obj.buildingLocation}
    });
    buildingAdminsAllData = buildingAdminsAllData;
  } else
    showErrorToast('Napaka pri dodeljevanju pravic.');
  isAssigningBuildingLoading = false;
}

async function removeUserFromBuilding (buildingID) {
  isRemovingBuildingAdminLoading = true;
  const res = await deleteBuildingAdmin(selectedUser.id, buildingID);
  if (res.status == 200) {
    buildingsOfAdmin = buildingsOfAdmin.filter(x => x.id != buildingID);
    if (buildingsOfAdmin.length == 0)
      buildingAdminsAllData = buildingAdminsAllData.filter(x => x.account.id != selectedUser.id && x.building.id != buildingID);
  }
  else
    showErrorToast('Napaka pri odstranjevanju pravic.');
  isRemovingBuildingAdminLoading = false;
}

async function handleRemoveCompanyAdmin (userID) {
  isRemoveCompanyAdminLoading = true;
  const res = await deleteCompanyAdmin(userID);
  if (res.status == 200) {
    companyAdmins = companyAdmins.filter(x => x.account.id != userID);
    isRemoveCompanyAdminLoading = false;
  } else
  showErrorToast('Napaka pri odstranjevanju pravic.');
}


$: if (buildingsLeftToChoose.length > 0 && !buildingsLeftToChoose.some(b => b.buildingID === selectedBuildingID)) {
  selectedBuildingID = buildingsLeftToChoose[0].buildingID;
}
$: buildingsLeftToChoose = allBuildings.filter(x => !(buildingsOfAdmin.find(y => y.id == x.buildingID)));
</script>

<!--Master div-->
<div class="flex flex-col justify-center items-center">
    <h1 class="m-4 text-4xl">Vsi administratorji</h1>
    <!-- Horizontal line -->
    <div class="my-2 w-full mx-auto border-t-2 border-gray-300"></div>
    <!--Main div that gets split-->
    <div class="flex justify-center w-full h-full">
      <!--Left half-->
      <div class="w-1/2 flex-col items-center flex ">
          
      <h1 class="text-3xl m-2 mb-2 justify-self-center">Administratorji stavb</h1>

      {#await getBuildingAdminsPromise}
        Pridobivam podatke....
      {:then _}
      {#if buildingAdminsAllData.length != 0}
        <p class="text-lg mb-4">Administrator stavbe skrbi za eno ali več poslovnih stavb.</p>
      <!--Table div-->
      <div class="w-full px-20">
        <table class="border-collapse border m-2 w-full">
          <thead class="bg-blue-400">
            <tr>
              <th class="border p-2">Uporabniško ime:</th>
              <th class="border p-2">E-poštni naslov:</th>
              <th class="border p-2">Akcija:</th>
            </tr>
          </thead>
          <tbody>
            {#each uniqueUsers as ba (ba.id)}
              <tr key={ba.id} class="border p-2">
                <td class="border p-2">{ba.username}</td>
                <td class="border p-2">{ba.email_account}</td>
                <td class="border p-2 w-64 justify-between bg-inherit bg-none cursor-default text-center">
                  <Button on:click={() => handleBuildingAdminModal(ba)} type='orange' customClass='scale-90 px-2 py-2 w-52'>
                    Uredi pravice
                  </Button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table> 
      </div><!--Table div-->
      {:else}
        <p class="text-lg mb-2">Hmmm, kot kaže ni nobenega.</p>
        <p class="text-lg mt-8">Za dodajanje administratorjev, pojdite pod zavihek <A href='/users'>Pregled Uporabnikov</A></p>
      {/if}
      {/await}
    </div><!--Left half-->

    <!-- Vertical line -->
    <div class="mx-4 my-0 border-r-2 border-gray-300 min-h-screen flex-grow "></div>
    
    <!--Right half-->
    <div class="w-7/12 flex-col items-center flex ">
      <h1 class="m-2 mb-2 text-3xl justify-self-center">Administratorji podjetij</h1>

      {#await getCompanyAdminsPromise}
        Pridobivam podatke....
      {:then _}
      {#if companyAdmins.length != 0}
        <p class="text-lg mb-4">Administrator podjetja skrbi za samo eno podjetje.</p>
      <!--Table div-->
      <div class="w-full px-10">
        <table class="border-collapse border w-full">
          <thead class="bg-blue-400">
            <tr>
              <th class="border p-2">Uporabniško ime:</th>
              <th class="border p-2">E-poštni naslov:</th>
              <th class="border p-2">Podjetje:</th>
              <th class="border p-2">Akcija:</th>
            </tr>
          </thead>
          <tbody>
            {#each companyAdmins as ca (ca.account.id)}
            <tr key={ca.account.id} class="border p-2">
              <td class="border p-2">{ca.account.username}</td>
              <td class="border p-2">{ca.account.email_account}</td>
              <td class="border p-2">{ca.company.company_name}</td>
              <td class="border p-2 w-64 justify-between bg-inherit bg-none cursor-default text-center">
                <Button on:click={() => handleRemoveCompanyAdmin(ca.account.id)} type='red' isLoading='{isRemoveCompanyAdminLoading}' customClass='scale-90 px-2 py-2 w-52'>
                  Odstrani pravice
                </Button>
              </td>
            </tr>
            {/each}
          </tbody>
        </table>
      </div><!--Table div-->
      {:else}
        <p class="text-lg mb-2">Hmmm, kot kaže ni nobenega.</p>
        <p class="text-lg mt-8">Za dodajanje administratorjev, pojdite pod zavihek <A href='/users'>Pregled Uporabnikov</A></p>
      {/if}
      {/await}
    </div><!--Right half-->

    <!--Modal-->
    <SimpleModal show={showBuildingAdminModal} customInnerClass='w-5/12'>
      <!--Master div-->
      <div class="flex-col items-center flex justify-center">
        <h2 class="text-2xl m-4">Pravice za uporabnika: {selectedUser.username}</h2>
        
        <!-- Existing Building Accesses content -->
        <div class="mx-6 w-full flex items-center justify-center">
          {#if buildingsOfAdmin.length != 0}
          <table class="border-collapse border m-2 w-full">
            <thead class="bg-blue-400">
              <tr>
                <th class="border p-2">Ime stavbe:</th>
                <th class="border p-2">Lokacija stavbe:</th>
                <th class="border p-2">Akcija:</th>
              </tr>
            </thead>
            <tbody>
              {#each buildingsOfAdmin as b (b.id)}
                <tr key={b.id}>
                  <td class="border p-2">{b.building_name}</td>
                  <td class="border p-2">{b.building_location}</td>
                  <td class="border p-2 w-64 justify-between bg-inherit bg-none cursor-default text-center">
                    <Button type='red' customClass='scale-90 mx-2 p-2' on:click={() => removeUserFromBuilding(b.id)}
                    isLoading='{isRemovingBuildingAdminLoading && selectedBuildingID == b.id}'>
                      Odstrani pravice
                    </Button>
                  </td>
                </tr>
              {/each}                  
            </tbody>
          </table>
          {:else}
            <p class="text-lg">Oseba nima nobenih pravic.</p>
          {/if}
        </div><!--Table div-->
  
        <!-- Horizontal line -->
        <div class="my-4 w-full mx-auto border-t-2 border-gray-300"></div>
  
        <!-- Add Building Access content -->
        <div class=" flex-col items-center flex"><!--Lower half div-->
          <p class="text-2xl">Dodaj uporabniku pravico do poslovne stavbe:</p>
          {#if buildingsLeftToChoose.length != 0}
          <div class="flex items-center justify-between w-full px-4">
            <select bind:value={selectedBuildingID} class=" w-96 m-2 border-2 bg-white border-black rounded-lg px-4 py-2">
              {#each buildingsLeftToChoose as b (b.buildingID)}
                <option value={b.buildingID} class="bg-white hover:bg-blue-300 ">
                {b.buildingName}
                </option>
              {/each}
            </select>
  
            <Button on:click={assignUserToBuilding} isLoading='{isAssigningBuildingLoading}' type='green' customClass='m-4 w-36 p-2 text-center'>
              Dodaj
            </Button>
          </div>
        {:else}
          <p class="text-lg">Oseba že ima vse pravice.</p>
        {/if}
        </div><!--Lower half div-->
  
        <Button on:click={closeBuildingAdminModal} type='red' customClass='min-w-48 p-2 m-4'>
          Izhod
        </Button>
      </div><!--Master div-->
    </SimpleModal>


    </div><!--Main div, split into half-->

</div> <!--Master div-->

