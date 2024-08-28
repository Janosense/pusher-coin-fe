import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'

export const useAuthenticationStore = defineStore('authentication', () => {
    const isUserLoggedIn = ref(false);
    const router = useRouter();

    const authenticateUser = (route = null) => {
        console.log(route);
        isUserLoggedIn.value = true;
        route = route || '/';
        router.push(route)
    }

    return { isUserLoggedIn, authenticateUser }
})
