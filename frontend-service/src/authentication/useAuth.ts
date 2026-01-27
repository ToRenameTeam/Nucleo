import { ref } from 'vue'
import type { Profile } from '../types/auth'

const currentUser = ref<Profile | null>(null)

const storedUser = localStorage.getItem('currentUser')
if (storedUser) {
  try {
    currentUser.value = JSON.parse(storedUser)
  } catch (e) {
    console.error('Error parsing stored user:', e)
  }
}

export function useAuth() {
  const login = (user: Profile) => {
    currentUser.value = user
    localStorage.setItem('currentUser', JSON.stringify(user))
  }

  const logout = () => {
    currentUser.value = null
    localStorage.removeItem('currentUser')
  }

  const isAuthenticated = () => {
    return currentUser.value !== null
  }

  return {
    currentUser,
    login,
    logout,
    isAuthenticated
  }
}
