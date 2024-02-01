<script>
import { getAllUsers, getAllCompanies, getRolesOfUser, getCompanyDataOfAdmin, assignCompanyAdmin, deleteCompanyAdmin } from '$lib';
import Button from './Button.svelte';
import { accountID } from '../store';
import { SvelteEasyToast, toast } from 'svelte-easy-toast';
import SimpleModal from './SimpleModal.svelte';

let users = [];
let filteredList = [];
let userToRoleMap = new Map();

const allUsersPromise = getAllUsers().then(async x => {
  if (x.status && x.status == 200 && x.data.Result != undefined) {
    users = x.data.Result.filter(x => x.company_name == undefined);
    filteredList = users;
    for (const x of users){
      const res = await getRolesOfUser(x.id);
      const role = res.data.Roles ?? [];
      userToRoleMap.set(x.id, role);
    }
  } else
    showGeneralErrorToast();
});

let allCompanies = [];
getAllCompanies().then(x => {
  if (x.status == 200)
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

let showCompanyAdminModal = false;
let isAssigningCompanyLoading = false;
let isRemovingCompanyAdminLoading = false;

function closeCompanyAdminModal() {
  selectedUser = null;
  isAssigningCompanyLoading =
  showCompanyAdminModal = false;
}

let selectedUser;

let selectedCompanyID;
let companyOfAdmin;

let searchKeyword = '';
$: filteredList = users.filter((x) => x.username.includes(searchKeyword.trim()));

async function handleCompanyAdminModal (user) {
  await getCompanyDataOfAdmin(user.id).then(x => {
    if (x.status == 200)
      companyOfAdmin = x.data.Result;
    else
      showGeneralErrorToast();
  });
  selectedUser = user;
  showCompanyAdminModal = true;
} 

async function assignUserToCompany () {
  isAssigningCompanyLoading = true;
  const res = await assignCompanyAdmin(selectedUser.id, selectedCompanyID);
  if (res.status == 200){
    const obj = allCompanies.find(x => x.companyID == selectedCompanyID);
    companyOfAdmin = {id: obj.companyID, company_name: obj.companyName};
    userToRoleMap.set(selectedUser.id, ['cadmin']);
    userToRoleMap = userToRoleMap;
  } else
    showErrorToast('Napaka pri dodeljevanju pravic.');
  isAssigningCompanyLoading = false;
}

async function removeCompanyAdmin () {
  isRemovingCompanyAdminLoading = true;
  const res = await deleteCompanyAdmin(selectedUser.id);
  if (res.status == 200) {
    companyOfAdmin = null;
    userToRoleMap.set(selectedUser.id, []);
    userToRoleMap = userToRoleMap;
  }
  else
    showErrorToast('Napaka pri odstranjevanju pravic.');
  isRemovingCompanyAdminLoading = false;
}


function mapToMessage (word) {
  switch (word) {
    case "padmin":
      return 'Administrator platforme';
    case "badmin":
      return 'Administrator stavbe';
    case "cadmin":
      return 'Administrator podjetja';
    default:
      return 'Ni dodeljena';
  }
}

</script>
<SvelteEasyToast />

<!--Master div-->
<div class="flex flex-col justify-center items-center">
    <h1 class="mt-6 m-2 text-4xl">Pregled Uporabnikov</h1>

    <!--Top part-->
    <div class="mt-4 mb-2 flex w-3/5 items-center justify-center">
      <!--Search field div-->
      <div class="flex border w-2/5 border-blue-200 rounded">
            <input
                type="text"
                bind:value={searchKeyword}
                class="block w-full px-4 py-2  bg-white border rounded-md focus:border-blue-400 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
                placeholder="Išči uporabniško ime..."
            />
        </div><!--Search field div-->
    </div><!--Top part-->
    
    <!--Horizontal line-->
    <div class="my-4 w-full mx-auto border-t-2 border-gray-300"></div>
    
    {#await allUsersPromise}
    Pridobivam podatke....
    {:then _} 

    <!--Main table div-->
    <div class="flex justify-center w-3/5 mb-8 overflow-hidden rounded-lg">
        <table class="border-collapse border w-full">
          <thead class="bg-blue-400">
            <tr>
              <th class="border p-2">Uporabniško ime:</th>
              <th class="border p-2">E-poštni naslov:</th>
              <th class="border p-2">Vloga:</th>
              <th class="border p-2">Akcija:</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredList as user (user.id)}
              {#if user.id != $accountID}
              <tr key={user.id} class="border p-2">
                <td class="border p-2 py-4">{user.username}</td>
                <td class="border p-2">{user.email_account}</td>
                <td class="border p-2">
                  {mapToMessage(userToRoleMap.get(user.id)[0])}
                </td>
                <td class="border w-64 justify-between bg-inherit bg-none cursor-default text-center">
                  {#if userToRoleMap.get(user.id)[0] == undefined}
                  <Button on:click={() => handleCompanyAdminModal(user)} type='green' customClass='my-1 scale-90 px-2 py-2 w-64'>
                    Naredi administratorja podjetja
                  </Button>
                  {:else if userToRoleMap.get(user.id)[0] == 'cadmin'}
                  <Button on:click={() => handleCompanyAdminModal(user)} type='orange' customClass='my-1 scale-90 px-2 py-2 w-64'>
                    Uredi administratorja podjetja
                  </Button>
                  {/if}
                </td>
              </tr>
              {/if}
            {/each}
          </tbody>
        </table>          
      </div><!--Main table div-->
    {/await}


    <!--Modals-->
    <SimpleModal show={showCompanyAdminModal} close={closeCompanyAdminModal} customInnerClass='w-5/12'>
      <div class="flex-col items-center flex justify-center">
        <h2 class="text-2xl m-4">Pravice za uporabnika: {selectedUser.username}</h2>
        
        <!-- Existing company access content -->
        <div class="mx-6 flex items-center justify-center m-2 w-10/12 overflow-hidden rounded-lg">
          {#if companyOfAdmin != null}
          <table class="border-collapse border w-full">
            <thead class="bg-blue-400">
              <tr>
                <th class="border p-2">Ime podjetja:</th>
                <th class="border p-2">Akcija:</th>
              </tr>
            </thead>
            <tbody>
                <tr key={companyOfAdmin.id}>
                  <td class="border p-2">{companyOfAdmin.company_name}</td>
                  <td class="border p-2 flex justify-center items-center">
                    <Button type='red' customClass='scale-90 mx-2 p-2' on:click={removeCompanyAdmin}
                    isLoading='{false}'>
                      Odstrani pravice
                    </Button>
                  </td>
                </tr>
            </tbody>
          </table>
          {:else}
            <p class="text-lg">Oseba nima pravic do nobenega podjetja.</p>
          {/if}
        </div>
  
        <!-- Horizontal line -->
        <div class="my-4 w-full mx-auto border-t-2 border-gray-300"></div>
  
        <!-- Add company rights content -->
        <div class=" flex-col items-center flex">
          <p class="text-2xl">Dodaj pravice do podjetja:</p>
        {#if companyOfAdmin == null}
          <div class="flex items-center justify-between w-full px-4">
            <select bind:value={selectedCompanyID} class=" w-96 m-2 border-2 bg-white border-black rounded-lg px-4 py-2">
              {#each allCompanies as c (c.companyID)}
                <option value={c.companyID} class="bg-white hover:bg-blue-300 ">
                {c.companyName}
                </option>
              {/each}
            </select>
  
            <Button on:click={assignUserToCompany} isLoading='{isAssigningCompanyLoading}' type='green' customClass='m-4 p-2 w-36 text-center'>
              Dodaj
            </Button>
          </div>
        {:else}
          <p class="text-lg">Oseba je že administrator.</p>
        {/if}
        </div>
  
        <Button on:click={closeCompanyAdminModal} type='red' customClass='min-w-48 m-4 p-2'>Izhod</Button>
      </div>
    </SimpleModal>


</div><!--Master div-->
