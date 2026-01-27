<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'
import type { DocumentSelector } from '../../../types/document'

const emit = defineEmits<{
  select: [docId: string]
}>()

const { t } = useI18n()
const showDropdown = ref(false)

const props = withDefaults(defineProps<DocumentSelector>(), {
  placeholder: ''
})

const selectedDocument = computed(() => {
  return props.availableDocuments.find(doc => doc.id === props.selectedDocId) || null
})

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const selectDocument = (docId: string) => {
  emit('select', docId)
  showDropdown.value = false
}

const closeDropdown = () => {
  showDropdown.value = false
}

// Close dropdown on outside click
defineExpose({ closeDropdown })
</script>

<template>
  <div class="selector-wrapper">
    <div class="selector-dropdown">
      <button
        type="button"
        :class="['selector-button', { 'has-selection': selectedDocId }]"
        @click="toggleDropdown"
      >
        <span class="selector-label">
          {{ selectedDocument ? selectedDocument.title : (placeholder || t('documents.selectDocument')) }}
        </span>
        <ChevronDownIcon class="selector-chevron-icon" />
      </button>

      <Transition name="dropdown">
        <div v-if="showDropdown" class="dropdown-menu">
          <div class="dropdown-header">
            {{ t('documents.comparison.availableDocuments') }}
          </div>
          <div class="dropdown-items">
            <button
              v-for="doc in availableDocuments"
              :key="doc.id"
              type="button"
              :class="['dropdown-item', { 'is-selected': doc.id === selectedDocId }]"
              @click="selectDocument(doc.id)"
            >
              <div class="dropdown-item-content">
                <span class="dropdown-item-title">{{ doc.title }}</span>
                <div class="dropdown-item-tags">
                  <span
                    v-for="(tag, index) in doc.tags"
                    :key="index"
                    class="dropdown-tag"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.selector-wrapper {
  position: relative;
}

.selector-dropdown {
  position: relative;
}

.selector-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: var(--white-30);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 2px solid var(--white-50);
  border-radius: 1rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  box-shadow: 0 2px 8px var(--shadow), inset 0 1px 0 var(--white-60);
}

.selector-button:hover {
  background: var(--white-40);
  border-color: var(--accent-primary-40);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--shadow), inset 0 1px 0 var(--white-70);
}
.selector-button.has-selection {
  background: linear-gradient(135deg, var(--accent-primary-15) 0%, var(--accent-secondary-15) 100%);
  border-color: var(--accent-primary-60);
  color: var(--text-primary);
}
.selector-label {
  flex: 1;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.selector-chevron-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-secondary);
}
.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: var(--bg-secondary-95);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--white-60);
  border-radius: 1rem;
  box-shadow: 0 8px 32px var(--black-12), inset 0 1px 0 var(--white-80);
  z-index: 10;
  overflow: hidden;
}
.dropdown-header {
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--black-5);
  background: var(--black-2);
}
.dropdown-items {
  max-height: 20rem;
  overflow-y: auto;
}
.dropdown-item {
  width: 100%;
  padding: 0.875rem 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  border-bottom: 1px solid var(--text-primary-4);
  text-align: left;
}
.dropdown-item:last-child {
  border-bottom: none;
}
.dropdown-item:hover {
  background: var(--accent-primary-8);
}
.dropdown-item.is-selected {
  background: linear-gradient(135deg, var(--accent-primary-15) 0%, var(--accent-secondary-15) 100%);
}
.dropdown-item-content {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}
.dropdown-item-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}
.dropdown-item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}
.dropdown-tag {
  padding: 0.125rem 0.5rem;
  background: var(--black-6);
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
}
/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
