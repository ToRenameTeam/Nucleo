import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuth } from '../authentication/useAuth'

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
    component: () => import('../views/DoctorPatientChoice.vue'),
    meta: {
      hideNavigation: true,
      requiresAuth: true
    }
  },
  {
    path: '/patient-choice',
    name: 'patient-choice',
    component: () => import('../views/PatientChoice.vue'),
    meta: {
      hideNavigation: true,
      requiresAuth: true
    }
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('../views/HomePage.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/documents',
    name: 'documents',
    component: () => import('../views/DocumentsPage.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/health',
    name: 'health',
    component: () => import('../views/HealthPage.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: () => import('../views/CalendarPage.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsPage.vue'),
    meta: {
      requiresAuth: true
    }
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
    next('/home')
  } else {
    next()
  }
})

export default router