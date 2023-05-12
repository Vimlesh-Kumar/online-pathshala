// Composables
import { createRouter, createWebHistory } from 'vue-router';
import UserHomePage from '../views/UserHomePage.vue'
import HomePage from '../views/HomePage.vue';
import cart from '../components/cart/UserCart.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/user/sign-up', component: () => import('@/components/users/SignUp.vue') },
  { path: '/user/sign-in', component: () => import('@/components/users/LogIn.vue') },
  {
    path: '/user', component: UserHomePage,
    // children: [{ path: 'cart', component: cart }]
  },
  { path: '/user/tutor/add-course', component: () => import('@/components/course/AddCourse.vue') },
  { path: '/course/:id', component: () => import('@/components/course/CourseDetails.vue') },
  { path: '/course/:id/objectives', component: () => import('@/components/course/CourseObjectives.vue') },
  { path: '/course/:id/section', component: () => import('@/components/course/CourseSection.vue') },
  { path: '/course/display', component: () => import('@/components/course/CurriculumDisplayForStudent.vue') },
  { path: '/user/cart', component: cart }

]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
