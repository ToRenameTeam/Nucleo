<script setup lang="ts">
import { computed } from 'vue'
import type { BaseCard } from '../../types/shared'

const props = withDefaults(defineProps<BaseCard>(), {
  selected: false,
  selectable: false,
  showActions: true,
  clickable: true,
  actions: () => []
})

const emit = defineEmits<{
  click: []
  toggleSelect: []
}>()

const handleClick = () => {
  if (props.selectable) {
    emit('toggleSelect')
  } else if (props.clickable) {
    emit('click')
  }
}

const handleActionClick = (event: Event, actionId: string) => {
  event.stopPropagation()
  const action = props.actions?.find(a => a.id === actionId)
  if (action && props.cardId) {
    action.onClick(props.cardId)
  }
}

const isCardSelected = computed(() => {
  return props.selectable && props.selected
})

const hasActions = computed(() => {
  return props.showActions && ((props.actions && props.actions.length > 0) || !!slots.actions)
})

const slots = defineSlots<{
  badges?: any
  'title-actions'?: any
  'status-badge'?: any
  actions?: any
}>()
</script>

<template>
  <div 
    :id="cardId"
    :class="['base-card-wrapper', {
      'card-selectable': selectable,
      'card-selected': isCardSelected
    }]" 
    @click="handleClick"
  >
    <!-- Selection Checkbox (when selectable) -->
    <div v-if="selectable" class="selection-checkbox" :class="{ 'checked': selected }">
      <svg v-if="selected" class="checkbox-icon" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clip-rule="evenodd" />
      </svg>
    </div>

    <!-- Card Content -->
    <div class="base-card">
      <div class="card-content" :class="{ 'card-not-clickable': !clickable && !selectable }">
        <!-- Icon -->
        <div class="icon-container">
          <div class="icon-bg">
            <component :is="icon" class="icon-main" />
          </div>
        </div>

        <!-- Content -->
        <div class="content-wrapper">
          <!-- Left Content Column -->
          <div class="left-content">
            <!-- Title Row with Title Actions -->
            <div class="title-row">
              <h3 class="card-title">
                {{ title }}
              </h3>
              <!-- Title Actions (e.g., barcode button for prescriptions) -->
              <slot name="title-actions" />
            </div>

            <!-- Badges/Tags Section -->
            <div v-if="$slots.badges" class="badges-section">
              <slot name="badges" />
            </div>

            <!-- Status Badge (e.g., expired, used) -->
            <div v-if="$slots['status-badge']" class="status-badge-section">
              <slot name="status-badge" />
            </div>

            <!-- Data Row with Description and Metadata -->
            <div class="data-row">
              <!-- Description -->
              <p class="card-description">
                {{ description }}
              </p>
              <!-- Metadata (date, doctor, location, etc.) -->
              <div class="metadata-container">
                <div v-for="(meta, index) in metadata" :key="index" class="meta-item">
                  <component :is="meta.icon" class="meta-icon" />
                  <span>{{ meta.label }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions (right side) -->
          <div v-if="hasActions" class="card-actions">
            <!-- Configurable Actions -->
            <template v-if="actions && actions.length > 0">
              <button
                v-for="action in actions"
                :key="action.id"
                :class="['action-button', `action-${action.variant}`]"
                :title="action.label"
                @click="handleActionClick($event, action.id)"
              >
                <component :is="action.icon" class="action-icon" />
                <span class="action-label">{{ action.label }}</span>
              </button>
            </template>
            <!-- Fallback to slot for backward compatibility -->
            <slot v-else name="actions" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.base-card-wrapper {
  position: relative;
  display: block;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
}

.base-card-wrapper.card-selectable {
  padding-left: 3rem;
}

.base-card-wrapper.card-selectable:hover {
  transform: translateX(4px);
}

.base-card-wrapper.card-selected .base-card {
  border: 2px solid var(--text-primary-60);
  background: var(--bg-secondary-40);
  box-shadow: 0 12px 40px var(--text-primary-18), 0 1px 2px var(--bg-secondary);
}

.selection-checkbox {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.75rem;
  height: 1.75rem;
  border: 2px solid var(--text-primary-20);
  border-radius: 0.5rem;
  background: var(--bg-secondary-80);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  z-index: 10;
}

.selection-checkbox.checked {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  backdrop-filter: blur(16px);
  border-color: var(--white-30);
  color: var(--white);
  box-shadow: 0 4px 12px var(--accent-primary-40);
}

.checkbox-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--white);
}

.base-card {
  background: var(--bg-secondary-25);
  backdrop-filter: blur(20px);
  border-radius: 1.25rem;
  padding: 1.5rem;
  border: 1.5px solid var(--bg-secondary-70);
  box-shadow: 0 4px 24px var(--shadow), 0 1px 2px var(--white-90);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
}

.base-card.card-not-clickable {
  cursor: default;
}

.base-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--text-primary-15), 0 1px 2px var(--white-90);
  background: var(--bg-secondary-35);
  border-color: var(--white-90);
  z-index: 10;
  position: relative;
}

.base-card.card-not-clickable:hover {
  transform: none;
  box-shadow: 0 4px 24px var(--shadow), 0 1px 2px var(--white-90);
  background: var(--bg-secondary-25);
  border-color: var(--bg-secondary-70);
}

.card-content {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.icon-container {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-bg {
  width: 3.5rem;
  height: 3.5rem;
  background: var(--white-30);
  backdrop-filter: blur(8px);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--white-40);
  box-shadow: 0 2px 8px var(--shadow);
}

.icon-main {
  width: 1.75rem;
  height: 1.75rem;
  color: var(--text-primary);
  display: block;
}

.content-wrapper {
  position: relative;
  display: flex;
  gap: 1.5rem;
  flex: 1 1 0%;
  min-width: 0;
  align-items: center;
}

.left-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.card-title {
  color: var(--text-heading);
  font-size: 1.125rem;
  font-weight: 600;
  word-break: break-word;
  overflow-wrap: break-word;
  flex: 1;
  min-width: 0;
  line-height: 1.2;
  margin: 0;
}

.badges-section {
  margin-bottom: 0.5rem;
}

.status-badge-section {
  margin: 0.5rem 0;
}

.data-row {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 100%;
}

.card-description {
  color: var(--text-default, var(--text-secondary));
  font-size: 1.0125rem;
  font-weight: 500;
  word-break: break-word;
  overflow-wrap: break-word;
  width: 100%;
  margin: 0;
  line-height: 1.4;
}

.metadata-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  color: var(--text-metadata, var(--text-secondary));
  font-size: 0.97rem;
  margin-top: auto;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.meta-icon {
  width: 1.1rem;
  height: 1.1rem;
  color: var(--text-metadata, var(--text-secondary));
  display: block;
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: stretch;
  min-width: 200px;
  flex-shrink: 0;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
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
  line-height: 1;
  font-family: inherit;
}

.action-icon {
  width: 1.25rem;
  height: 1.25rem;
  display: block;
  flex-shrink: 0;
}

.action-label {
  display: inline;
}

.action-primary {
  background: rgba(14, 165, 233, 0.8);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(14, 165, 233, 0.3),
              0 2px 4px rgba(0, 0, 0, 0.1),
              inset 0 1px 1px rgba(255, 255, 255, 0.25),
              inset 0 -1px 1px rgba(0, 0, 0, 0.05);
}

.action-primary:hover {
  background: rgba(12, 141, 199, 0.85);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(14, 165, 233, 0.4),
              0 3px 8px rgba(0, 0, 0, 0.15),
              inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.action-secondary {
  background: rgba(168, 85, 247, 0.8);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(168, 85, 247, 0.3),
              0 2px 4px rgba(0, 0, 0, 0.1),
              inset 0 1px 1px rgba(255, 255, 255, 0.25),
              inset 0 -1px 1px rgba(0, 0, 0, 0.05);
}

.action-secondary:hover {
  background: rgba(147, 51, 234, 0.85);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(168, 85, 247, 0.4),
              0 3px 8px rgba(0, 0, 0, 0.15),
              inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.action-warning {
  background: rgba(245, 158, 11, 0.8);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3),
              0 2px 4px rgba(0, 0, 0, 0.1),
              inset 0 1px 1px rgba(255, 255, 255, 0.25),
              inset 0 -1px 1px rgba(0, 0, 0, 0.05);
}

.action-warning:hover {
  background: rgba(217, 119, 6, 0.85);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(245, 158, 11, 0.4),
              0 3px 8px rgba(0, 0, 0, 0.15),
              inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.action-danger {
  background: rgba(239, 68, 68, 0.8);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3),
              0 2px 4px rgba(0, 0, 0, 0.1),
              inset 0 1px 1px rgba(255, 255, 255, 0.25),
              inset 0 -1px 1px rgba(0, 0, 0, 0.05);
}

.action-danger:hover {
  background: rgba(220, 38, 38, 0.85);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(239, 68, 68, 0.4),
              0 3px 8px rgba(0, 0, 0, 0.15),
              inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.action-ghost {
  background: var(--white-20);
  border-color: var(--white-40);
  color: var(--text-primary);
  box-shadow: 0 2px 8px var(--black-5), inset 0 1px 0 var(--white-60);
}

.action-ghost:hover {
  background: var(--white-40);
  border-color: var(--white-60);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--black-10), inset 0 1px 0 var(--white-80);
}

@media (max-width: 768px) {
  .card-content {
    gap: 1rem;
  }
  
  .content-wrapper {
    flex-direction: column;
  }
  
  .card-actions {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .base-card {
    padding: 1rem;
  }

  .card-actions {
    flex-direction: row;
    gap: 0.5rem;
  }

  .action-button {
    padding: 0.5rem;
    justify-content: center;
    min-width: 2rem;
  }

  .action-label {
    display: none;
  }

  .card-content {
    flex-direction: column;
    gap: 0.75rem;
  }

  .base-card-wrapper.card-selectable {
    padding-left: 2.5rem;
  }

  .selection-checkbox {
    left: 0.5rem;
    width: 1.5rem;
    height: 1.5rem;
  }

  .checkbox-icon {
    width: 1rem;
    height: 1rem;
  }
}
</style>