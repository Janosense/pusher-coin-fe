import {createRouter, createWebHistory} from 'vue-router'
import RoomsView from "@/views/RoomsView.vue";
import RoomView from "@/views/RoomView.vue";
import SignUpView from "@/views/SignUpView.vue";
import SignInView from "@/views/SignInView.vue";
import AccountView from "@/views/AccountView.vue";
import HistoryView from "@/views/HistoryView.vue";
import SupportView from '@/views/SupportView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: RoomsView
        },
        {
            path: '/sign-up',
            name: 'sign-up',
            component: SignUpView
        },
        {
            path: '/sign-in',
            name: 'sign-in',
            component: SignInView
        },
        {
            path: '/account',
            name: 'account',
            component: AccountView
        },
        {
            path: '/history',
            name: 'history',
            component: HistoryView
        },
        {
            path: '/support',
            name: 'support',
            component: SupportView
        },
        {
            path: '/room/:id',
            name: 'room',
            component: RoomView
        },
    ]
})

export default router
