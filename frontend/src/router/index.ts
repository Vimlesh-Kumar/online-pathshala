// Composables
import { createRouter, createWebHistory } from 'vue-router';
import UserHomePage from '../views/UserHomePage.vue'
import HomePage from '../views/HomePage.vue';
import cart from '../components/cart/UserCart.vue';
import wishlist from '../components/wishlist/WishListPage.vue'
import { toast } from '../plugins/toast';

const routes = [
  { path: '/', component: HomePage },
  { path: '/user/sign-up', component: () => import('@/components/users/SignUp.vue') },
  { path: '/user/sign-in', component: () => import('@/components/users/LogIn.vue') },
  { path: '/user/profile', component: () => import('@/components/users/UserProfile.vue') },
  {
    path: '/user', component: UserHomePage,
    // children: [{ path: 'wishlist', component:  wishlist}]
  },
  { path: '/user/tutor/add-course', component: () => import('@/components/course/AddCourse.vue') },
  { path: '/user/tutor/dashboard', component: () => import('@/components/instructor/InstructorDashboard.vue') },
  { path: '/course/:id', component: () => import('@/components/course/CourseDetails.vue') },
  { path: '/learn/:id', component: () => import('@/components/course/CoursePlayer.vue') },
  { path: '/course/:id/objectives', component: () => import('@/components/course/CourseObjectives.vue') },
  { path: '/course/:id/section', component: () => import('@/components/course/CourseSection.vue') },
  { path: '/course/display', component: () => import('@/components/course/CurriculumDisplayForStudent.vue') },
  { path: '/courses/category', component: () => import('@/components/course/CategoryCourses.vue') },
  { path: '/courses/search', component: () => import('@/components/course/CategoryCourses.vue') },
  { path: '/courses/all', component: () => import('@/components/course/CategoryCourses.vue') },
  { path: '/user/cart', component: cart },
  { path: '/user/wishlist', component: wishlist },
  { path: '/user/orders', component: () => import('@/components/orders/Orders.vue') }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from) => {
  const token = localStorage.getItem('token');
  const requiresAuth = (to.path.startsWith('/user') && to.path !== '/user/sign-in' && to.path !== '/user/sign-up') || to.path.startsWith('/learn');
  
  if (requiresAuth && !token) {
    toast.error('Please log in to access this page.');
    return '/user/sign-in';
  }
});

export default router;
