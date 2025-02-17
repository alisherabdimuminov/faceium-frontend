<script setup lang="ts">
import { LucideBuilding, LucideBuilding2, LucideHome, LucideIdCard, LucideLogOut, LucideUser2, LucideUsers2 } from 'lucide-vue-next';


const { user, logout } = useAuth();

</script>

<template>
    <div class="h-screen w-full flex flex-col items-center justify-center">
        <slot />
    </div>
</template>