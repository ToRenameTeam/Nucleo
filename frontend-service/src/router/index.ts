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
    component: () => import('../views/DoctorPatientChoice.vue'),
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
    path: '/patient',
    component: () => import('../views/layouts/PatientLayout.vue'),
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '',
        redirect: '/patient/home'
      },
      {
        path: 'home',
        name: 'patient-home',
        component: () => import('../views/patient/PatientHomePage.vue')
      },
      {
        path: 'documents',
        name: 'patient-documents',
        component: () => import('../views/patient/PatientDocumentsPage.vue')
      },
      {
        path: 'calendar',
        name: 'patient-calendar',
        component: () => import('../views/patient/CalendarPage.vue')
      },
      {
        path: 'settings',
        name: 'patient-settings',
        component: () => import('../views/patient/SettingsPage.vue')
      }
    ]
  },
  {
    path: '/doctor',
    component: () => import('../views/layouts/DoctorLayout.vue'),
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '',
        redirect: '/doctor/appointments'
      },
      {
        path: 'appointments',
        name: 'doctor-appointments',
        component: () => import('../views/doctor/DoctorAppointmentsPage.vue')
      },
      {
        path: 'availabilities',
        name: 'doctor-availabilities',
        component: () => import('../views/doctor/DoctorAvailabilitiesPage.vue')
      },
      {
        path: 'documents',
        name: 'doctor-documents',
        component: () => import('../views/doctor/DoctorHomePage.vue') // Placeholder - sarà creato dopo
      },
      {
        path: 'patients',
        name: 'doctor-patients',
        component: () => import('../views/doctor/DoctorHomePage.vue') // Placeholder - sarà creato dopo
      },
      {
        path: 'settings',
        name: 'doctor-settings',
        component: () => import('../views/doctor/DoctorHomePage.vue') // Placeholder - sarà creato dopo
      }
    ]
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
    next('/patient/home')
  } else {
    next()
  }
})

export default router