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
      requiresAuth: true,
      requiredProfile: 'PATIENT'
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
        component: () => import('../views/patient/PatientCalendarPage.vue')
      },
      {
        path: 'settings',
        name: 'patient-settings',
        component: () => import('../views/patient/PatientSettingsPage.vue')
      }
    ]
  },
  {
    path: '/doctor',
    component: () => import('../views/layouts/DoctorLayout.vue'),
    meta: {
      requiresAuth: true,
      requiredProfile: 'DOCTOR'
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
        component: () => import('../views/doctor/DoctorDocumentsPage.vue')
      },
      {
        path: 'patients',
        name: 'doctor-patients',
        component: () => import('../views/doctor/DoctorHomePage.vue') // Placeholder - sarà creato dopo
      },
      {
        path: 'settings',
        name: 'doctor-settings',
        component: () => import('../views/doctor/DoctorSettingsPage.vue') 
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

const getHomePageForProfile = (profile: 'PATIENT' | 'DOCTOR' | undefined): string => {
  if (profile === 'DOCTOR') return '/doctor/appointments'
  if (profile === 'PATIENT') return '/patient/home'
  return '/login'
}

// Navigation guard to protect routes that require authentication and correct profile
router.beforeEach((to, _, next) => {
  const { isAuthenticated, currentUser } = useAuth()
  const activeProfile = currentUser.value?.activeProfile
  const requiresAuth = to.meta.requiresAuth !== false
  const requiredProfile = to.meta.requiredProfile as 'PATIENT' | 'DOCTOR' | undefined
  
  // Redirect to login if authentication is required but user is not authenticated
  if (requiresAuth && !isAuthenticated.value) {
    next('/login')
    return
  }
  
  // Redirect authenticated users away from login page
  if (to.path === '/login' && isAuthenticated.value) {
    next(getHomePageForProfile(activeProfile))
    return
  }
  
  // Verify profile matches the required section
  if (requiredProfile && activeProfile !== requiredProfile) {
    next(getHomePageForProfile(activeProfile))
    return
  }
  
  next()
})

export default router