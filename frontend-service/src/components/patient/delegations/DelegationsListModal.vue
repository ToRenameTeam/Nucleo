<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowLeftIcon, CheckIcon, XMarkIcon, TrashIcon } from '@heroicons/vue/24/outline'
import BaseModal from '../../shared/BaseModal.vue'
import { parseItalianDate } from '../../../utils/dateUtils'
import { useDelegations } from '../../../composables/useDelegations'
import { useAuth } from '../../../composables/useAuth'

const { t } = useI18n()
const { currentUser } = useAuth()
const {
  delegations,
  isLoading,
  loadDelegations,
  acceptDelegation,
  declineDelegation,
  removeDelegation
} = useDelegations()

const props = defineProps<{
  isOpen: boolean
  type: 'received' | 'sent'
}>()

const emit = defineEmits<{
  close: []
  back: []
}>()

watch(() => props.isOpen, async (isOpen) => {
  if (isOpen && currentUser.value?.userId) {
    await loadDelegations(currentUser.value.userId, props.type)
  }
})

const title = computed(() => {
  return props.type === 'received' 
    ? t('delegations.receivedList.title')
    : t('delegations.sentList.title')
})

const subtitle = computed(() => {
  const count = delegations.value.length
  return props.type === 'received'
    ? t('delegations.receivedList.subtitle', { count })
    : t('delegations.sentList.subtitle', { count })
})

const getInitials = (name: string, lastName: string) => {
  return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

const getStatusBadge = (status: string) => {
  if (status === 'Pending') {
    return {
      label: t('delegations.status.pending'),
      class: 'status-pending'
    }
  }
  if (status === 'Active') {
    return {
      label: t('delegations.status.active'),
      class: 'status-active'
    }
  }
  if (status === 'Declined') {
    return {
      label: t('delegations.status.declined'),
      class: 'status-declined'
    }
  }
  if (status === 'Deleted') {
    return {
      label: t('delegations.status.deleted'),
      class: 'status-deleted'
    }
  }
  return null
}

const handleAccept = async (delegationId: string) => {
  if (!currentUser.value?.userId) return
  
  const success = await acceptDelegation(delegationId, currentUser.value.userId)
  if (success) {
    await loadDelegations(currentUser.value.userId, props.type)
    window.dispatchEvent(new CustomEvent('delegations-updated'))
  }
}

const handleDecline = async (delegationId: string) => {
  if (!currentUser.value?.userId) return
  
  const success = await declineDelegation(delegationId, currentUser.value.userId)
  if (success) {
    await loadDelegations(currentUser.value.userId, props.type)
    window.dispatchEvent(new CustomEvent('delegations-updated'))
  }
}

const handleRemove = async (delegationId: string) => {
  if (!currentUser.value?.userId) return
  
  const success = await removeDelegation(delegationId, currentUser.value.userId)
  if (success) {
    await loadDelegations(currentUser.value.userId, props.type)
    window.dispatchEvent(new CustomEvent('delegations-updated'))
  }
}

const handleBack = () => {
  emit('back')
}
</script>

<template>
  <BaseModal
    :is-open="isOpen"
    :show-footer="false"
    max-width="sm"
    @close="emit('close')"
  >
    <template #header>
      <div class="custom-header">
        <button class="back-button" @click="handleBack" :aria-label="t('delegations.back')">
          <ArrowLeftIcon class="back-icon" />
        </button>
        <div class="header-content">
          <h2 class="modal-title">{{ title }}</h2>
          <p class="modal-subtitle">{{ subtitle }}</p>
        </div>
      </div>
    </template>

    <div v-if="isLoading" class="loading-state">
      <p>{{ t('delegations.loading') }}</p>
    </div>

    <div v-else-if="delegations.length === 0" class="empty-state">
      <p>{{ t('delegations.noResults') }}</p>
    </div>

    <div v-else class="delegations-list">
      <div
        v-for="delegation in delegations"
        :key="delegation.delegationId"
        class="delegation-item"
      >
        <div class="delegation-header">
          <div class="user-avatar">
            {{ getInitials(delegation.name, delegation.lastName) }}
          </div>
          <div class="user-info">
            <div class="user-name-row">
              <h4 class="user-name">{{ delegation.name }} {{ delegation.lastName }}</h4>
              <span 
                v-if="getStatusBadge(delegation.status)" 
                :class="['status-badge', getStatusBadge(delegation.status)?.class]"
              >
                {{ getStatusBadge(delegation.status)?.label }}
              </span>
            </div>
            <p class="user-fiscal-code">{{ delegation.fiscalCode }}</p>
            <p class="delegation-date">{{ parseItalianDate(delegation.date) }}</p>
          </div>
        </div>

        <!-- Actions for received delegations (pending) -->
        <div v-if="type === 'received' && delegation.status === 'Pending'" class="delegation-actions">
          <button class="action-button accept-button" @click="handleAccept(delegation.delegationId)">
            <CheckIcon class="action-icon" />
            {{ t('delegations.actions.accept') }}
          </button>
          <button class="action-button decline-button" @click="handleDecline(delegation.delegationId)">
            <XMarkIcon class="action-icon" />
            {{ t('delegations.actions.decline') }}
          </button>
        </div>

        <!-- Actions for received delegations (active) - can revoke -->
        <div v-if="type === 'received' && delegation.status === 'Active'" class="delegation-actions">
          <button class="action-button remove-button" @click="handleRemove(delegation.delegationId)">
            <TrashIcon class="action-icon" />
            {{ t('delegations.actions.revoke') }}
          </button>
        </div>

        <!-- Actions for sent delegations (active) - can remove access -->
        <div v-if="type === 'sent' && delegation.status === 'Active'" class="delegation-actions">
          <button class="action-button remove-button" @click="handleRemove(delegation.delegationId)">
            <TrashIcon class="action-icon" />
            {{ t('delegations.actions.remove') }}
          </button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.loading-state,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.custom-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  width: 100%;
}

.back-button {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--white-40);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--white-50);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  flex-shrink: 0;
}

.back-button:hover {
  background: var(--white-60);
  transform: translateX(-2px);
}

.back-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-primary);
  stroke-width: 2;
}

.header-content {
  flex: 1;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  margin-bottom: 0.25rem;
}

.modal-subtitle {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--text-secondary);
  margin: 0;
}

.delegations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.delegation-item {
  background: var(--white-40);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--white-50);
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 2px 8px var(--shadow), inset 0 1px 0 var(--white-60);
}

.delegation-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.user-avatar {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary-30);
  border-radius: 0.5rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  flex-shrink: 0;
}

.user-info {
  flex: 1;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.user-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.status-badge {
  padding: 0.125rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-pending {
  background: var(--warning-10);
  color: var(--warning);
  border: 1px solid var(--warning-30);
}

.status-active {
  background: var(--success-10);
  color: var(--success);
  border: 1px solid var(--success-30);
}

.status-declined {
  background: var(--error-10);
  color: var(--error);
  border: 1px solid var(--error-30);
}

.status-deleted {
  background: var(--text-primary-10);
  color: var(--text-secondary);
  border: 1px solid var(--text-primary-20);
}

.user-fiscal-code {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--text-secondary);
  margin: 0;
  margin-bottom: 0.25rem;
}

.delegation-date {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--text-tertiary);
  margin: 0;
}

.delegation-actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--white-50);
}

.action-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  border: 1px solid transparent;
}

.accept-button {
  background: var(--success-10);
  color: var(--success);
  border-color: var(--success-30);
}

.accept-button:hover {
  background: var(--success-20);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px var(--success-30);
}

.decline-button {
  background: var(--error-10);
  color: var(--error);
  border-color: var(--error-30);
}

.decline-button:hover {
  background: var(--error-20);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px var(--error-30);
}

.remove-button {
  background: var(--white-40);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: var(--text-primary);
  border-color: var(--white-50);
}

.remove-button:hover {
  background: var(--white-60);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px var(--shadow);
}

.action-icon {
  width: 1.125rem;
  height: 1.125rem;
  stroke-width: 2;
}

@media (max-width: 480px) {
  .modal-title {
    font-size: 1.25rem;
  }

  .delegation-header {
    margin-bottom: 0.75rem;
  }

  .user-avatar {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }

  .delegation-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .action-button {
    width: 100%;
  }
}
</style>
