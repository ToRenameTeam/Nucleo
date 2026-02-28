<script setup lang="ts">
import { computed } from 'vue'
import BaseModal from '../../shared/BaseModal.vue'
import { ArrowPathIcon } from '@heroicons/vue/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/vue/24/solid'

interface Props {
  isOpen: boolean
  isLoading: boolean
  error: string | null
  filename: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const isCompleted = computed(() => !props.isLoading && !props.error)

const title = computed(() => {
  if (props.error) return 'upload.progress.title'
  return isCompleted.value ? 'upload.progress.successTitle' : 'upload.progress.title'
})
</script>

<template>
  <BaseModal
    :is-open="props.isOpen"
    :title="$t(title)"
    :subtitle="filename"
    max-width="md"
    :show-close="isCompleted || !!error"
    @close="emit('close')"
  >
    <div class="upload-progress-content">
      <!-- Error State -->
      <div v-if="error" class="error-message">
        <p>{{ $t(error) }}</p>
      </div>

      <!-- Loading State -->
      <div v-else-if="isLoading" class="loading-container">
        <ArrowPathIcon class="spinner-icon" />
        <p class="loading-text">{{ $t('upload.progress.loadingMessage') }}</p>
      </div>

      <!-- Success State -->
      <div v-else class="success-container">
        <CheckCircleIconSolid class="success-icon" />
        <p class="success-text">{{ $t('upload.progress.successMessage') }}</p>
      </div>
    </div>

    <!-- Footer -->
    <template #footer v-if="isCompleted || error">
      <button
        class="modal-button close-button"
        @click="emit('close')"
      >
        {{ $t('common.close') }}
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>
.upload-progress-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  min-height: 200px;
  padding: 2rem 0;
}

.error-message {
  padding: 1.25rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 1rem;
  text-align: center;
  width: 100%;
}

.error-message p {
  margin: 0;
  color: #dc2626;
  font-weight: 500;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.spinner-icon {
  width: 3rem;
  height: 3rem;
  color: var(--purple-a855f7);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-text {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--gray-737373);
  text-align: center;
}

.success-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.success-icon {
  width: 3.5rem;
  height: 3.5rem;
  color: var(--sky-0ea5e9);
}

.success-text {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--gray-737373);
  text-align: center;
}

.modal-button {
  width: 100%;
  padding: 0.875rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  border: none;
}

.close-button {
  background: linear-gradient(135deg, var(--sky-0ea5e9) 0%, var(--purple-a855f7) 100%);
  color: white;
  box-shadow: 0 4px 16px var(--sky-0ea5e9-30);
}

.close-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--sky-0ea5e9-30);
}

@media (max-width: 768px) {
  .upload-progress-content {
    min-height: 150px;
  }
}
</style>
