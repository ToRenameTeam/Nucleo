<script setup lang="ts">
import type { BaseCard } from '../../types/shared'

const props = withDefaults(defineProps<BaseCard>(), {
  selected: false,
  selectable: false,
  showActions: true,
  clickable: true
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
</script>

<template>
  <div 
    :id="cardId"
    :class="['base-card-wrapper', {
      'card-selectable': selectable,
      'card-selected': selected
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
          <!-- Title Row with Actions -->
          <div class="title-row">
            <h3 class="card-title">
              {{ title }}
            </h3>
            <!-- Title Actions (e.g., barcode button for prescriptions) -->
            <slot name="title-actions" />
          </div>

          <!-- Badges/Tags Section - nuovo slot! -->
          <div v-if="$slots.badges" class="badges-section">
            <slot name="badges" />
          </div>

          <!-- Description -->
          <p class="card-description">
            {{ description }}
          </p>

          <!-- Status Badge - nuovo slot! (e.g., expired, used) -->
          <div v-if="$slots['status-badge']" class="status-badge-section">
            <slot name="status-badge" />
          </div>

          <!-- Metadata (date, doctor, location, etc.) -->
          <div class="metadata-row">
            <div v-for="(meta, index) in metadata" :key="index" class="meta-item">
              <component :is="meta.icon" class="meta-icon" />
              <span>{{ meta.label }}</span>
            </div>
          </div>

          <!-- Actions Slot (bottom right) -->
          <div v-if="showActions && $slots.actions" class="card-actions">
            <slot name="actions" />
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
  flex-direction: column;
  gap: 0.5rem;
  flex: 1 1 0%;
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
  max-width: calc(100% - 10rem);
  line-height: 1.2;
  margin: 0;
}

.badges-section {
  margin-bottom: 0.5rem;
}

.card-description {
  color: var(--text-default, var(--text-secondary));
  font-size: 0.98rem;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: calc(100% - 12rem);
  margin: 0;
  line-height: 1.4;
}

.status-badge-section {
  margin: 0.5rem 0;
}

.metadata-row {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  color: var(--text-metadata, var(--text-secondary));
  gap: 1.25rem;
  max-width: calc(100% - 12rem);
  font-size: 0.97rem;
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
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: stretch;
  min-width: 200px;
}

@media (max-width: 1024px) {
  .card-title {
    max-width: calc(100% - 8rem);
  }

  .card-description {
    max-width: calc(100% - 10rem);
  }

  .metadata-row {
    max-width: calc(100% - 10rem);
  }
}

@media (max-width: 768px) {

  .card-title,
  .card-description,
  .metadata-row {
    max-width: 100%;
  }

  .card-content {
    gap: 1rem;
  }
}

@media (max-width: 640px) {
  .base-card {
    padding: 1rem;
  }

  .card-actions {
    position: static;
    margin-top: 1rem;
    flex-direction: row;
    gap: 0.5rem;
    align-items: center;
    min-width: auto;
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