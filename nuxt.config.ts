// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-11-01',
    devtools: { enabled: false },

    modules: ['@nuxtjs/tailwindcss', 'shadcn-nuxt', '@pinia/nuxt'],

    colorMode: {
        classPrefix: "",
        classSuffix: "",
    },

    runtimeConfig: {
        public: {
            // api: "http://localhost:8000/api/v1/",
            api: "https://faceium.uz/api/v1/",
            secretKey: "A"
        }
    },
});
