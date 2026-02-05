<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'
import type { BaseModal } from '../../types/shared'

const props = withDefaults(defineProps<BaseModal>(), {
  maxWidth: 'md',
  showFooter: true,
  closeOnBackdrop: true
})

const emit = defineEmits<{
  close: []
}>()

const maxWidthClasses = {
  sm: 'modal-sm',
  md: 'modal-md',
  lg: 'modal-lg',
  xl: 'modal-xl'
}

// Handle close if clicking outside the modal content
const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    emit('close')
  }
}

</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="props.isOpen" 
        class="modal-overlay" 
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? 'modal-title' : undefined"
        @click.self="handleBackdropClick"
      >
        <div 
          ref="modalRef"
          class="modal-container" 
          :class="maxWidthClasses[maxWidth]"
        >
          <!-- Header -->
          <div class="modal-header">
            <div v-if="$slots.header || title" class="header-content">
              <slot name="header">
                <div>
                  <h2 v-if="title" id="modal-title" class="modal-title">{{ title }}</h2>
                  <p v-if="subtitle" class="modal-subtitle">{{ subtitle }}</p>
                </div>
              </slot>
            </div>
            <button 
              class="close-button"
              @click="emit('close')"
              aria-label="$t('documents.close')"
            >
              <XMarkIcon class="close-icon" />
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <slot></slot>
          </div>

          <!-- Footer (optional) -->
          <div v-if="showFooter && $slots.footer" class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--bg-gradient-start-10) 0%, var(--bg-gradient-mid-10) 50%, var(--bg-gradient-end-10) 100%);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 600;
  padding: 1rem;
  animation: fadeIn 0.2s ease-out;
}

.modal-overlay::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, var(--sky-0ea5e9-20) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, var(--purple-a855f7-20) 0%, transparent 50%);
  pointer-events: none;
}

.modal-container {
  background: var(--white-40);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px var(--black-8), inset 0 1px 0 var(--white-80);
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s cubic-bezier(0, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

.modal-sm {
  max-width: 28rem;
}
.modal-md {
  max-width: 42rem;
}
.modal-lg {
  max-width: 64rem;
}
.modal-xl {
  max-width: 80rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--white-30);
  flex-shrink: 0;
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

.close-button {
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

.close-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--gray-525252);
  display: block;
}

.close-button:hover {
  background: var(--white-40);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--black-10), inset 0 1px 0 var(--white-70);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--white-30);
  flex-shrink: 0;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container {
  animation: slideUp 0.3s cubic-bezier(0, 0, 0.2, 1);
}

.modal-leave-active .modal-container {
  animation: slideDown 0.3s cubic-bezier(0, 0, 0.2, 1);
}

@keyframes slideDown {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    max-width: 100% !important;
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-header,
  .modal-footer {
    padding: 1.25rem 1.5rem;
  }
}
</style>
