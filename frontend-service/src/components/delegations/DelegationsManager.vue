<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UsersIcon } from '@heroicons/vue/24/outline'
import DelegationsMenuModal from './DelegationsMenuModal.vue'
import NewDelegationModal from './NewDelegationModal.vue'
import DelegationsListModal from './DelegationsListModal.vue'
import Toast from '../shared/Toast.vue'
import { useAuth } from '../../composables/useAuth'
import { useDelegations } from '../../composables/useDelegations'

const { t } = useI18n()
const { currentUser } = useAuth()
const { createDelegation } = useDelegations()

const isDelegationsModalOpen = ref(false)
const isNewDelegationModalOpen = ref(false)
const isDelegationsListModalOpen = ref(false)
const delegationsListType = ref<'received' | 'sent'>('received')
const showSuccessToast = ref(false)
const successToastMessage = ref('')
const delegationSendError = ref('')
const newDelegationModalKey = ref(0)

const openDelegationsModal = () => {
  isDelegationsModalOpen.value = true
}

const closeDelegationsModal = () => {
  isDelegationsModalOpen.value = false
}

const handleNewDelegation = () => {
  closeDelegationsModal()
  isNewDelegationModalOpen.value = true
}

const closeNewDelegationModal = () => {
  isNewDelegationModalOpen.value = false
  delegationSendError.value = ''
}

const handleBackFromNewDelegation = () => {
  isNewDelegationModalOpen.value = false
  delegationSendError.value = ''
  isDelegationsModalOpen.value = true
}

const handleSendDelegationRequest = async (fiscalCode: string) => {
  if (!currentUser.value?.userId) return

  delegationSendError.value = ''

  const result = await createDelegation(fiscalCode, currentUser.value.userId)
  
  if (result.success) {
    isNewDelegationModalOpen.value = false
    newDelegationModalKey.value++
    
    successToastMessage.value = t('delegations.toast.delegationSent', { name: result.userName })
    showSuccessToast.value = true
    
    window.dispatchEvent(new CustomEvent('delegations-updated'))
  } else {
    delegationSendError.value = mapErrorToMessage(new Error(result.error || 'Unknown error'))
  }
}

const handleReceivedDelegations = () => {
  closeDelegationsModal()
  delegationsListType.value = 'received'
  isDelegationsListModalOpen.value = true
}

const handleSentDelegations = () => {
  closeDelegationsModal()
  delegationsListType.value = 'sent'
  isDelegationsListModalOpen.value = true
}

const closeDelegationsListModal = () => {
  isDelegationsListModalOpen.value = false
}

const handleBackFromDelegationsList = () => {
  isDelegationsListModalOpen.value = false
  isDelegationsModalOpen.value = true
}

const handleCloseToast = () => {
  showSuccessToast.value = false
}

const mapErrorToMessage = (error: Error): string => {
  const errorMessage = error.message.toLowerCase()
  console.error('Delegation error:', errorMessage)
  
  if (errorMessage.includes('already exists')) {
    return t('delegations.errors.delegationAlreadyExists')
  }
  if (errorMessage.includes('not found')) {
    return t('delegations.errors.userNotFound')
  }
  if (errorMessage.includes('cannot delegate to yourself')) {
    return t('delegations.errors.cannotDelegateToYourself')
  }
  
  return t('delegations.errors.actionFailed')
}
</script>

<template>
  <div class="delegations-manager">
    <button class="delegations-button" @click="openDelegationsModal">
      <UsersIcon class="delegations-icon" />
      {{ t('patientChoice.manageDelegations') }}
    </button>

    <DelegationsMenuModal
      :is-open="isDelegationsModalOpen"
      @close="closeDelegationsModal"
      @new-delegation="handleNewDelegation"
      @received-delegations="handleReceivedDelegations"
      @sent-delegations="handleSentDelegations"
    />

    <NewDelegationModal
      :key="newDelegationModalKey"
      :is-open="isNewDelegationModalOpen"
      :send-error="delegationSendError"
      @close="closeNewDelegationModal"
      @back="handleBackFromNewDelegation"
      @send="handleSendDelegationRequest"
    />

    <DelegationsListModal
      :is-open="isDelegationsListModalOpen"
      :type="delegationsListType"
      @close="closeDelegationsListModal"
      @back="handleBackFromDelegationsList"
    />

    <Toast
      :show="showSuccessToast"
      :message="successToastMessage"
      :duration="4000"
      @close="handleCloseToast"
    />
  </div>
</template>

<style scoped>
.delegations-manager {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.delegations-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  color: var(--white);
  border: 1px solid var(--white-30);
  border-radius: 9999px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px var(--accent-primary-30), 0 2px 8px var(--accent-primary-20), inset 0 1px 0 var(--white-20);
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  z-index: 1000;
  pointer-events: auto;
  animation: fadeIn 0.6s cubic-bezier(0, 0, 0.2, 1);
  animation-delay: 0.6s;
  animation-fill-mode: both;
}

.delegations-button:hover {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px var(--accent-primary-40), 0 4px 12px var(--accent-primary-30), inset 0 1px 0 var(--white-30);
}

.delegations-button:active {
  transform: translateY(-2px);
}

.delegations-icon {
  width: 1.5rem;
  height: 1.5rem;
  stroke-width: 2;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .delegations-button {
    bottom: 1.5rem;
    right: 1.5rem;
    padding: 0.875rem 1.25rem;
    font-size: 0.9375rem;
  }
  .delegations-icon {
    width: 1.375rem;
    height: 1.375rem;
  }
}

@media (max-width: 480px) {
  .delegations-button {
    bottom: 1rem;
    right: 1rem;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }
  .delegations-icon {
    width: 1.25rem;
    height: 1.25rem;
  }
}
</style>
