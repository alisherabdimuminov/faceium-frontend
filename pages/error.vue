<script setup lang="ts">
import { LucidePartyPopper } from 'lucide-vue-next';


const errorStore = useErrorStore();

const { error, code } = storeToRefs(errorStore);

if (error.value === null) {
    navigateTo({ name: "index" });
}
</script>

<template>
    <div class="flex flex-col gap-5">
        <div class="flex flex-col gap-5" v-if="code === '110'">
            <img src="/assets/images/passed.gif" alt="">
            <p class="flex gap-2 items-center text-cyan-500 text-2xl"><LucidePartyPopper /> {{ error }}</p>
            <Button @click="navigateTo({ name: 'index' })">Ortga</Button>
        </div>
        <div class="flex flex-col gap-5" v-else>
            <img src="/assets/images/error.gif" alt="">
            <p class="text-red-500 text-2xl">{{ error }}</p>
            <Button @click="navigateTo({ name: 'faceid' })">Qayta urinib ko'rish</Button>
        </div>
    </div>
</template>
