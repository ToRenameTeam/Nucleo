<script setup lang="ts">
import { ref } from 'vue'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const searchQuery = ref('')

const emit = defineEmits<{
  search: [query: string]
}>()

const handleSearch = () => {
  emit('search', searchQuery.value)
}
</script>

<template>
  <div class="search-bar-wrapper">
    <div class="search-bar-container">
      <label for="search-input" class="visually-hidden">
        {{ $t('documents.searchPlaceholder') }}
      </label>
      <input
        id="search-input"
        v-model="searchQuery"
        type="search"
        :placeholder="$t('documents.searchPlaceholder')"
        class="search-input"
        @input="handleSearch"
      />
      <MagnifyingGlassIcon class="search-icon" aria-hidden="true" />
    </div>
  </div>
</template>

<style scoped>
/* Class to visually hide but keep accessible to screen readers */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.search-bar-wrapper {
  position: relative;
  width: 100%;
  padding: 0;
}

.search-bar-container {
  position: relative;
  width: 100%;
  background: var(--bg-secondary-35);
  backdrop-filter: blur(16px);
  border: 1px solid var(--bg-secondary-50);
  border-radius: 1rem;
  box-shadow: 0 4px 16px var(--text-primary-8), inset 0 1px 0 var(--bg-secondary-60);
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
}

.search-bar-container:hover {
  box-shadow: 0 8px 24px var(--text-primary-12);
  background: var(--bg-secondary-45);
}

.search-input {
  width: 100%;
  min-height: 44px;
  padding: 0.75rem 3.5rem 0.75rem 3rem;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 500;
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.search-input:focus {
  outline: none;
}

.search-bar-container:focus-within {
  border-color: var(--accent-primary-50);
  box-shadow: 0 0 0 3px var(--accent-primary-10);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-secondary);
}
</style>
