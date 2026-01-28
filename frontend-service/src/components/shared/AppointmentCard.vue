<script setup lang="ts">
import { computed } from 'vue'
import { CalendarIcon, MapPinIcon, UserIcon, ClockIcon, PencilIcon, XCircleIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'
import BaseCard from '../shared/BaseCard.vue'
import type { CardMetadata } from '../../types/shared'
import type { AppointmentCard } from '../../types/appointment'
import { TAG_COLOR_MAP, TAG_ICON_MAP } from '../../constants/mockData'
import type { BadgeColors } from '../../types/document'

const { t } = useI18n()

const props = defineProps<AppointmentCard>()

const emit = defineEmits<{
  click: [id: string]
  edit: [id: string]
  cancel: [id: string]
}>()

const getBadgeColors = (tag: string): BadgeColors => {
  const normalizedTag = tag.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  const colorKey = TAG_COLOR_MAP[normalizedTag]

  if (colorKey) {
    return {
      color: `var(--badge-${colorKey})`,
      bgColor: `var(--badge-${colorKey}-bg)`,
      borderColor: `var(--badge-${colorKey}-border)`
    }
  }

  return {
    color: 'var(--text-primary)',
    bgColor: 'var(--bg-secondary-30)',
    borderColor: 'var(--border-color)'
  }
}

const getBadgeIcon = (tag: string): string => {
  const normalizedTag = tag.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  return TAG_ICON_MAP[normalizedTag] || '🧑‍⚕️'
}

const metadata = computed<CardMetadata[]>(() => {
  const meta: CardMetadata[] = [
    { icon: CalendarIcon, label: props.appointment.date }
  ]
  
  if (props.appointment.time) {
    meta.push({ icon: ClockIcon, label: props.appointment.time })
  }
  
  if (props.appointment.user) {
    meta.push({ icon: UserIcon, label: props.appointment.user })
  }
  
  if (props.appointment.location) {
    meta.push({ icon: MapPinIcon, label: props.appointment.location })
  }
  
  return meta
})

const handleClick = () => {
  emit('click', props.appointment.id)
}

const handleEdit = (event: Event) => {
  event.stopPropagation()
  emit('edit', props.appointment.id)
}

const handleCancel = (event: Event) => {
  event.stopPropagation()
  emit('cancel', props.appointment.id)
}
</script>

<template>
  <BaseCard
    :title="appointment.title"
    :description="appointment.description"
    :icon="CalendarIcon"
    :metadata="metadata"
    :selected="selected"
    @click="handleClick"
  >
    <template v-if="appointment.tags && appointment.tags.length > 0" #badges>
      <div class="badges-row">
        <div 
          v-for="tag in appointment.tags.slice(0, 2)" 
          :key="tag" 
          class="appointment-badge" 
          :style="{
            color: getBadgeColors(tag).color,
            backgroundColor: getBadgeColors(tag).bgColor,
            borderColor: getBadgeColors(tag).borderColor
          }"
        >
          <span class="badge-icon">{{ getBadgeIcon(tag) }}</span>
          <span class="badge-label">{{ tag }}</span>
        </div>
      </div>
    </template>

    <template #actions>
      <button
        class="action-button edit-button"
        @click="handleEdit"
        :title="t('appointments.editAppointment')"
      >
        <PencilIcon class="icon-md" />
        <span>{{ t('appointments.editAppointment') }}</span>
      </button>
      <button
        class="action-button cancel-button"
        @click="handleCancel"
        :title="t('appointments.cancelAppointment')"
      >
        <XCircleIcon class="icon-md" />
        <span>{{ t('appointments.cancelAppointment') }}</span>
      </button>
    </template>
  </BaseCard>
</template>

<style scoped>
.badges-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.appointment-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border: 1.5px solid;
  border-radius: 0.75rem;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-weight: 600;
  font-size: 0.8125rem;
  box-shadow: 0 2px 8px var(--badge-shadow), inset 0 1px 0 var(--white-40);
  width: fit-content;
  animation: fadeInScale 0.4s cubic-bezier(0, 0, 0.2, 1);
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
}

.badge-icon {
  font-size: 1.125rem;
  line-height: 1;
}

.badge-label {
  font-weight: 600;
  letter-spacing: 0.01em;
  font-size: 0.8125rem;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.625rem;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  white-space: nowrap;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  width: 100%;
}

.edit-button {
  background: var(--white-60);
  border-color: var(--white-50);
  color: var(--text-primary);
  box-shadow: 0 2px 8px var(--shadow), inset 0 1px 0 var(--white-80);
}

.edit-button:hover {
  background: var(--white-80);
  border-color: var(--white-70);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow), inset 0 1px 0 var(--white-90);
}

.cancel-button {
  background: var(--white-50);
  border-color: var(--error-40);
  color: var(--error);
  box-shadow: 0 2px 8px var(--error-10), inset 0 1px 0 var(--white-60);
}

.cancel-button:hover {
  background: var(--white-70);
  border-color: var(--error-60);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--error-20), inset 0 1px 0 var(--white-80);
}

.icon-md {
  width: 1.25rem;
  height: 1.25rem;
  display: inline-block;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .action-button span {
    display: none;
  }
  
  .action-button {
    padding: 0.5rem;
    justify-content: center;
    min-width: 2rem;
  }
}
</style>