import { watch, computed } from 'vue'
import { useStorage } from '@vueuse/core'

export type ThemeMode = 'light' | 'dark'

const themeMode = useStorage<ThemeMode>('theme-mode', 'light')

export function useTheme() {
  const applyTheme = () => {
    const html = document.documentElement
    html.classList.remove('light', 'dark')
    html.classList.add(themeMode.value)
  }

  // Osserva i cambiamenti e applica il tema immediatamente
  watch(themeMode, applyTheme, { immediate: true })

  const setThemeMode = (mode: ThemeMode) => {
    themeMode.value = mode
  }

  const toggleTheme = () => {
    themeMode.value = themeMode.value === 'light' ? 'dark' : 'light'
  }

  return {
    themeMode: computed(() => themeMode.value),
    setThemeMode,
    toggleTheme
  }
}
