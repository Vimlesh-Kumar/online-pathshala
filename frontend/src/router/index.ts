// Composables
import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue'

const routes = [
  { path: '/user/home', component: HomePage },
  { path: '/user/sign-up', component: () => import('@/components/users/SignUp.vue') },
  { path: '/user/sign-in', component: () => import('@/components/users/LogIn.vue') }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
