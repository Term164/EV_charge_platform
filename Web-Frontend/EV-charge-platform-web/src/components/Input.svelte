<script>
    export let placeholder
    export let value
    export let customClass = '';
</script>

<div class="relative m-2">
    <input bind:value id={placeholder} name={placeholder} {...$$restProps} placeholder={placeholder}
        class=" w-96  bg-white rounded-3xl border-2 border-black focus:ring-2 focus:ring-blue-600 text-base outline-none text-black py-1 px-9 leading-8 {customClass}">
</div>