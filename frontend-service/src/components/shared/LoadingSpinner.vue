<script setup lang="ts">
import type { LoadingSpinner } from '../../types/shared'

// Props definition
const props = withDefaults(defineProps<LoadingSpinner>(), {
  size: 'medium',
  inline: false
})

const sizeClasses = {
  small: 'spinner-small',
  medium: 'spinner-medium',
  large: 'spinner-large'
}

const textSizeClasses = {
  small: 'text-small',
  medium: 'text-medium',
  large: 'text-large'
}
</script>

<template>
  <div 
    class="loading-container" 
    :class="{ 'loading-inline': inline }"
  >
    <div class="spinner" :class="sizeClasses[size]"></div>
    <p 
      v-if="message" 
      class="loading-text"
      :class="textSizeClasses[size]"
    >
      {{ message }}
    </p>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1.5rem;
}

.loading-inline {
  flex-direction: row;
  padding: 2rem;
  gap: 1rem;
  background: var(--bg-secondary-30);
  border-radius: 12px;
}

.spinner {
  border: 3px solid var(--accent-primary-20);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-small {
  width: 1.5rem;
  height: 1.5rem;
  border-width: 2px;
}

.spinner-medium {
  width: 3rem;
  height: 3rem;
  border-width: 3px;
}

.spinner-large {
  width: 4rem;
  height: 4rem;
  border-width: 4px;
}

.loading-text {
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0;
}

.text-small {
  font-size: 0.875rem;
}

.text-medium {
  font-size: 1rem;
}

.text-large {
  font-size: 1.125rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
