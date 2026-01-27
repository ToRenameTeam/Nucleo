import { watch, computed } from 'vue'
import { useStorage } from '@vueuse/core'

export type ThemeMode = 'light' | 'dark'
export type ColorBlindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia'

export interface ThemeConfig {
  mode: ThemeMode
  colorBlindMode: ColorBlindMode
}

const themeMode = useStorage<ThemeMode>('theme-mode', 'light')
const colorBlindMode = useStorage<ColorBlindMode>('color-blind-mode', 'none')

export function useTheme() {
  const applyTheme = () => {
    const html = document.documentElement
    
    // Rimuovi tutte le classi di tema
    html.classList.remove('light', 'dark')
    html.classList.remove('deuteranopia', 'protanopia', 'tritanopia')
    
    // Applica il tema corrente
    html.classList.add(themeMode.value)
    
    // Applica la modalità daltonico se attiva
    if (colorBlindMode.value !== 'none') {
      html.classList.add(colorBlindMode.value)
    }
  }

  // Applica il tema al caricamento
  applyTheme()

  // Osserva i cambiamenti
  watch([themeMode, colorBlindMode], applyTheme)

  const setThemeMode = (mode: ThemeMode) => {
    themeMode.value = mode
  }

  const setColorBlindMode = (mode: ColorBlindMode) => {
    colorBlindMode.value = mode
  }

  const toggleTheme = () => {
    themeMode.value = themeMode.value === 'light' ? 'dark' : 'light'
  }

  return {
    themeMode: computed(() => themeMode.value),
    colorBlindMode: computed(() => colorBlindMode.value),
    setThemeMode,
    setColorBlindMode,
    toggleTheme
  }
}
