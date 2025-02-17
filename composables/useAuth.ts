import type { IUser } from "~/types";

export default function useAuth() {
    const userCookie = useCookie<IUser | null>("user", {
        watch: "shallow",
        path: "/",
        default: () => null,
        sameSite: "lax",
    });

    const user = computed(() => {
        return userCookie.value;
    });

    const login = (data: IUser) => {
        userCookie.value = data;
    }

    const logout = () => {
        userCookie.value = null;
        location.reload();
    }

    return {
        user,
        login,
        logout,
    }
}