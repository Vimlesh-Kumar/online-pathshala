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
  {path:'/course/:id',component:()=>import('@/components/course/CourseDetails.vue')},
  {path:'/course/:id/objectives',component:()=>import('@/components/course/CourseObjectives.vue')},
  {path:'/course/:id/section',component:()=>import('@/components/course/CourseSection.vue')}
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
