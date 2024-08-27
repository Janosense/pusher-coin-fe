import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'

export const useAuthenticationStore = defineStore('authentication', () => {
    const isUserLoggedIn = ref(false);
    const router = useRouter();

    const authenticateUser = () => {
        isUserLoggedIn.value = true;
        router.push('/')
    }

    return { isUserLoggedIn, authenticateUser }
})
