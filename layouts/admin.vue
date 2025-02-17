<script setup lang="ts">
import { LucideBuilding, LucideBuilding2, LucideHome, LucideIdCard, LucideLogOut, LucideUser2, LucideUsers2 } from 'lucide-vue-next';


const { user, logout } = useAuth();

</script>

<template>
    <div class="h-screen">
        <header class="h-[3rem] border-b p-2 flex items-center justify-between">
            <div>
                <p class="text-lg font-bold">Faceium</p>
            </div>
            <div></div>
            <div>
                <ClientOnly v-if="user">
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <img v-if="user.image" :src="user.image" :alt="user.uuid">
                            <LucideUser2 v-else />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent class="w-64">
                            <DropdownMenuItem>
                                <LucideIdCard :size="15" />
                                {{ user.username }}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <LucideUser2 :size="15" />
                                {{ user.first_name }} {{ user.last_name }}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <LucideBuilding :size="15" />
                                {{ user.department }}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <LucideBuilding2 :size="15" />
                                {{ user.position }}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem @click="logout">
                                <LucideLogOut :size="15" />
                                Chiqish
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </ClientOnly>
            </div>
        </header>
        <div class="h-[calc(100%-3.1rem)] w-full flex">
            <div class="h-full w-14 border-r flex flex-col items-center p-2">
                <div>
                    <LucideHome />
                </div>
                <div>
                    <LucideUsers2 />
                </div>
            </div>
            <ScrollArea class="h-full">
                <slot />
            </ScrollArea>
        </div>
    </div>
</template>