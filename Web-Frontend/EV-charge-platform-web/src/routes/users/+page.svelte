<script>
import { setRoleAndUserProfile } from '$lib';
import UsersForCAdminComponent from './../../components/UsersForCAdminComponent.svelte';
import UsersForPAdminComponent from '../../components/UsersForPAdminComponent.svelte';
import UsersForBAdminComponent from '../../components/UsersForBAdminComponent.svelte';
import { accountRole } from '../../store';

</script>

{#await setRoleAndUserProfile() then}

{#if $accountRole.length == 1 && $accountRole.includes('cadmin')}
<UsersForCAdminComponent />
{:else if $accountRole.length == 1 && $accountRole.includes('padmin')}
<UsersForPAdminComponent />
{:else if $accountRole.length == 1 && $accountRole.includes('badmin')}
<UsersForBAdminComponent />
{:else}
Under Construction
{/if}


{/await}