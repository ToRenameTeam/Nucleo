<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from './BaseModal.vue'
import { UserCircleIcon, IdentificationIcon, CalendarIcon } from '@heroicons/vue/24/outline'
import type { Profile } from '../../types/auth'

interface Props {
  isOpen: boolean
  profileData: Profile | null
  title?: string
  isDelegated?: boolean
  delegatedByName?: string
}

const { t } = useI18n()

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  isDelegated: false,
  delegatedByName: undefined
})

const emit = defineEmits<{
  close: []
}>()

const fullName = computed(() => {
  if (!props.profileData) return ''
  return props.profileData.lastName 
    ? `${props.profileData.name} ${props.profileData.lastName}`
    : props.profileData.name
})

const formattedDateOfBirth = computed(() => {
  if (!props.profileData?.dateOfBirth) return null
  try {
    const date = new Date(props.profileData.dateOfBirth)
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  } catch {
    return props.profileData.dateOfBirth
  }
})

const avatarInitials = computed(() => {
  if (!props.profileData) return '?'
  const firstInitial = props.profileData.name.charAt(0).toUpperCase()
  const lastInitial = props.profileData.lastName?.charAt(0).toUpperCase() || ''
  return firstInitial + lastInitial
})

const modalTitle = computed(() => props.title || t('settings.profileModal.title'))
</script>

<template>
  <BaseModal 
    :is-open="isOpen" 
    :title="modalTitle"
    max-width="md"
    @close="emit('close')"
  >
    <div v-if="profileData" class="profile-view">
      <!-- Badge Delegato -->
      <div v-if="isDelegated" class="delegation-badge">
        <div class="delegation-badge-icon">
          <UserCircleIcon />
        </div>
        <div class="delegation-badge-content">
          <div class="delegation-badge-label">{{ t('settings.profileModal.delegatedAccess') }}</div>
          <div class="delegation-badge-name">{{ fullName }}</div>
          <div v-if="delegatedByName" class="delegation-badge-delegator">{{ delegatedByName }}</div>
        </div>
      </div>

      <!-- Avatar e nome -->
      <div class="profile-header">
        <div class="profile-avatar">
          <span>{{ avatarInitials }}</span>
        </div>
        <h3 class="profile-name">{{ fullName }}</h3>
      </div>

      <!-- Dettagli -->
      <div class="profile-details">
        <div class="detail-item">
          <div class="detail-icon">
            <UserCircleIcon />
          </div>
          <div class="detail-content">
            <div class="detail-label">{{ t('settings.profileModal.fullName') }}</div>
            <div class="detail-value">{{ fullName }}</div>
          </div>
        </div>

        <div class="detail-item">
          <div class="detail-icon">
            <IdentificationIcon />
          </div>
          <div class="detail-content">
            <div class="detail-label">{{ t('settings.profileModal.fiscalCode') }}</div>
            <div class="detail-value">{{ profileData.fiscalCode }}</div>
          </div>
        </div>

        <div v-if="formattedDateOfBirth" class="detail-item">
          <div class="detail-icon">
            <CalendarIcon />
          </div>
          <div class="detail-content">
            <div class="detail-label">{{ t('settings.profileModal.dateOfBirth') }}</div>
            <div class="detail-value">{{ formattedDateOfBirth }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="profile-empty">
      <p>{{ t('settings.profileModal.noData') }}</p>
    </div>
  </BaseModal>
</template>

<style scoped>
.profile-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.delegation-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, var(--sky-0ea5e9-10) 0%, var(--purple-a855f7-10) 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--sky-0ea5e9-30);
  border-radius: 1rem;
  box-shadow: 0 4px 16px var(--sky-0ea5e9-20), inset 0 1px 0 var(--white-60);
}

.delegation-badge-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--sky-0ea5e9) 0%, var(--purple-a855f7) 100%);
  border-radius: 0.75rem;
  flex-shrink: 0;
  box-shadow: 0 2px 8px var(--sky-0ea5e9-30);
}

.delegation-badge-icon svg {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--white);
}

.delegation-badge-content {
  flex: 1;
}

.delegation-badge-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--sky-0ea5e9);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.delegation-badge-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gray-171717);
  line-height: 1.3;
}

.delegation-badge-delegator {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--gray-525252);
  margin-top: 0.125rem;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--white-30);
}

.profile-avatar {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, var(--sky-0ea5e9) 0%, var(--purple-a855f7) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 16px var(--sky-0ea5e9-30);
  transition: transform 0.3s cubic-bezier(0, 0, 0.2, 1);
}

.profile-avatar:hover {
  transform: scale(1.05);
}

.profile-avatar span {
  font-weight: 700;
  color: var(--white);
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-171717);
  margin: 0;
  text-align: center;
  line-height: 1.25;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--white-30);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--white-50);
  border-radius: 1rem;
  box-shadow: 0 4px 24px var(--black-8), inset 0 1px 0 var(--white-80);
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
}

.detail-item:hover {
  background: var(--white-40);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px var(--black-12), inset 0 1px 0 var(--white-80);
}

.detail-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--sky-0ea5e9-10) 0%, var(--purple-a855f7-10) 100%);
  border-radius: 0.75rem;
  flex-shrink: 0;
}

.detail-icon svg {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--sky-0ea5e9);
}

.detail-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--gray-737373);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-171717);
  line-height: 1.5;
}

.profile-empty {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--gray-737373);
}

.profile-empty p {
  margin: 0;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .profile-view {
    gap: 1.5rem;
  }

  .delegation-badge {
    padding: 0.875rem 1rem;
    gap: 0.875rem;
  }

  .delegation-badge-icon {
    width: 2rem;
    height: 2rem;
  }

  .delegation-badge-icon svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .delegation-badge-label {
    font-size: 0.6875rem;
  }

  .delegation-badge-name {
    font-size: 0.9375rem;
  }

  .delegation-badge-delegator {
    font-size: 0.75rem;
  }

  .profile-avatar {
    width: 64px;
    height: 64px;
  }

  .profile-avatar span {
    font-size: 1.5rem;
  }

  .profile-name {
    font-size: 1.25rem;
  }

  .detail-item {
    padding: 1rem;
  }

  .detail-icon {
    width: 2rem;
    height: 2rem;
  }

  .detail-icon svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .detail-label {
    font-size: 0.75rem;
  }

  .detail-value {
    font-size: 0.9375rem;
  }
}
</style>
