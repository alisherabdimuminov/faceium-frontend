<script setup lang="ts">
import { LucidePartyPopper } from 'lucide-vue-next';


definePageMeta({
    layout: "empty" 
});
useHead({
    title: "Davomatdan o'tdingiz"
});
</script>

<template>
    <div class="w-full h-screen flex flex-col gap-10 items-center justify-center">
        <img class="w-32 h-32" src="/assets/images/passed.gif" alt="">
        <p class="flex items-center gap-3 text-2xl text-cyan-500 font-bold"><LucidePartyPopper :size="30" /> Davomatdan o'tdingiz</p>
        <Button @click="navigateTo('/')">Ortga</Button>
    </div>
</template>