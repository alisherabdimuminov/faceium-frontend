import { defineStore } from "pinia";


export const useErrorStore = defineStore("error", {
    state: (): { error: string | null, code: string } => ({
        error: null,
        code: "000",
    }),

    actions: {
        setError(error: string) {
            this.error = error;
        },
        setCode(code: string) {
            this.code = code;
        }
    }
})

export const useDataStore = defineStore("data", {
    state: (): { latitude: number | null, longitude: number | null, handle: string | null, area: number } => ({
        latitude: 0,
        longitude: 0,
        handle: "",
        area: 0,
    }),

    actions: {
        setLatitude(latitude: number) {
            this.latitude = latitude;
        },
        setLongitude(longitude: number) {
            this.longitude = longitude;
        },
        setHandle(handle: string) {
            this.handle = handle;
        },
        setArea(area: number) {
            this.area = area;
        }
    }
});
