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


const currentUser = ref<AuthenticatedUser | null>(getStoredValue('currentUser'))
const currentPatientProfile = ref<Profile | null>(getStoredValue('currentPatientProfile'))

export function useAuth() {
  const isAuthenticated = computed(() => currentUser.value !== null)

  const setAuthenticatedUser = (user: AuthenticatedUser) => {
    currentUser.value = user
    localStorage.setItem('currentUser', JSON.stringify(user))
  }

  const selectPatientProfile = (profile: Profile) => {
    currentPatientProfile.value = profile
    localStorage.setItem('currentPatientProfile', JSON.stringify(profile))
  }

  const logout = () => {
    currentUser.value = null
    currentPatientProfile.value = null
    localStorage.removeItem('currentUser')
    localStorage.removeItem('currentPatientProfile')
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