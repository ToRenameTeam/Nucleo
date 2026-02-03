<script setup lang="ts">
import { type Component } from 'vue'

defineProps<{
  label: string
  icon: Component
  position?: 'fixed' | 'inline'
  variant?: 'primary' | 'secondary'
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    :class="[
      'action-button',
      position === 'fixed' ? 'action-button--fixed' : 'action-button--inline',
      `action-button--${variant || 'primary'}`
    ]"
    @click="emit('click')"
  >
    <component :is="icon" class="btn-icon" />
    {{ label }}
  </button>
</template>

<style scoped>
.action-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  white-space: nowrap;
  border: 1px solid var(--white-15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 16px var(--black-15);
  z-index: 1000;
}

.action-button--primary {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: var(--white);
  border-color: var(--white-20);
}

.action-button--secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.action-button:hover {
  transform: translateY(-2px);
}

.action-button--primary:hover {
  box-shadow: 0 6px 20px var(--accent-primary-40);
}

.action-button--secondary:hover {
  box-shadow: 0 6px 20px var(--shadow);
}

.action-button:active {
  transform: translateY(0);
}

.action-button--inline {
  display: inline-flex;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
}

.action-button--fixed {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  border-radius: 9999px;
  box-shadow: 0 4px 16px var(--accent-primary-30), 0 2px 8px var(--accent-primary-20), inset 0 1px 0 var(--white-20);
  animation: fadeIn 0.6s cubic-bezier(0, 0, 0.2, 1);
  animation-delay: 0.6s;
  animation-fill-mode: both;
}

.action-button--fixed:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px var(--accent-primary-40), 0 4px 12px var(--accent-primary-30), inset 0 1px 0 var(--white-30);
}

.action-button--fixed:active {
  transform: translateY(-2px);
}

.btn-icon {
  width: 1.5rem;
  height: 1.5rem;
  stroke-width: 2;
}

.action-button--inline .btn-icon {
  width: 1.25rem;
  height: 1.25rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .action-button--fixed {
    bottom: 1.5rem;
    right: 1.5rem;
    padding: 0.875rem 1.25rem;
    font-size: 0.9375rem;
  }

  .action-button--fixed .btn-icon {
    width: 1.375rem;
    height: 1.375rem;
  }

  .action-button--inline {
    padding: 0.625rem 1.25rem;
    font-size: 0.8125rem;
  }

  .action-button--inline .btn-icon {
    width: 1.125rem;
    height: 1.125rem;
  }
}

@media (max-width: 480px) {
  .action-button--fixed {
    bottom: 1rem;
    right: 1rem;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }

  .action-button--fixed .btn-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  .action-button--inline {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
  }

  .action-button--inline .btn-icon {
    width: 1rem;
    height: 1rem;
  }
}
</style>