<script>
import UsersForCAdminComponent from './../../components/UsersForCAdminComponent.svelte';
import UsersForPAdminComponent from '../../components/UsersForPAdminComponent.svelte';
import { accountRole } from '../../store';
</script>
  
{#if $accountRole.length == 1 && $accountRole.includes('cadmin')}
<UsersForCAdminComponent />
{:else if $accountRole.length == 1 && $accountRole.includes('padmin')}
<UsersForPAdminComponent />
{:else}
Under Construction
{/if}
