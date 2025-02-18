<script setup lang="ts">
import { LucideCheck, LucideChevronRight, LucideIdCard, LucideLoader, LucideMapPin, LucideMonitor, LucideMoon, LucideScanFace, LucideSun, LucideTriangleAlert, LucideX } from 'lucide-vue-next';
import type { IResponse } from '~/types';
import { apify } from '~/utils';


const colorMode = useColorMode();
colorMode.preference = "dark";

const { encode, decode, jsonify } = useSecrets();

const dataStore = useDataStore();

const { handle: h, latitude: lat, longitude: lon, area  } = storeToRefs(dataStore);

const isLoading = ref(true);
const isWaiting = ref(true);
const longitude = ref(0);
const latitude = ref(0);
const status = ref<"waiting" | "success" | "not_in_area" | "cannot_get">("waiting");
const handleStatus = ref<"not_found" | "available" | "waiting">("waiting");
const state = ref<"location" | "handle">("location");
const handle = ref("");
const name = ref("");


const success = async (position: GeolocationPosition) => {
    latitude.value = position.coords.latitude;
    longitude.value = position.coords.longitude;

    let response = await $fetch<IResponse>(apify("location"), {
        method: "POST",
        body: JSON.stringify({
            "data": encode(JSON.stringify({
                "latitude": latitude.value,
                "longitude": longitude.value,
            }))
        })
    });

    if (response.status === "error") {
        status.value = "not_in_area";
    } else {
        console.log(response.data);
        let decoded = jsonify<{ area: number }>(decode(response.data));
        if (decoded) {
            dataStore.setArea(decoded.area);
        }
        status.value = "success";
        dataStore.setLatitude(latitude.value);
        dataStore.setLongitude(longitude.value);
    }

    isLoading.value = false;
}

const error = (err: GeolocationPositionError) => {
    status.value = "cannot_get";
    isLoading.value = false;
    status.value = 'cannot_get';
}

const checkHandle = async () => {
    let response = await $fetch<IResponse>(apify("handle"), {
        method: "POST",
        body: JSON.stringify({
            "data": encode(JSON.stringify({
                "handle": handle.value,
            }))
        })
    });

    if (response.status === "error") {
        handleStatus.value = "not_found";
    } else {
        handleStatus.value = "available";
        name.value = response.data;
        dataStore.setHandle(handle.value);
    }
}


onMounted(() => {
    navigator.geolocation.getCurrentPosition(success, error);
});
</script>

<template>
    <div class="absolute top-2 right-2 flex gap-1">
        <ClientOnly>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Button size="icon" variant="outline">
                        <LucideSun v-if="colorMode.preference === 'light'" />
                        <LucideMoon v-else-if="colorMode.preference === 'dark'" />
                        <LucideMonitor v-else />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem @click="colorMode.preference = 'dark'">
                        Dark
                        <DropdownMenuShortcut>
                            <LucideMoon :size="15" />
                        </DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="colorMode.preference = 'light'">
                        Light
                        <DropdownMenuShortcut>
                            <LucideSun :size="15" />
                        </DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="colorMode.preference = 'system'">
                        System
                        <DropdownMenuShortcut>
                            <LucideMonitor :size="15" />
                        </DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </ClientOnly>
    </div>
    <div class="flex md:justify-center items-center w-full md:w-1/3 gap-5 p-5">
        <div class="h-64 flex flex-col items-center justify-center">
            <div class="">
                <div class="border p-2 rounded-full bg-accent/30" :class="{ 'border-green-500 text-green-500': state === 'location' }">
                    <LucideLoader class="animate-spin duration-1000" v-if="isLoading" />
                    <LucideMapPin v-else />
                </div>
            </div>
            <div class="h-32">
                <Separator class="h-full" orientation="vertical" />
            </div>
            <div class="">
                <div class="border p-2 rounded-full bg-accent/30" :class="{ 'border-green-500 text-green-500': state === 'handle' }">
                    <LucideIdCard />
                </div>
            </div>
        </div>
        <div v-if="state === 'location'" class="flex flex-col gap-3 w-full">
            <div v-if="status === 'success'" class="flex items-center gap-2 bg-green-500/10 text-green-500 border border-green-500 rounded-md p-1">
                <div class="rounded-full">
                    <LucideCheck />
                </div>
                <p>Ajoyib siz institut hududidasiz. Davom etishingiz mumkin.</p>
            </div>
            <div v-if="status === 'waiting'" class="flex items-center gap-2 bg-orange-500/10 text-orange-500 border border-orange-500 rounded-md p-1">
                <div class="rounded-full">
                    <LucideTriangleAlert />
                </div>
                <p>Joylashuvga (ruxsat bering yoki olinmoqda)</p>
            </div>
            <div v-if="status === 'not_in_area'" class="flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500 rounded-md p-1">
                <div class="rounded-full">
                    <LucideX />
                </div>
                <p>Siz institut hududida emassiz.</p>
            </div>
            <div v-if="status === 'cannot_get'" class="flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500 rounded-md p-1">
                <div class="rounded-full">
                    <LucideX />
                </div>
                <p>Joylashuvingizni olomadik. Qaytadan urinib ko'ring.</p>
            </div>
            <ClientOnly>
                <Button :disabled="status !== 'success'" @click="status === 'success' ? state = 'handle' : null">Keyingisi <LucideChevronRight /> </Button>
            </ClientOnly>
        </div>
        <div v-else-if="state === 'handle'" class="flex flex-col gap-3 w-full">
            <div v-if="handleStatus === 'available'" class="flex items-center gap-2 bg-green-500/10 text-green-500 border border-green-500 rounded-md p-1">
                <div class="rounded-full">
                    <LucideCheck />
                </div>
                <p>{{ name }} davom etishingiz mumkin.</p>
            </div>
            <div v-else-if="handleStatus === 'not_found'" class="flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500 rounded-md p-1">
                <div class="rounded-full">
                    <LucideX />
                </div>
                <p>Xodim topilmadi!</p>
            </div>
            <div>
                <Label>ID raqami</Label>
                <Input :disabled="handleStatus === 'available'" v-model="handle" />
            </div>
            <ClientOnly>
                <Button v-if="handleStatus !== 'available'" @click="checkHandle">Kirish</Button>
                <Button v-else @click="navigateTo({ name: 'faceid' })">Davom etish</Button>
            </ClientOnly>
        </div>
    </div>
</template>

<style>
video {
    transform: rotateY(180deg);
    -webkit-transform:rotateY(180deg);
    -moz-transform:rotateY(180deg);
    object-fit: cover;
}
</style>
