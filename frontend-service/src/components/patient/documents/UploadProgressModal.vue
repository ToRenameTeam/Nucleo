<script setup lang="ts">
import { computed } from 'vue'
import BaseModal from '../../shared/BaseModal.vue'
import { ArrowPathIcon } from '@heroicons/vue/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/vue/24/solid'
import type { UploadProgressEventType } from '../../../api/documents'

interface Props {
  isOpen: boolean
  currentStep: UploadProgressEventType | null
  error: string | null
  filename: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

interface ProgressStep {
  id: UploadProgressEventType
  label: string
  description: string
}

const steps: ProgressStep[] = [
  {
    id: 'document-received',
    label: 'upload.progress.received',
    description: 'upload.progress.receivedDesc'
  },
  {
    id: 'storage-completed',
    label: 'upload.progress.stored',
    description: 'upload.progress.storedDesc'
  },
  {
    id: 'analysis-completed',
    label: 'upload.progress.analyzed',
    description: 'upload.progress.analyzedDesc'
  },
  {
    id: 'upload-completed',
    label: 'upload.progress.completed',
    description: 'upload.progress.completedDesc'
  }
]

const currentStepIndex = computed(() => {
  if (!props.currentStep) return -1
  
  // Map current step to progress index
  switch (props.currentStep) {
    case 'document-received':
      return 0
    case 'storage-started':
      return 0
    case 'storage-completed':
      return 1
    case 'analysis-started':
      return 1
    case 'analysis-completed':
      return 2
    case 'upload-completed':
      return 3
    default:
      return -1
  }
})

const progress = computed(() => {
  if (props.error) return 0
  if (currentStepIndex.value < 0) return 0
  return ((currentStepIndex.value + 1) / steps.length) * 100
})

const getStepStatus = (index: number) => {
  if (props.error) return 'error'
  if (index < currentStepIndex.value) return 'completed'
  if (index === currentStepIndex.value) return 'active'
  return 'pending'
}

const isCompleted = computed(() => props.currentStep === 'upload-completed')
</script>

<template>
  <BaseModal
    :is-open="props.isOpen"
    :title="isCompleted ? $t('upload.progress.successTitle') : $t('upload.progress.title')"
    :subtitle="filename"
    max-width="md"
    :show-close="isCompleted"
    @close="emit('close')"
  >
    <div class="upload-progress-content">
      <!-- Error Message -->
      <div v-if="error" class="error-message">
        <p>{{ $t(error) }}</p>
      </div>

      <!-- Progress Bar -->
      <div v-else class="progress-container">
        <div class="progress-bar-wrapper">
          <div class="progress-bar-track">
            <div 
              class="progress-bar-fill"
              :style="{ width: `${progress}%` }"
            />
          </div>
          <div class="progress-percentage">
            {{ Math.round(progress) }}%
          </div>
        </div>

        <!-- Steps -->
        <div class="steps-container">
          <div
            v-for="(step, index) in steps"
            :key="step.id"
            class="step"
            :class="getStepStatus(index)"
          >
            <div class="step-icon">
              <CheckCircleIconSolid
                v-if="getStepStatus(index) === 'completed'"
                class="icon completed"
              />
              <ArrowPathIcon
                v-else-if="getStepStatus(index) === 'active'"
                class="icon active spinning"
              />
              <div v-else class="icon pending-dot" />
            </div>
            <div class="step-content">
              <p class="step-label">{{ $t(step.label) }}</p>
              <p class="step-description">{{ $t(step.description) }}</p>
            </div>
          </div>
        </div>
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
  gap: 2rem;
  min-height: 300px;
}

.error-message {
  padding: 1.25rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 1rem;
  text-align: center;
}

.error-message p {
  margin: 0;
  color: #dc2626;
  font-weight: 500;
}

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.progress-bar-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.progress-bar-track {
  height: 0.75rem;
  background: var(--white-40);
  border-radius: 9999px;
  overflow: hidden;
  border: 1px solid var(--white-50);
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--sky-0ea5e9) 0%, var(--purple-a855f7) 100%);
  border-radius: 9999px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 20px var(--sky-0ea5e9-30);
}

.progress-percentage {
  text-align: center;
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--sky-0ea5e9) 0%, var(--purple-a855f7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.step.active {
  background: var(--sky-0ea5e9-10);
  border: 1px solid var(--sky-0ea5e9-30);
}

.step.completed {
  background: var(--white-40);
  border: 1px solid var(--white-50);
  opacity: 0.7;
}

.step.pending {
  background: transparent;
  border: 1px solid transparent;
  opacity: 0.5;
}

.step-icon {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 2rem;
  height: 2rem;
}

.icon.completed {
  color: var(--sky-0ea5e9);
}

.icon.active {
  color: var(--purple-a855f7);
}

.icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.pending-dot {
  width: 0.75rem;
  height: 0.75rem;
  background: var(--gray-d4d4d4);
  border-radius: 50%;
}

.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.step-label {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-171717);
}

.step-description {
  margin: 0;
  font-size: 0.875rem;
  color: var(--gray-737373);
  line-height: 1.4;
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
    min-height: 250px;
  }

  .step {
    padding: 0.75rem;
  }

  .step-icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  .icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  .step-label {
    font-size: 0.9375rem;
  }

  .step-description {
    font-size: 0.8125rem;
  }
}
</style>
