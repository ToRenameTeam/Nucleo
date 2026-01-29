<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuth } from '../../authentication/useAuth'

const { t, locale } = useI18n()
const router = useRouter()
const { currentUser, logout: authLogout } = useAuth()
const showUserMenu = ref(false)
const showLanguageMenu = ref(false)

const toggleLanguageMenu = () => {
  showLanguageMenu.value = !showLanguageMenu.value
}

const changeLanguage = (lang: string) => {
  locale.value = lang
  showLanguageMenu.value = false
}

const currentLanguage = computed(() => {
  return locale.value === 'it' ? 'ITA' : 'ENG'
})

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const logout = () => {
  authLogout()
  showUserMenu.value = false
  router.push('/login')
}

const changeUser = () => {
  showUserMenu.value = false
  router.push('/patient-choice')
}

</script>

<template>
  <div class="topbar-container">
    <div class="topbar-title-container">
      <h1 class="topbar-title" @click="router.push('/home')">{{ t('app.title') }}</h1>
    </div>
    <div class="topbar-actions">
      <button 
        class="topbar-icon-button notification-button"
        :title="t('topbar.notifications')"
        :aria-label="`${t('topbar.notifications')} - 1 ${t('topbar.unread')}`"
      >
        <svg class="topbar-icon notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span class="notification-badge" aria-label="1 {{ t('topbar.notification') }}">1</span>
      </button>
      <!-- Language Selector -->
      <div class="language-selector">
        <button 
          class="topbar-icon-button language-button"
          :aria-label="t('topbar.languageSelectorAria', { lang: currentLanguage })"
          :aria-expanded="showLanguageMenu"
          @click="toggleLanguageMenu"
        >
          <span class="topbar-text language-text">{{ currentLanguage }}</span>
          <svg class="topbar-icon-secondary language-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <div 
          v-if="showLanguageMenu" 
          class="language-menu"
        >
          <button
            class="language-menu-item"
            :class="{ 'selected': locale === 'it' }"
            :aria-label="locale === 'it' ? t('topbar.italianSelectedAria') : t('topbar.selectItalianAria')"
            :aria-current="locale === 'it' ? 'true' : undefined"
            @click="changeLanguage('it')"
          >
            <span class="language-menu-text">ITA</span>
          </button>
          <button
            class="language-menu-item"
            :class="{ 'selected': locale === 'en' }"
            :aria-label="locale === 'en' ? t('topbar.englishSelectedAria') : t('topbar.selectEnglishAria')"
            :aria-current="locale === 'en' ? 'true' : undefined"
            @click="changeLanguage('en')"
          >
            <span class="language-menu-text">ENG</span>
          </button>
        </div>
      </div>
      <div class="user-menu-container">
        <button 
          class="topbar-icon-button user-menu-button"
          :aria-label="t('topbar.userMenuAria', { user: currentUser?.name || t('topbar.user') })"
          :aria-expanded="showUserMenu"
          @click="toggleUserMenu"
        >
          <div class="user-avatar">
            <svg class="topbar-icon user-avatar-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <span class="user-name-text topbar-text">{{ currentUser?.name || t('topbar.user') }}</span>
          <svg class="topbar-icon-secondary user-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <div 
          v-if="showUserMenu" 
          class="user-menu"
        >
          <button 
            class="user-menu-profile"
            :aria-label="t('topbar.userProfileAria', { user: currentUser?.name || t('topbar.user') })"
            @click="changeUser"
          >
            <div class="user-profile-content">
              <div class="user-profile-avatar">
                <svg class="user-profile-avatar-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
              <div class="user-profile-details">
                <div class="user-profile-name">{{ currentUser?.name }}</div>
                <div class="user-profile-role">{{ currentUser?.activeProfile }}</div>
              </div>
            </div>
          </button>
          <!-- Logout Button -->
          <button
            class="user-menu-logout"
            :aria-label="t('userMenu.logout')"
            @click="logout"
          >
            <div class="user-menu-logout-icon-container">
              <svg class="user-menu-logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <span class="user-menu-logout-text">{{ t('userMenu.logout') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* TopBar Styles - All classes used in template */
.topbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--white-40);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--white-60);
  box-shadow: 0 4px 24px var(--black-8), inset 0 1px 0 var(--white-80);
  height: 8vh;
  width: 100%;
  padding-left: clamp(2rem, 1.5vw, 3rem);
  padding-right: clamp(2rem, 1.5vw, 3rem);
  position: relative;
  z-index: 10;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
}

.topbar-title-container {
  display: flex;
  align-items: center;
}

.topbar-title {
  color: var(--text-heading);
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  font-weight: 600;
  margin: 0;
  cursor: pointer;
  transition: opacity 0.2s cubic-bezier(0, 0, 0.2, 1);
}
.topbar-title:hover {
  opacity: 0.8;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.topbar-icon-button {
  background: var(--white-60);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--white-50);
  box-shadow: 0 2px 8px var(--black-5), inset 0 1px 0 var(--white-80);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  position: relative;
  min-width: 2.25rem;
  min-height: 2.25rem;
  cursor: pointer;
}
.topbar-icon-button:hover {
  background: var(--white-80);
  box-shadow: 0 4px 16px var(--black-12), inset 0 1px 0 var(--white-90);
  transform: translateY(-1px);
}

.notification-button {
  width: clamp(2rem, 5vw, 2.25rem);
  height: clamp(2rem, 5vw, 2.25rem);
}
.notification-icon {
  color: var(--topbar-icon-color);
  width: clamp(1rem, 3vw, 1.25rem);
  height: clamp(1rem, 3vw, 1.25rem);
}
.notification-badge {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background: var(--notification-red);
  color: var(--white);
  font-size: clamp(0.5rem, 1.5vw, 0.625rem);
  font-weight: 600;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.language-selector {
  position: relative;
}
.language-button {
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
}
.language-text {
  color: var(--topbar-text-color);
  font-size: clamp(0.75rem, 2vw, 0.875rem);
  font-weight: 600;
}
.language-icon {
  color: var(--topbar-text-secondary);
  width: 1rem;
  height: 1rem;
}
.language-menu {
  background: var(--glass-menu-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-menu-border);
  box-shadow: var(--glass-menu-shadow), var(--glass-menu-inset-shadow);
  position: absolute;
  top: calc(100% + 0.5vh);
  right: 0;
  border-radius: 0.75rem;
  min-width: 6rem;
  z-index: 50;
  overflow: hidden;
}
.language-menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background: transparent;
  color: var(--accent-primary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background 0.2s cubic-bezier(0, 0, 0.2, 1);
}
.language-menu-item.selected {
  background: var(--accent-primary-10);
}
.language-menu-item:hover {
  background: var(--glass-menu-hover-bg);
}
.language-menu-text {
  color: var(--accent-primary);
}

.user-menu-container {
  position: relative;
}
.user-menu-button {
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
}
.user-avatar {
  width: clamp(1.25rem, 4vw, 1.5rem);
  height: clamp(1.25rem, 4vw, 1.5rem);
  border-radius: 50%;
  background: var(--white-80);
  display: flex;
  align-items: center;
  justify-content: center;
}
.user-avatar-icon {
  color: var(--topbar-text-secondary);
  width: clamp(0.875rem, 3vw, 1.125rem);
  height: clamp(0.875rem, 3vw, 1.125rem);
}
.user-name-text {
  color: var(--topbar-text-color);
  font-size: clamp(0.75rem, 2vw, 0.875rem);
  font-weight: 500;
}
.user-menu-icon {
  color: var(--topbar-text-secondary);
  width: 1rem;
  height: 1rem;
}
.user-menu {
  background: var(--glass-menu-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-menu-border);
  box-shadow: var(--glass-menu-shadow), var(--glass-menu-inset-shadow);
  position: absolute;
  top: calc(100% + 0.5vh);
  right: 0;
  border-radius: 0.75rem;
  min-width: 12rem;
  z-index: 50;
  overflow: hidden;
}
.user-menu-profile {
  width: 100%;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-light);
  background: transparent;
  cursor: pointer;
  border: none;
  transition: background 0.2s cubic-bezier(0, 0, 0.2, 1);
}
.user-menu-profile:hover {
  background: var(--glass-menu-hover-bg);
}
.user-profile-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.user-profile-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--white-80);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-gray-600);
}
.user-profile-avatar-icon {
  width: 1.5rem;
  height: 1.5rem;
}
.user-profile-details {
  text-align: left;
}
.user-profile-name {
  color: var(--glass-menu-text-primary);
  font-size: 1rem;
  font-weight: 600;
}
.user-profile-role {
  color: var(--glass-menu-text-secondary);
  font-size: 0.875rem;
}
.user-menu-logout {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: transparent;
  cursor: pointer;
  border: none;
  transition: background 0.2s cubic-bezier(0, 0, 0.2, 1);
}
.user-menu-logout:hover {
  background: var(--glass-menu-hover-bg);
}
.user-menu-logout-icon-container {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-gray-600);
}
.user-menu-logout-icon {
  width: 1.25rem;
  height: 1.25rem;
}
.user-menu-logout-text {
  color: var(--accent-primary);
  font-size: 1rem;
  font-weight: 500;
}

/* Responsive Design - Mobile */
@media (max-width: 480px) {
  .topbar-container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .topbar-actions {
    gap: 0.5rem;
  }
  .user-name-text {
    display: none;
  }
  .topbar-icon-button {
    padding: 0.375rem 0.5rem;
  }
  .user-menu {
    right: -0.5rem;
    min-width: 200px;
  }
}
@media (max-width: 768px) {
  .topbar-container {
    padding-left: 1.25rem;
    padding-right: 1.25rem;
  }
  .topbar-actions {
    gap: 0.75rem;
  }
}
</style>