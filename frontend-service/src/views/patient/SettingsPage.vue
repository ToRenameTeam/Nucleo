<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import SettingsItem from '../../components/patient/settings/SettingsItem.vue'
import BaseModal from '../../components/shared/BaseModal.vue'
import AppearanceSettings from '../../components/patient/settings/AppearanceSettings.vue'
import {
  UserCircleIcon,
  BellIcon,
  SwatchIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'

const { t } = useI18n()
const router = useRouter()
const showAppearanceModal = ref(false)
const { currentPatientProfile, currentUser } = useAuth()

const handleItemClick = (item: string) => {
  if (item === 'appearance') {
    showAppearanceModal.value = true
  } else {
    console.log('Clicked:', item)
  }
}

function handleChangeProfile() {
  router.push('/patient-choice')
}

const displayUserName = computed(() => {
  if (!currentUser.value || !currentPatientProfile.value) {
    return t('topbar.user')
  }
  if (currentUser.value.fiscalCode === currentPatientProfile.value.fiscalCode) {
    return currentPatientProfile.value.name
  }
  return `${currentUser.value.name} @ ${currentPatientProfile.value.name}`
})
</script>

<template>
  <div class="settings-page">
    <div class="settings-header">
      <h1 class="settings-title">{{ t('settings.title') }}</h1>
      <p class="settings-subtitle">{{ t('settings.subtitle') }}</p>
    </div>

    <!-- Account -->
    <div class="settings-section">
      <div class="settings-section-header">
        {{ t('settings.account.title') }}
      </div>
      <div class="settings-account">
        <div class="settings-account-avatar">
          <span>{{ displayUserName.charAt(0).toUpperCase() }}</span>
        </div>
        <div class="settings-account-info">
          <div class="settings-account-name">{{ displayUserName }}</div>
        </div>
        <button class="settings-account-button" @click="handleChangeProfile">
          {{ t('settings.account.changeProfile') }}
        </button>
      </div>
    </div>

    <!-- Profile and Family -->
    <div class="settings-section">
      <div class="settings-section-header">
        {{ t('settings.profileFamily.title') }}
      </div>
      <div class="settings-list">
        <SettingsItem :icon="UserCircleIcon" :title="t('settings.profileFamily.myProfile.title')"
          :subtitle="t('settings.profileFamily.myProfile.subtitle')" @click="handleItemClick('myProfile')" />
      </div>
    </div>

    <!-- App -->
    <div class="settings-section">
      <div class="settings-section-header">
        {{ t('settings.app.title') }}
      </div>
      <div class="settings-list">
        <SettingsItem :icon="BellIcon" :title="t('settings.app.notifications.title')"
          :subtitle="t('settings.app.notifications.subtitle')" @click="handleItemClick('notifications')" />
        <SettingsItem :icon="SwatchIcon" :title="t('settings.app.appearance.title')"
          :subtitle="t('settings.app.appearance.subtitle')" @click="handleItemClick('appearance')" />
      </div>
    </div>

    <!-- Data and Privacy -->
    <div class="settings-section">
      <div class="settings-section-header">
        {{ t('settings.dataPrivacy.title') }}
      </div>
      <div class="settings-list">
        <SettingsItem :icon="DocumentTextIcon" :title="t('settings.dataPrivacy.terms.title')"
          :subtitle="t('settings.dataPrivacy.terms.subtitle')" @click="handleItemClick('terms')" />
      </div>
    </div>

    <!-- Logout -->
    <div class="settings-section">
      <div class="settings-list">
        <SettingsItem :icon="ArrowRightOnRectangleIcon" :title="t('settings.logout')" variant="danger"
          :show-chevron="false" @click="handleItemClick('logout')" />
      </div>
    </div>

    <!-- Footer -->
    <div class="settings-footer">
      {{ t('settings.footer.version') }}
    </div>

    <!-- Modal Aspect -->
    <BaseModal :is-open="showAppearanceModal" :title="t('settings.app.appearance.title')"
      @close="showAppearanceModal = false">
      <AppearanceSettings />
    </BaseModal>
  </div>
</template>

<style scoped>
.settings-page {
  width: 100%;
  max-width: 100vw;
  min-height: 100vh;
  overflow-x: hidden;
  padding: 2rem;
  background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-mid) 50%, var(--bg-gradient-end) 100%);
  position: relative;
}

.settings-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 30%, var(--sky-0ea5e9-20) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, var(--purple-a855f7-20) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.settings-header {
  position: relative;
  z-index: 1;
  padding: 1.5rem 2rem;
  background: var(--white-40);
  backdrop-filter: blur(20px);
  border: 1px solid var(--white-60);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px var(--black-8), inset 0 1px 0 var(--white-80);
  animation: slideInDown 0.5s cubic-bezier(0, 0, 0.2, 1);
}

.settings-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--gray-171717);
  margin: 0;
  line-height: 1.25;
}

.settings-subtitle {
  font-size: 1rem;
  color: var(--gray-525252);
  margin: 0.5rem 0 0 0;
  line-height: 1.5;
}

.settings-section {
  margin-top: 2rem;
  position: relative;
  z-index: 1;
  animation: fadeIn 0.5s cubic-bezier(0, 0, 0.2, 1);
  animation-fill-mode: both;
}

.settings-section:nth-child(2) {
  animation-delay: 0.1s;
}

.settings-section:nth-child(3) {
  animation-delay: 0.15s;
}

.settings-section:nth-child(4) {
  animation-delay: 0.2s;
}

.settings-section:nth-child(5) {
  animation-delay: 0.25s;
}

.settings-section:nth-child(6) {
  animation-delay: 0.3s;
}

.settings-section:nth-child(7) {
  animation-delay: 0.35s;
}

.settings-section-header {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--gray-404040);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 0 0.75rem;
  margin-left: 0.5rem;
}

.settings-list {
  background: var(--white-30);
  backdrop-filter: blur(16px);
  border: 1px solid var(--white-50);
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 4px 24px var(--black-8), inset 0 1px 0 var(--white-80);
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
}

.settings-list>* {
  border-bottom: 1px solid var(--white-20);
}

.settings-list>*:last-child {
  border-bottom: none;
}

.settings-account {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--white-30);
  backdrop-filter: blur(16px);
  border: 1px solid var(--white-50);
  border-radius: 1.25rem;
  box-shadow: 0 4px 24px var(--black-8), inset 0 1px 0 var(--white-80);
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
}

.settings-account:hover {
  background: var(--white-40);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px var(--black-12), inset 0 1px 0 var(--white-80);
}

.settings-account-avatar {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--sky-0ea5e9) 0%, var(--purple-a855f7) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 16px var(--sky-0ea5e9-30);
  transition: transform 0.3s cubic-bezier(0, 0, 0.2, 1);
}

.settings-account:hover .settings-account-avatar {
  transform: scale(1.05);
}

.settings-account-avatar span {
  font-size: 1.375rem;
  font-weight: 600;
  color: var(--white);
}

.settings-account-info {
  flex: 1;
}

.settings-account-name {
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--gray-171717);
  line-height: 1.4;
}

.settings-account-button {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--sky-0ea5e9);
  background: var(--sky-0ea5e9-10);
  border: 1px solid var(--sky-0ea5e9-20);
  border-radius: 0.75rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
}

.settings-account-button:hover {
  color: var(--white);
  background: var(--sky-0ea5e9-80);
  border-color: transparent;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--sky-0ea5e9-30);
}

.settings-footer {
  text-align: center;
  padding: 2rem 0;
  font-size: 0.8125rem;
  color: var(--gray-737373);
  position: relative;
  z-index: 1;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .settings-page {
    padding: 1rem;
  }

  .settings-header {
    padding: 1.25rem 1.5rem;
  }

  .settings-title {
    font-size: 1.5rem;
  }

  .settings-subtitle {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .settings-page {
    padding: 0.75rem;
  }

  .settings-header {
    padding: 1rem 1.25rem;
  }

  .settings-title {
    font-size: 1.375rem;
  }

  .settings-subtitle {
    font-size: 0.8125rem;
  }

  .settings-account {
    padding: 1rem;
  }

  .settings-account-avatar {
    width: 48px;
    height: 48px;
  }

  .settings-account-avatar span {
    font-size: 1.25rem;
  }

  .settings-account-name {
    font-size: 1rem;
  }

  .settings-account-button {
    font-size: 0.8125rem;
    padding: 0.5rem 0.875rem;
  }
}
</style>
