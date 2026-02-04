<script setup lang="ts">
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import BaseModal from './BaseModal.vue'

defineProps<{
  isOpen: boolean
  title: string
  subtitle?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  showBack?: boolean
  saveLabel?: string
  cancelLabel?: string
  isSaving?: boolean
  saveError?: string
}>()

const emit = defineEmits<{
  close: []
  back: []
  save: []
  cancel: []
}>()
</script>

<template>
  <BaseModal :is-open="isOpen" :title="title" :subtitle="subtitle" :max-width="maxWidth || 'md'" :show-footer="true"
    @close="emit('close')">
    <template v-if="showBack" #header>
      <div class="form-modal-header">
        <button class="back-button" @click="emit('back')" :aria-label="$t('common.back')">
          <ArrowLeftIcon class="back-icon" />
        </button>
        <div class="header-content">
          <h2 class="modal-title">{{ title }}</h2>
          <p v-if="subtitle" class="modal-subtitle">{{ subtitle }}</p>
        </div>
      </div>
    </template>
    <!-- Form content -->
    <slot></slot>

    <!-- Error message -->
    <div v-if="saveError" class="error-message">
      <span class="error-icon">⚠️</span>
      <span class="error-text">{{ saveError }}</span>
    </div>

    <template #footer>
      <div class="form-modal-footer">
        <button class="action-button action-button--secondary" @click="emit('cancel')" :disabled="isSaving">
          {{ cancelLabel || $t('common.cancel') }}
        </button>
        <button class="action-button action-button--primary" @click="emit('save')" :disabled="isSaving">
          <div v-if="isSaving" class="spinner"></div>
          <span v-else>{{ saveLabel || $t('common.save') }}</span>
        </button>
      </div>

    </template>
  </BaseModal>
</template>

<style scoped>
.form-modal-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  width: 100%;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: var(--white-30);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: var(--gray-525252);
  border: 1px solid var(--white-50);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  box-shadow: 0 2px 8px var(--black-6), inset 0 1px 0 var(--white-50);
  flex-shrink: 0;
}

.back-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--gray-525252);
}

.back-button:hover {
  background: var(--white-40);
  transform: translateX(-2px);
  box-shadow: 0 4px 16px var(--black-10), inset 0 1px 0 var(--white-70);
}

.header-content {
  flex: 1;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-171717);
  margin: 0;
  line-height: 1.25;
}

.modal-subtitle {
  font-size: 0.875rem;
  color: var(--gray-737373);
  margin: 0.25rem 0 0 0;
  line-height: 1.5;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: var(--red-fee2e2);
  border: 1px solid var(--red-fca5a5);
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
}

.error-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.error-text {
  font-size: 0.875rem;
  color: var(--red-dc2626);
  font-weight: 500;
}

.form-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  width: 100%;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  border: 1px solid transparent;
  min-width: 6rem;
}

.action-button--primary {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: var(--white);
  border-color: var(--white-20);
  box-shadow: 0 4px 16px var(--accent-primary-30), inset 0 1px 0 var(--white-20);
}

.action-button--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--accent-primary-40), inset 0 1px 0 var(--white-30);
}

.action-button--secondary {
  background: var(--white-40);
  backdrop-filter: blur(12px);
  color: var(--text-primary);
  border-color: var(--white-60);
  box-shadow: 0 2px 8px var(--shadow), inset 0 1px 0 var(--white-60);
}

.action-button--secondary:hover:not(:disabled) {
  background: var(--white-50);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow), inset 0 1px 0 var(--white-70);
}

.action-button:active:not(:disabled) {
  transform: translateY(0);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--white-30);
  border-top-color: var(--white);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .form-modal-footer {
    flex-direction: column-reverse;
  }

  .action-button {
    width: 100%;
  }
}
</style>