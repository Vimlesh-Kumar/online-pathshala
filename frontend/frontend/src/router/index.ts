// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/views/HomePage.vue'),
  },
  {path:'/user/sign-up',component:()=> import('@/components/users/SignUp.vue')},
  {path:'/user/sign-in',component:()=>import('@/components/users/LogIn.vue')}
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
