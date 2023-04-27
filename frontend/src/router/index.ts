// Composables
import { createRouter, createWebHistory } from 'vue-router';
import UserHomePage from '../views/UserHomePage.vue'
import HomePage from '../views/HomePage.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/user/sign-up', component: () => import('@/components/users/SignUp.vue') },
  { path: '/user/sign-in', component: () => import('@/components/users/LogIn.vue') },
  { path: '/user/home', component: UserHomePage},
  {path:'/user/tutor/add-course',component:()=>import('@/components/course/AddCourse.vue')},
  {path:'/course/details',component:()=>import('@/components/course/CourseDetails.vue')}
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
