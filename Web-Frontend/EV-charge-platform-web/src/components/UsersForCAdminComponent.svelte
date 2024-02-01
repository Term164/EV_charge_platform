<script>
import { getAllUsers, getCompanyDataOfAdmin, assignUserToCompany } from '$lib';
import Button from './Button.svelte';
import { accountID, accountCompanyID, accountCompanyName } from '../store';
import { SvelteEasyToast, toast } from 'svelte-easy-toast';

const allUsersPromise = getAllUsers().then(x => {
  if (x.status && x.status == 200 && x.data.Result != undefined){
      users = x.data.Result;
      filteredList = users;
  }
});

getCompanyDataOfAdmin($accountID).then(x => {
  if (x.status && x.status == 200 && x.data.Result != undefined){
    accountCompanyID.set(x.data.Result.id);
    accountCompanyName.set(x.data.Result.company_name);
    users = users.filter(x => x.company_id == null || x.company_id == $accountCompanyID);
  } else {
    showGeneralErrorToast();
  }
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

let users = [];
let searchKeyword = '';
let filteredList = [];
$: filteredList = users.filter((x) => x.username.includes(searchKeyword.trim()));

let selectedUserRow;

let isUserAssigningLoading = false;    


async function assignUser (userID) {
  isUserAssigningLoading = true;
  selectedUserRow = userID;
  const assignResult = await assignUserToCompany(userID, $accountCompanyID);
  if (assignResult.status == 200){
    users[ users.findIndex(x => x.id == userID) ].company_name = $accountCompanyName;
    filteredList = users;
    showSuccessToast('Ne pozabite osebi dodeliti dostope.');
  } else {
    showErrorToast('Napaka pri dodeljevanju osebe v podjetje.');
  }
  selectedUserRow = null;
  isUserAssigningLoading = false;
}

</script>
<SvelteEasyToast />  

<div class="flex flex-col justify-center items-center">
    <h1 class="mt-6 m-2 text-4xl">Pregled Uporabnikov</h1>

    <div class="mt-4 mb-2 flex w-3/5 items-center justify-center">
        <div class="flex border w-2/5 border-blue-200 rounded">
            <input
                type="text"
                bind:value={searchKeyword}
                class="block w-full px-4 py-2  bg-white border rounded-md focus:border-blue-400 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
                placeholder="Išči uporabniško ime..."
            />
        </div>
    </div>
    
    <div class="my-4 w-full mx-auto border-t-2 border-gray-300"></div>
    
    {#await allUsersPromise}
    Pridobivam podatke....
    {:then _} 
          
    <div class="flex w-3/5 mb-8 overflow-hidden rounded-lg">
        <table class="border-collapse border w-full">
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
                <td class="border p-2">{user.rfid == undefined || user.rfid == '' ? 'Ni nastavljeno' : user.rfid}</td>
                <td class="border p-2">{user.company_name != undefined ? user.company_name : 'Ni dodeljeno'}</td>
                <td class="border w-64 bg-inherit bg-none cursor-default text-center">
                {#if user.company_name == undefined}
                  <Button type='green' customClass='my-1 scale-90 px-2 py-2'
                  on:click={() => assignUser(user.id, $accountCompanyID)}
                  isLoading='{isUserAssigningLoading && user.id == selectedUserRow}'>
                    Dodaj v podjetje
                  </Button>
                {/if}
                </td>
              </tr>
              {/if}
            {/each}
          </tbody>
        </table>
          
      </div>
    
    {/await}

</div>
