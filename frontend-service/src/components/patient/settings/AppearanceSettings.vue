<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTheme} from '../../../composables/useTheme'
import { SunIcon, MoonIcon, CheckCircleIcon } from '@heroicons/vue/24/solid'

const { t } = useI18n()
const { themeMode, setThemeMode } = useTheme()
</script>

<template>
  <div class="appearance-settings">
    <!-- Theme light/dark -->
    <div class="setting-group">
      <h3 class="setting-label">{{ t('settings.app.appearance.theme.title') }}</h3>
      <div class="theme-selector">
        <button
          class="theme-button"
          :class="{ active: themeMode === 'light' }"
          @click="setThemeMode('light')"
        >
          <div class="theme-content">
            <SunIcon class="theme-icon" />
            <span>{{ t('settings.app.appearance.theme.light') }}</span>
          </div>
          <CheckCircleIcon v-if="themeMode === 'light'" class="check-icon" />
        </button>
        <button
          class="theme-button"
          :class="{ active: themeMode === 'dark' }"
          @click="setThemeMode('dark')"
        >
          <div class="theme-content">
            <MoonIcon class="theme-icon" />
            <span>{{ t('settings.app.appearance.theme.dark') }}</span>
          </div>
          <CheckCircleIcon v-if="themeMode === 'dark'" class="check-icon" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.appearance-settings {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.setting-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.setting-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.theme-selector {
  display: flex;
  gap: 0.75rem;
}

.theme-button {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: var(--white-70);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.theme-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.theme-button:hover {
  background: var(--bg-secondary-90);
  border-color: var(--accent-primary);
}

.theme-button.active {
  background: var(--accent-primary-20);
  border-color: var(--accent-primary);
  box-shadow: 0 4px 12px var(--accent-primary-30), 0 2px 4px var(--black-10);
}

.check-icon {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  color: var(--accent-primary);
}

.theme-icon {
  width: 2rem;
  height: 2rem;
  color: var(--accent-primary);
}

.theme-button span {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-default);
}

.theme-button.active span {
  font-weight: 700;
}

.radio-option {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: var(--white-70);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.radio-option:hover {
  background: var(--bg-secondary-90);
  border-color: var(--accent-primary);
}

.radio-option.active {
  background: var(--accent-primary-20);
  border-color: var(--accent-primary);
  box-shadow: 0 2px 8px var(--accent-primary-30), 0 1px 2px var(--black-10);
}

.radio-label {
  flex: 1;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-default);
  text-align: left;
}

.radio-option.active .radio-label {
  font-weight: 700;
}

.check-icon-small {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--accent-primary);
  margin-left: auto;
}

/* Supporto tema scuro */
:root.dark .theme-button,
:root.dark .radio-option {
  background: var(--white-70);
}

:root.dark .theme-button:hover,
:root.dark .radio-option:hover {
  background: var(--bg-secondary-90);
}

:root.dark .theme-button.active,
:root.dark .radio-option.active {
  background: var(--accent-primary-20);
  box-shadow: 0 4px 12px var(--white-20), 0 2px 4px var(--black-10);
}
</style>
