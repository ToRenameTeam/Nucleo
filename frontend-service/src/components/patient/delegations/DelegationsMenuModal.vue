<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UserPlusIcon, InboxArrowDownIcon, PaperAirplaneIcon } from '@heroicons/vue/24/outline'
import MenuModal, { type MenuOption } from '../../shared/MenuModal.vue'
import { useDelegations } from '../../../composables/useDelegations'
import { useAuth } from '../../../composables/useAuth'

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

if (typeof window !== 'undefined') {
  window.addEventListener('delegations-updated', loadCounts)
}

const menuOptions = computed<MenuOption[]>(() => [
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
    action: () => emit('received-delegations'),
    badge: receivedCount.value > 0 ? receivedCount.value : undefined
  },
  {
    id: 'sent',
    title: t('delegations.menu.sentDelegations.title'),
    subtitle: t('delegations.menu.sentDelegations.subtitle', { count: sentCount.value }),
    icon: PaperAirplaneIcon,
    action: () => emit('sent-delegations'),
    badge: sentCount.value > 0 ? sentCount.value : undefined
  }
])
</script>

<template>
  <MenuModal
    :is-open="isOpen"
    :title="t('delegations.menu.title')"
    :subtitle="t('delegations.menu.subtitle')"
    :options="menuOptions"
    @close="emit('close')"
  />
</template>
