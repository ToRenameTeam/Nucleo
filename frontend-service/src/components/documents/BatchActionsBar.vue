<script setup lang="ts">
import { computed } from 'vue'
import { ArrowDownTrayIcon, XMarkIcon, CheckIcon } from '@heroicons/vue/24/outline'
import type { BatchActions } from '../../types/document'

const props = defineProps<BatchActions>()
const emit = defineEmits<{
  downloadAll: []
  deselectAll: []
  cancel: []
}>()

// Group documents by category
const categoryCounts = computed(() => {
  const counts: Record<string, number> = {}
  props.selectedDocuments.forEach(doc => {
    doc.tags.forEach(tag => {
      counts[tag] = (counts[tag] || 0) + 1
    })
  })
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3) // Show top 3 categories
})

const allSelected = computed(() => {
  return props.selectedDocuments.length === props.totalDocuments
})
</script>

<template>
  <Transition name="slide-up">
    <div v-if="selectedDocuments.length > 0" class="batch-actions-bar">
      <div class="bar-content">
        <div class="selection-info">
          <div class="selection-header">
            <CheckIcon class="icon-check" aria-label="check" />
            <span class="selection-count">
              {{ selectedDocuments.length }} 
              {{ selectedDocuments.length === 1 ? $t('documents.batch.documentSelected') : $t('documents.batch.documentsSelected') }}
            </span>
            <span v-if="allSelected" class="all-badge">{{ $t('documents.batch.all') }}</span>
          </div>
          
          <div v-if="categoryCounts.length > 0" class="category-breakdown">
            <span
              v-for="[category, count] in categoryCounts"
              :key="category"
              class="category-pill"
            >
              {{ category }} ({{ count }})
            </span>
          </div>
        </div>

        <div class="action-buttons">
          <button class="action-btn download-btn" @click="emit('downloadAll')" :aria-label="$t('documents.batch.downloadAll')">
            <ArrowDownTrayIcon class="icon-action" />
            <span class="btn-label">{{ $t('documents.batch.downloadAll') }}</span>
          </button>
          <button class="action-btn deselect-btn" @click="emit('deselectAll')" :aria-label="$t('documents.batch.deselectAll')">
            <span class="btn-label">{{ $t('documents.batch.deselectAll') }}</span>
          </button>
          <button class="action-btn cancel-btn" @click="emit('cancel')" :aria-label="$t('documents.selection.cancel')">
            <XMarkIcon class="icon-action" />
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.batch-actions-bar {
  position: fixed;
  top: 5.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 4rem);
  max-width: 900px;
  z-index: 40;
  animation: slideInDown 0.3s cubic-bezier(0, 0, 0.2, 1);
}

.bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1rem 1.5rem;
  background: var(--white-40);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--white-60);
  border-radius: 1.25rem;
  box-shadow: 0 8px 32px var(--shadow), inset 0 1px 0 var(--white-80), 0 0 0 1px var(--text-primary-10);
}

.selection-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.selection-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-check {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--blue-3b82f6);
}

.selection-count {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.all-badge {
  padding: 0.125rem 0.5rem;
  background: var(--success-20);
  border: 1px solid var(--success-40);
  border-radius: 0.375rem;
  color: var(--success);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-breakdown {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.category-pill {
  padding: 0.25rem 0.625rem;
  background: var(--accent-primary-8);
  border: 1px solid var(--accent-primary-20);
  border-radius: 0.5rem;
  color: var(--accent-primary);
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  white-space: nowrap;
  border: none;
  outline: none;
}

.download-btn {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  border: 1px solid var(--white-20);
  color: var(--bg-primary);
  box-shadow: 0 4px 16px var(--accent-primary-40);
}

.download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--accent-primary-50);
}

.deselect-btn {
  background: var(--black-5);
  border: 1px solid var(--text-primary-10);
  color: var(--text-secondary);
}

.deselect-btn:hover {
  background: var(--black-8);
  transform: translateY(-2px);
}

.cancel-btn {
  padding: 0.625rem;
  background: var(--error-15);
  border: 1px solid var(--error-30);
  color: var(--error);
}

.cancel-btn:hover {
  background: var(--error-25);
  transform: translateY(-2px);
}

.icon-action {
  width: 1.25rem;
  height: 1.25rem;
}

.btn-label {
  display: inline;
}

/* Slide up animation for transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translate(-50%, -20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%);
  }
}

@media (max-width: 768px) {
  .batch-actions-bar {
    width: calc(100% - 2rem);
    top: 5rem;
  }
  .bar-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    padding: 1rem;
  }
  .action-buttons {
    justify-content: stretch;
  }
  .action-btn {
    flex: 1;
  }
  .btn-label {
    display: none;
  }
}
</style>
