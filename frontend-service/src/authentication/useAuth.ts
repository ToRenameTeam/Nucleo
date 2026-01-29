import { ref } from 'vue'
import type { Profile, AuthenticatedUser } from '../types/auth'

const currentUser = ref<AuthenticatedUser | null>(null)
const currentProfile = ref<Profile | null>(null)

const storedUser = localStorage.getItem('currentUser')
const storedProfile = localStorage.getItem('currentProfile')

if (storedUser) {
  try {
    currentUser.value = JSON.parse(storedUser)
  } catch (e) {
    console.error('Error parsing stored user:', e)
  }
}

if (storedProfile) {
  try {
    currentProfile.value = JSON.parse(storedProfile)
  } catch (e) {
    console.error('Error parsing stored profile:', e)
  }
}

export function useAuth() {
  const setAuthenticatedUser = (user: AuthenticatedUser) => {
    currentUser.value = user
    localStorage.setItem('currentUser', JSON.stringify(user))
  }

  const selectProfile = (profile: Profile) => {
    currentProfile.value = profile
    localStorage.setItem('currentProfile', JSON.stringify(profile))
  }

  const logout = () => {
    currentUser.value = null
    currentProfile.value = null
    localStorage.removeItem('currentUser')
    localStorage.removeItem('currentProfile')
  }

  const isAuthenticated = () => {
    return currentUser.value !== null
  }

  return {
    currentUser,
    currentProfile,
    setAuthenticatedUser,
    selectProfile,
    logout,
    isAuthenticated
  }
}
