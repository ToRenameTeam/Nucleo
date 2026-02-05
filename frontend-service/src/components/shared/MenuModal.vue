<script setup lang="ts">
import { type Component } from 'vue'
import BaseModal from './BaseModal.vue'

export interface MenuOption {
  id: string
  title: string
  subtitle: string
  icon: Component
  action: () => void
}

defineProps<{
  isOpen: boolean
  title: string
  subtitle: string
  options: MenuOption[]
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <BaseModal
    :is-open="isOpen"
    :title="title"
    :subtitle="subtitle"
    :show-footer="false"
    :max-width="maxWidth || 'sm'"
    @close="emit('close')"
  >
    <div class="menu-options">
      <button
        v-for="option in options"
        :key="option.id"
        class="menu-option"
        @click="option.action"
      >
        <div class="option-icon">
          <component :is="option.icon" class="icon" />
        </div>
        <div class="option-content">
          <h3 class="option-title">{{ option.title }}</h3>
          <p class="option-subtitle">{{ option.subtitle }}</p>
        </div>
      </button>
    </div>
  </BaseModal>
</template>

<style scoped>
.menu-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.menu-option {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;
  background: var(--white-40);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  text-align: left;
  width: 100%;
  box-shadow: 0 2px 8px var(--shadow), inset 0 1px 0 var(--white-60);
  border: 1px solid transparent;
}

.menu-option:hover {
  background: var(--bg-secondary-35);
  transform: translateY(-2px);
  box-shadow: 0 12px 40px var(--text-primary-15), 0 1px 2px var(--white-90);
  border-color: var(--white-50);
}

.menu-option:active {
  transform: translateY(0);
}

.option-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px var(--accent-primary-30), inset 0 1px 0 var(--white-20);
}

.icon {
  width: 1.75rem;
  height: 1.75rem;
  color: var(--white);
  stroke-width: 2;
}

.option-content {
  flex: 1;
}

.option-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  margin-bottom: 0.25rem;
}

.option-subtitle {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--text-secondary);
  margin: 0;
}

@media (max-width: 480px) {
  .menu-option {
    padding: 1rem;
    gap: 1rem;
  }

  .option-icon {
    width: 2.5rem;
    height: 2.5rem;
  }

  .icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  .option-title {
    font-size: 1rem;
  }

  .option-subtitle {
    font-size: 0.8125rem;
  }
}
</style>