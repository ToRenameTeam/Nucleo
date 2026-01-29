<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UsersIcon } from '@heroicons/vue/24/outline'
import DelegationsMenuModal from './DelegationsMenuModal.vue'
import NewDelegationModal from './NewDelegationModal.vue'
import DelegationsListModal from './DelegationsListModal.vue'
import type { DelegationItem } from '../../types/delegation'

const { t } = useI18n()

const isDelegationsModalOpen = ref(false)
const isNewDelegationModalOpen = ref(false)
const isDelegationsListModalOpen = ref(false)
const delegationsListType = ref<'received' | 'sent'>('received')
const delegationsList = ref<DelegationItem[]>([])

// Menu modal handlers
const openDelegationsModal = () => {
  isDelegationsModalOpen.value = true
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
}

const handleBackFromNewDelegation = () => {
  isNewDelegationModalOpen.value = false
  isDelegationsModalOpen.value = true
}

const handleSendDelegationRequest = (fiscalCode: string) => {
  console.log('Invio richiesta delega per:', fiscalCode)
  // TODO: Implement API call
  isNewDelegationModalOpen.value = false
}

// Received delegations handlers
const handleReceivedDelegations = () => {
  closeDelegationsModal()
  delegationsListType.value = 'received'
  // TODO: Load received delegations from API
  delegationsList.value = [
    {
      delegationId: '1',
      userId: 'user1',
      name: 'Maria',
      lastName: 'Bianchi',
      fiscalCode: 'BNCMRA88A41H501Z',
      date: '2024-01-15',
      status: 'Pending'
    },
    {
      delegationId: '2',
      userId: 'user2',
      name: 'Anna',
      lastName: 'Neri',
      fiscalCode: 'NRANNA50S50I501Y',
      date: '2024-01-08',
      status: 'Active'
    }
  ]
  isDelegationsListModalOpen.value = true
}

// Sent delegations handlers
const handleSentDelegations = () => {
  closeDelegationsModal()
  delegationsListType.value = 'sent'
  // TODO: Load sent delegations from API
  delegationsList.value = [
    {
      delegationId: '3',
      userId: 'user3',
      name: 'Paolo',
      lastName: 'Verdi',
      fiscalCode: 'VRDPLA75M15H501W',
      date: '2024-01-10',
      status: 'Active'
    }
  ]
  isDelegationsListModalOpen.value = true
}

// Delegations list handlers
const closeDelegationsListModal = () => {
  isDelegationsListModalOpen.value = false
}

const handleBackFromDelegationsList = () => {
  isDelegationsListModalOpen.value = false
  isDelegationsModalOpen.value = true
}

const handleAcceptDelegation = (delegationId: string) => {
  console.log('Accetta delega:', delegationId)
  // TODO: Implement API call
  // After success, update the list or reload
}

const handleDeclineDelegation = (delegationId: string) => {
  console.log('Rifiuta delega:', delegationId)
  // TODO: Implement API call
  // After success, update the list or reload
}

const handleRemoveDelegation = (delegationId: string) => {
  console.log('Rimuovi delega:', delegationId)
  // TODO: Implement API call
  // After success, update the list or reload
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
      @close="closeDelegationsModal"
      @new-delegation="handleNewDelegation"
      @received-delegations="handleReceivedDelegations"
      @sent-delegations="handleSentDelegations"
    />

    <!-- New delegation modal -->
    <NewDelegationModal
      :is-open="isNewDelegationModalOpen"
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
