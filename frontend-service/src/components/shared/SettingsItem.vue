<script setup lang="ts">
import { ChevronRightIcon } from '@heroicons/vue/24/outline'
import type { SettingItem } from '../../types/setting'

const props = withDefaults(defineProps<SettingItem>(), {
  showChevron: true,
  variant: 'default'
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  emit('click')
}
</script>

<template>
  <div 
    class="settings-item"
    :class="{ 'settings-item--danger': variant === 'danger' }"
    @click="handleClick"
  >
    <component 
      v-if="icon" 
      :is="icon" 
      class="settings-item__icon"
    />
    
    <div class="settings-item__content">
      <div class="settings-item__title">
        {{ title }}
      </div>
      <div v-if="subtitle" class="settings-item__subtitle">
        {{ subtitle }}
      </div>
    </div>
    
    <ChevronRightIcon 
      v-if="showChevron" 
      class="settings-item__chevron"
    />
  </div>
</template>

<style scoped>
.settings-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.125rem 1.25rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  position: relative;
}

.settings-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent-primary-5);
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0, 0, 0.2, 1);
  border-radius: inherit;
}

.settings-item:hover::before {
  opacity: 1;
}

.settings-item:hover {
  background: var(--white-15);
  transform: translateX(4px);
}

.settings-item__icon {
  width: 24px;
  height: 24px;
  color: var(--text-heading);
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  filter: drop-shadow(0 2px 4px var(--accent-primary-20));
}

.settings-item:hover .settings-item__icon {
  color: var(--accent-primary-85-black);
  transform: scale(1.1);
  filter: drop-shadow(0 4px 8px var(--accent-primary-30));
}

.settings-item--danger .settings-item__icon {
  color: var(--error);
  filter: drop-shadow(0 2px 4px var(--error-20));
}

.settings-item--danger::before {
  background: var(--error-10);
}

.settings-item--danger:hover {
  background: var(--error-15);
}

.settings-item--danger:hover .settings-item__icon {
  color: var(--error);
  transform: scale(1.1);
  filter: drop-shadow(0 4px 8px var(--error-30));
}

.settings-item__content {
  flex: 1;
  min-width: 0;
}

.settings-item__title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
  transition: color 0.3s cubic-bezier(0, 0, 0.2, 1);
}

.settings-item:hover .settings-item__title {
  color: var(--text-interactive-hover);
}

.settings-item--danger .settings-item__title {
  color: var(--error);
}

.settings-item--danger:hover .settings-item__title {
  color: var(--error);
}

.settings-item__subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  line-height: 1.3;
  transition: color 0.3s cubic-bezier(0, 0, 0.2, 1);
}

.settings-item:hover .settings-item__subtitle {
  color: var(--text-default);
}

.settings-item__chevron {
  width: 20px;
  height: 20px;
  color: var(--gray-a3a3a3);
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
}

.settings-item:hover .settings-item__chevron {
  color: var(--gray-525252);
  transform: translateX(4px);
}
</style>
