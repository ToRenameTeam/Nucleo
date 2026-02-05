import { ref, computed } from 'vue'
import type { Profile, AuthenticatedUser } from '../types/auth'

function getStoredValue<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (e) {
    console.error(`Error parsing stored ${key}:`, e)
    return null
  }
}

// Dev user for development - automatically logged in
const DEV_USER: AuthenticatedUser = {
  userId: 'dev-user-001',
  fiscalCode: 'DVLUSR00A01H501X',
  name: 'Dev',
  lastName: 'User',
  dateOfBirth: '2000-01-01',
  activeProfile: 'PATIENT',
  patient: {
    userId: 'dev-user-001',
  },
  doctor: {
    userId: 'dev-user-001',
    medicalLicenseNumber: 'DEV123456',
    specializations: ['Medicina Generale'],
  }
}

const DEV_PROFILE: Profile = {
  id: 'dev-profile-001',
  name: 'Dev',
  lastName: 'User',
  fiscalCode: 'DVLUSR00A01H501X',
  dateOfBirth: '2000-01-01'
}

// In development mode, automatically use dev user
const isDev = import.meta.env.DEV
const currentUser = ref<AuthenticatedUser | null>(
  isDev ? DEV_USER : getStoredValue('currentUser')
)
const currentPatientProfile = ref<Profile | null>(
  isDev ? DEV_PROFILE : getStoredValue('currentPatientProfile')
)

export function useAuth() {
  const isAuthenticated = computed(() => currentUser.value !== null)

  const setAuthenticatedUser = (user: AuthenticatedUser) => {
    currentUser.value = user
    if (!isDev) {
      localStorage.setItem('currentUser', JSON.stringify(user))
    }
  }

  const selectPatientProfile = (profile: Profile) => {
    currentPatientProfile.value = profile
    if (!isDev) {
      localStorage.setItem('currentPatientProfile', JSON.stringify(profile))
    }
  }

  const logout = () => {
    // In dev mode, reset to dev user instead of full logout
    if (isDev) {
      currentUser.value = DEV_USER
      currentPatientProfile.value = DEV_PROFILE
    } else {
      currentUser.value = null
      currentPatientProfile.value = null
      localStorage.removeItem('currentUser')
      localStorage.removeItem('currentPatientProfile')
    }
  }

  return {
    currentUser,
    currentPatientProfile,
    isAuthenticated,
    setAuthenticatedUser,
    selectPatientProfile,
    logout
  }
}