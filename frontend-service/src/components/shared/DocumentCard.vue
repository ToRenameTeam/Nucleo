<script setup lang="ts">
import { computed } from 'vue'
import { DocumentIcon, MapPinIcon, UserIcon, CalendarIcon } from '@heroicons/vue/24/outline'
import BaseCard from './BaseCard.vue'
import type { CardMetadata } from '../../types/shared'
import type { DocumentCard, BadgeColors } from '../../types/document'
import { TAG_COLOR_MAP, TAG_ICON_MAP } from '../../constants/categoryBadgeConfig'

const props = withDefaults(defineProps<DocumentCard>(), {
  selectable: false,
  selected: false
})

const emit = defineEmits<{
  click: []
  toggleSelect: []
}>()

const handleCardClick = () => {
  if (props.selectable) {
    emit('toggleSelect')
    return
  }

  emit('click')
}

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

  return TAG_ICON_MAP[normalizedTag] || '📄'
}

const metadata = computed<CardMetadata[]>(() => {
  const meta: CardMetadata[] = [
    { icon: CalendarIcon, label: props.document.date }
  ]

  if (props.document.doctor) {
    meta.push({ icon: UserIcon, label: props.document.doctor })
  }

  if (props.document.hospital) {
    meta.push({ icon: MapPinIcon, label: props.document.hospital })
  }

  return meta
})

</script>

<template>
  <BaseCard
    :title="document.title"
    :description="document.description"
    :icon="DocumentIcon"
    :metadata="metadata"
    :selectable="selectable"
    :selected="selected"
    @click="handleCardClick"
    @toggle-select="emit('toggleSelect')"
  >
    <!-- Document Badges/Tags -->
    <template #badges>
      <div class="badges-row">
        <div 
          v-for="tag in document.tags.slice(0, 2)" 
          :key="tag" 
          class="document-badge" 
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

      <!-- Slot for custom document details (e.g., prescription info) -->
      <slot name="details"></slot>
    </template>

    <!-- Slot for actions -->
    <template #actions>
      <slot name="actions"></slot>
    </template>
  </BaseCard>
</template>

<style scoped>
.badges-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.document-badge {
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
</style>