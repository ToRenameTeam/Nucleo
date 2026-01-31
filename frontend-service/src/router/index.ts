import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginPage.vue'),
    meta: {
      hideNavigation: true,
      requiresAuth: false
    }
  },
  {
    path: '/doctor-patient-choice',
    name: 'doctor-patient-choice',
    component: () => import('../views/doctor/DoctorPatientChoice.vue'),
    meta: {
      hideNavigation: true
    }
  },
  {
    path: '/patient-choice',
    name: 'patient-choice',
    component: () => import('../views/patient/PatientChoice.vue'),
  },
  {
    path: '/patient-home',
    name: 'patient-home',
    component: () => import('../views/patient/PatientHomePage.vue'),
  },
  {
    path: '/patient-documents',
    name: 'patient-documents',
    component: () => import('../views/patient/PatientDocumentsPage.vue'),
  },
  {
    path: '/patient-calendar',
    name: 'patient-calendar',
    component: () => import('../views/patient/CalendarPage.vue'),
  },
  {
    path: '/patient-settings',
    name: 'patient-settings',
    component: () => import('../views/patient/SettingsPage.vue'),
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to protect routes that require authentication
router.beforeEach((to, _, next) => {
  const { isAuthenticated } = useAuth()
  
  // Determine if the route requires authentication
  const requiresAuth = to.meta.requiresAuth !== false
  
  // If the route requires auth and the user is not authenticated, redirect to login
  if (requiresAuth && !isAuthenticated.value) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated.value) {
    next('/patient-home')
  } else {
    next()
  }
})

export default router