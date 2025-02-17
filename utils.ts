export function apify(path: string, type: "api" | "base" = "api") {
    const config = useRuntimeConfig();

    if (type === "api") {
        return `${config.public.api}${path}/`;
    } else {
        return `${config.public.base}${path}/`;
    }
}