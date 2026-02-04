<script setup lang="ts">
import { CheckCircleIcon, XMarkIcon, XCircleIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'
import type { Toast } from '../../types/shared'

const props = withDefaults(defineProps<Toast>(), {
  duration: 3000,
  type: 'success'
})

const { t } = useI18n()

const emit = defineEmits<{
  close: []
}>()

// Auto close after duration
if (props.show && props.duration > 0) {
  setTimeout(() => {
    emit('close')
  }, props.duration)
}

// Determine aria-live based on type
const ariaLive = props.type === 'error' ? 'assertive' : 'polite'
</script>

<template>
  <Teleport to="body">
    <Transition name="toast">
      <div 
        v-if="show" 
        class="toast-container"
        role="status"
        :aria-live="ariaLive"
        aria-atomic="true"
      >
        <div class="toast-content">
          <div class="toast-icon" :class="`toast-icon-${type}`">
            <CheckCircleIcon v-if="type === 'success'" class="toast-check-icon" aria-hidden="true" />
            <XCircleIcon v-else-if="type === 'error'" class="toast-check-icon" aria-hidden="true" />
            <CheckCircleIcon v-else class="toast-check-icon" aria-hidden="true" />
          </div>
          <p class="toast-message">{{ message }}</p>
          <button 
            class="toast-close" 
            @click="emit('close')"
            :aria-label="t('toast.closeNotification')"
          >
            <XMarkIcon class="toast-close-icon" aria-hidden="true" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 10000;
  animation: slideInRight 0.4s cubic-bezier(0, 0, 0.2, 1);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: var(--white-95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--white-80);
  border-radius: 1rem;
  box-shadow: 0 8px 32px var(--black-12), inset 0 1px 0 var(--white-100);
  min-width: 320px;
  max-width: 480px;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  flex-shrink: 0;
  border: 1px solid;
  box-shadow: 0 2px 8px;
}

.toast-check-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.toast-close-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.toast-icon-success {
  background: var(--success-12);
  color: var(--success);
  border-color: var(--success-30);
  box-shadow: 0 2px 8px var(--success-15);
}

.toast-icon-error {
  background: var(--error-12);
  color: var(--error);
  border-color: var(--error-30);
  box-shadow: 0 2px 8px var(--error-15);
}

.toast-icon-warning {
  background: var(--warning-12);
  color: var(--warning);
  border-color: var(--warning-30);
  box-shadow: 0 2px 8px var(--warning-15);
}

.toast-icon-info {
  background: var(--sky-0ea5e9-12);
  color: var(--sky-0ea5e9);
  border-color: var(--sky-0ea5e9-30);
  box-shadow: 0 2px 8px var(--sky-0ea5e9-15);
}

.toast-message {
  flex: 1;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--gray-171717);
  margin: 0;
  line-height: 1.5;
}

.toast-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: var(--black-5);
  border: 1px solid var(--black-10);
  border-radius: 0.5rem;
  color: var(--gray-525252);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  flex-shrink: 0;
}

.toast-close:hover {
  background: var(--black-10);
  transform: scale(1.05);
}

.toast-close:active {
  transform: scale(0.95);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Transition animations */
.toast-enter-active {
  animation: slideInRight 0.4s cubic-bezier(0, 0, 0.2, 1);
}

.toast-leave-active {
  animation: slideOutRight 0.3s cubic-bezier(0, 0, 0.2, 1);
}

@keyframes slideOutRight {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

@media (max-width: 640px) {
  .toast-container {
    top: 1rem;
    right: 1rem;
    left: 1rem;
  }

  .toast-content {
    min-width: 0;
    width: 100%;
  }
}
</style>
