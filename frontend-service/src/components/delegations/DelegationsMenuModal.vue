<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UserPlusIcon, InboxArrowDownIcon, PaperAirplaneIcon } from '@heroicons/vue/24/outline'
import BaseModal from '../shared/BaseModal.vue'
import { useDelegations } from '../../composables/useDelegations'
import { useAuth } from '../../composables/useAuth'

const { t } = useI18n()
const { currentUser } = useAuth()
const { countDelegations } = useDelegations()

const props = defineProps<{
  isOpen: boolean
}>()

const receivedCount = ref(0)
const sentCount = ref(0)

const emit = defineEmits<{
  close: []
  'new-delegation': []
  'received-delegations': []
  'sent-delegations': []
}>()

// Carica i conteggi quando il modal viene aperto
const loadCounts = async () => {
  if (!currentUser.value?.userId) return
  
  const counts = await countDelegations(currentUser.value.userId)
  receivedCount.value = counts.received
  sentCount.value = counts.sent
}

watch(() => props.isOpen, async (isOpen) => {
  if (isOpen && currentUser.value?.userId) {
    await loadCounts()
  }
})

// Ricarica i conteggi quando ci sono aggiornamenti
if (typeof window !== 'undefined') {
  window.addEventListener('delegations-updated', loadCounts)
}

const menuOptions = computed(() => [
  {
    id: 'new',
    title: t('delegations.menu.newDelegation.title'),
    subtitle: t('delegations.menu.newDelegation.subtitle'),
    icon: UserPlusIcon,
    action: () => emit('new-delegation')
  },
  {
    id: 'received',
    title: t('delegations.menu.receivedDelegations.title'),
    subtitle: t('delegations.menu.receivedDelegations.subtitle', { count: receivedCount.value }),
    icon: InboxArrowDownIcon,
    action: () => emit('received-delegations')
  },
  {
    id: 'sent',
    title: t('delegations.menu.sentDelegations.title'),
    subtitle: t('delegations.menu.sentDelegations.subtitle', { count: sentCount.value }),
    icon: PaperAirplaneIcon,
    action: () => emit('sent-delegations')
  }
])
</script>

<template>
  <BaseModal
    :is-open="isOpen"
    :title="t('delegations.menu.title')"
    :subtitle="t('delegations.menu.subtitle')"
    :show-footer="false"
    max-width="sm"
    @close="emit('close')"
  >
    <div class="menu-options">
      <button
        v-for="option in menuOptions"
        :key="option.id"
        class="menu-option"
        @click="option.action"
      >
        <div class="option-icon">
          <component :is="option.icon" class="icon" />
        </div>
        <div class="option-content">
          <h3 class="option-title">{{ option.title }}</h3>
          <p class="option-subtitle">{{ option.subtitle }}</p>
        </div>
      </button>
    </div>
  </BaseModal>
</template>

<style scoped>
.menu-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.menu-option {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;
  background: var(--white-40);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  text-align: left;
  width: 100%;
  box-shadow: 0 2px 8px var(--shadow), inset 0 1px 0 var(--white-60);
}

.menu-option:hover {
  background: var(--bg-secondary-35);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px var(--text-primary-15), 0 1px 2px var(--white-90);
}

.menu-option:active {
  transform: translateY(0);
}

.option-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px var(--accent-primary-30), inset 0 1px 0 var(--white-20);
}

.icon {
  width: 1.75rem;
  height: 1.75rem;
  color: var(--white);
  stroke-width: 2;
}

.option-content {
  flex: 1;
}

.option-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  margin-bottom: 0.25rem;
}

.option-subtitle {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--text-secondary);
  margin: 0;
}

@media (max-width: 480px) {
  .menu-option {
    padding: 1rem;
    gap: 1rem;
  }

  .option-icon {
    width: 2.5rem;
    height: 2.5rem;
  }

  .icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  .option-title {
    font-size: 1rem;
  }

  .option-subtitle {
    font-size: 0.8125rem;
  }
}
</style>
