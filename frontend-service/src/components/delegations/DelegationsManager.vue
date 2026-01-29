<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UsersIcon } from '@heroicons/vue/24/outline'
import DelegationsMenuModal from './DelegationsMenuModal.vue'
import NewDelegationModal from './NewDelegationModal.vue'
import DelegationsListModal from './DelegationsListModal.vue'
import Toast from '../shared/Toast.vue'
import { useAuth } from '../../authentication/useAuth'
import { delegationApi } from '../../api/delegations'
import { authApi } from '../../api/users'
import type { DelegationItem } from '../../types/delegation'
import type { UserData } from '../../types/auth'

const { t } = useI18n()
const { currentUser } = useAuth()

const isDelegationsModalOpen = ref(false)
const isNewDelegationModalOpen = ref(false)
const isDelegationsListModalOpen = ref(false)
const delegationsListType = ref<'received' | 'sent'>('received')
const delegationsList = ref<DelegationItem[]>([])
const receivedDelegationsCount = ref(0)
const sentDelegationsCount = ref(0)
const showSuccessToast = ref(false)
const successToastMessage = ref('')
const delegationSendError = ref('')
const newDelegationModalKey = ref(0)

// Menu modal handlers
const openDelegationsModal = async () => {
  isDelegationsModalOpen.value = true
  await loadDelegationsCounts()
}

const loadDelegationsCounts = async () => {
  if (!currentUser.value?.userId) return

  try {
    const [receivedResponse, sentResponse] = await Promise.all([
      delegationApi.getReceivedDelegations(currentUser.value.userId),
      delegationApi.getSentDelegations(currentUser.value.userId)
    ])
    receivedDelegationsCount.value = receivedResponse.delegations.length
    sentDelegationsCount.value = sentResponse.delegations.length
  } catch (error) {
    console.error('Error loading delegations counts:', error)
    receivedDelegationsCount.value = 0
    sentDelegationsCount.value = 0
  }
}

const closeDelegationsModal = () => {
  isDelegationsModalOpen.value = false
}

// New delegation handlers
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

  try {
    const foundUser = await delegationApi.searchUserByFiscalCode(fiscalCode)
    
    await delegationApi.createDelegation({
      delegatingUserId: foundUser.userId,
      delegatorUserId: currentUser.value.userId
    })
    
    // Success: close modal and reset it
    isNewDelegationModalOpen.value = false
    newDelegationModalKey.value++ // Force modal reset
    
    // Show success toast
    successToastMessage.value = t('delegations.toast.delegationSent', { name: `${foundUser.name} ${foundUser.lastName}` })
    showSuccessToast.value = true
    
    // Reload counts
    await loadDelegationsCounts()
  } catch (error) {
    console.error('Error sending delegation request:', error)
    delegationSendError.value = error instanceof Error ? mapErrorToMessage(error) : t('delegations.errors.actionFailed')
  }
}

const handleReceivedDelegations = async () => {
  if (!currentUser.value?.userId) return

  closeDelegationsModal()
  delegationsListType.value = 'received'
  
  await loadReceivedDelegations()
  
  isDelegationsListModalOpen.value = true
}

const handleSentDelegations = async () => {
  if (!currentUser.value?.userId) return

  closeDelegationsModal()
  delegationsListType.value = 'sent'
  
  await loadSentDelegations()
  
  isDelegationsListModalOpen.value = true
}

const closeDelegationsListModal = () => {
  isDelegationsListModalOpen.value = false
}

const handleBackFromDelegationsList = () => {
  isDelegationsListModalOpen.value = false
  isDelegationsModalOpen.value = true
}

// Helper function to reload the current list based on type
const reloadCurrentList = async () => {
  if (delegationsListType.value === 'received') {
    await loadReceivedDelegations()
  } else {
    await loadSentDelegations()
  }
}

// Extracted loading logic for reuse
const loadReceivedDelegations = async () => {
  if (!currentUser.value?.userId) return

  try {
    const response = await delegationApi.getReceivedDelegations(currentUser.value.userId)
    
    const items = await Promise.all(
      response.delegations.map(async (delegation): Promise<DelegationItem | null> => {
        try {
          const userData = await authApi.getUserById(delegation.delegatorUserId) as UserData
          return {
            delegationId: delegation.delegationId,
            userId: delegation.delegatorUserId,
            name: userData.name || '',
            lastName: userData.lastName || '',
            fiscalCode: userData.fiscalCode || '',
            date: new Date().toISOString().split('T')[0] || '',
            status: delegation.status
          }
        } catch (err) {
          console.error(`Error loading user ${delegation.delegatorUserId}:`, err)
          return null
        }
      })
    )
    
    delegationsList.value = items.filter((item): item is DelegationItem => item !== null)
  } catch (error) {
    console.error('Error loading received delegations:', error)
    delegationsList.value = []
  }
}

const loadSentDelegations = async () => {
  if (!currentUser.value?.userId) return

  try {
    const response = await delegationApi.getSentDelegations(currentUser.value.userId)
    
    const items = await Promise.all(
      response.delegations.map(async (delegation): Promise<DelegationItem | null> => {
        try {
          const userData = await authApi.getUserById(delegation.delegatingUserId) as UserData
          return {
            delegationId: delegation.delegationId,
            userId: delegation.delegatingUserId,
            name: userData.name ?? '',
            lastName: userData.lastName ?? '',
            fiscalCode: userData.fiscalCode ?? '',
            date: new Date().toISOString().split('T')[0] ?? '',
            status: delegation.status
          }
        } catch (err) {
          console.error(`Error loading user ${delegation.delegatingUserId}:`, err)
          return null
        }
      })
    )
    
    delegationsList.value = items.filter((item): item is DelegationItem => item !== null)
  } catch (error) {
    console.error('Error loading sent delegations:', error)
    delegationsList.value = []
  }
}

const handleAcceptDelegation = async (delegationId: string) => {
  if (!currentUser.value?.userId) return

  try {
    await delegationApi.acceptDelegation(delegationId, currentUser.value.userId)
    // Reload the current list to get updated data
    await reloadCurrentList()
    // Notify PatientChoice to reload profiles
    window.dispatchEvent(new CustomEvent('delegations-updated'))
  } catch (error) {
    console.error('Error accepting delegation:', error)
  }
}

const handleDeclineDelegation = async (delegationId: string) => {
  if (!currentUser.value?.userId) return

  try {
    await delegationApi.declineDelegation(delegationId, currentUser.value.userId)
    // Reload the current list to get updated data
    await reloadCurrentList()
    // Notify PatientChoice to reload profiles
    window.dispatchEvent(new CustomEvent('delegations-updated'))
  } catch (error) {
    console.error('Error declining delegation:', error)
  }
}

const handleRemoveDelegation = async (delegationId: string) => {
  if (!currentUser.value?.userId) return

  try {
    await delegationApi.deleteDelegation(delegationId, currentUser.value.userId)
    // Reload the current list to get updated data
    await reloadCurrentList()
    // Notify PatientChoice to reload profiles
    window.dispatchEvent(new CustomEvent('delegations-updated'))
  } catch (error) {
    console.error('Error removing delegation:', error)
  }
}

const handleCloseToast = () => {
  showSuccessToast.value = false
}

// Map API errors to translated messages
const mapErrorToMessage = (error: Error): string => {
  const errorMessage = error.message.toLowerCase()
  
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
    <!-- Floating action button -->
    <button class="delegations-button" @click="openDelegationsModal">
      <UsersIcon class="delegations-icon" />
      {{ t('patientChoice.manageDelegations') }}
    </button>

    <!-- Menu modal -->
    <DelegationsMenuModal
      :is-open="isDelegationsModalOpen"
      :received-count="receivedDelegationsCount"
      :sent-count="sentDelegationsCount"
      @close="closeDelegationsModal"
      @new-delegation="handleNewDelegation"
      @received-delegations="handleReceivedDelegations"
      @sent-delegations="handleSentDelegations"
    />

    <!-- New delegation modal -->
    <NewDelegationModal
      :key="newDelegationModalKey"
      :is-open="isNewDelegationModalOpen"
      :send-error="delegationSendError"
      @close="closeNewDelegationModal"
      @back="handleBackFromNewDelegation"
      @send="handleSendDelegationRequest"
    />

    <!-- Delegations list modal (received/sent) -->
    <DelegationsListModal
      :is-open="isDelegationsListModalOpen"
      :type="delegationsListType"
      :delegations="delegationsList"
      @close="closeDelegationsListModal"
      @back="handleBackFromDelegationsList"
      @accept="handleAcceptDelegation"
      @decline="handleDeclineDelegation"
      @remove="handleRemoveDelegation"
    />

    <!-- Success Toast -->
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
