<script setup lang="ts">
import Toaster from './components/ui/toast/Toaster.vue';
import { Toaster as Sonner } from 'vue-sonner';
</script>


<template>
    <Toaster />
    <Sonner />
    <div>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>
