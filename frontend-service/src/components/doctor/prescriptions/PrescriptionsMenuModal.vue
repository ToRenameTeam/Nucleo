<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { BeakerIcon, ClipboardDocumentListIcon } from '@heroicons/vue/24/outline'
import MenuModal, { type MenuOption } from '../../shared/MenuModal.vue'

const { t } = useI18n()

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  'medicine-prescription': []
  'service-prescription': []
}>()

const menuOptions = computed<MenuOption[]>(() => [
  {
    id: 'medicine',
    title: t('doctor.documents.prescriptions.menu.medicine.title'),
    subtitle: t('doctor.documents.prescriptions.menu.medicine.subtitle'),
    icon: BeakerIcon,
    action: () => emit('medicine-prescription')
  },
  {
    id: 'service',
    title: t('doctor.documents.prescriptions.menu.service.title'),
    subtitle: t('doctor.documents.prescriptions.menu.service.subtitle'),
    icon: ClipboardDocumentListIcon,
    action: () => emit('service-prescription')
  }
])
</script>

<template>
  <MenuModal
    :is-open="isOpen"
    :title="t('doctor.documents.prescriptions.menu.title')"
    :subtitle="t('doctor.documents.prescriptions.menu.subtitle')"
    :options="menuOptions"
    @close="emit('close')"
  />
</template>