<script>
import Input from "./Input.svelte";
export let serialNumber;
export let powerOutput;
export let chargingType;

</script>

<div class="mb-2 flex-col border-2 rounded-lg"><!-- Connector component -->
    <div class="px-2 justify-between flex items-center"><!-- "Zaporedna"+input -->
        <p class="text-l">Zaporedna št.:</p>
        <Input disabled placeholder='Npr. 1' value={serialNumber} type="text" customClass='bg-gray-200 mx-4'/>
    </div><!-- "Zaporedna"+input -->
    <div class="px-2 justify-between flex items-center"><!-- "Moč"'input '-->
        <p class="text-l">Moč konektorja:</p>
        <Input disabled placeholder='V kWh, celo število, npr. 25' value={powerOutput} type="text" customClass='bg-gray-200 mx-4'/>
    </div><!-- "Moč"'input '-->
    <div class="px-2 justify-between flex items-center"><!-- "Tip"+select-->
        <p class="text-l">Tip konektorja:</p>
        <select disabled value={chargingType.chargingTypeID} class="w-96 my-2 mx-6 border-2 bg-gray-100 border-black rounded-lg px-6 py-2">
            <option value={chargingType.chargingTypeID} class="bg-white hover:bg-blue-300 ">
            {chargingType.chargingType}
            </option>
        </select>
    </div><!-- "Tip"+select -->
</div><!-- Connector component -->