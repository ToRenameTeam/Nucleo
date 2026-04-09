import { ref, computed } from 'vue';
import type { Profile, AuthenticatedUser } from '../types/auth';

const CURRENT_USER_STORAGE_KEY = 'currentUser';
const CURRENT_PATIENT_PROFILE_STORAGE_KEY = 'currentPatientProfile';
const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';

function getStoredValue<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error(`Error parsing stored ${key}:`, e);
    return null;
  }
}

function readStoredAuthenticatedUser(): AuthenticatedUser | null {
  const storedUser = getStoredValue<AuthenticatedUser>(CURRENT_USER_STORAGE_KEY);
  const storedToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

  if (!storedUser || !storedToken) {
    return null;
  }

  return {
    ...storedUser,
    accessToken: storedUser.accessToken || storedToken,
  };
}

const currentUser = ref<AuthenticatedUser | null>(readStoredAuthenticatedUser());
const currentPatientProfile = ref<Profile | null>(
  getStoredValue<Profile>(CURRENT_PATIENT_PROFILE_STORAGE_KEY)
);

function persistAuthenticatedUser(user: AuthenticatedUser): void {
  localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, user.accessToken);
}

function clearAuthStorage(): void {
  localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  localStorage.removeItem(CURRENT_PATIENT_PROFILE_STORAGE_KEY);
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function useAuth() {
  const isAuthenticated = computed(() => currentUser.value !== null);

  function setAuthenticatedUser(user: AuthenticatedUser) {
    currentUser.value = user;
    persistAuthenticatedUser(user);
  }

  function selectPatientProfile(profile: Profile) {
    currentPatientProfile.value = profile;
    localStorage.setItem(CURRENT_PATIENT_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }

  function logout() {
    currentUser.value = null;
    currentPatientProfile.value = null;
    clearAuthStorage();
  }

  return {
    currentUser,
    currentPatientProfile,
    isAuthenticated,
    setAuthenticatedUser,
    selectPatientProfile,
    logout,
  };
}
