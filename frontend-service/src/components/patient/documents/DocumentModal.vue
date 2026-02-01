<script setup lang="ts">
import { ref } from 'vue'
import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import type { DocumentModal } from '../../../types/document'
import BaseModal from '../../shared/BaseModal.vue'
import DocumentViewer from './DocumentViewer.vue'

const props = defineProps<DocumentModal>()

const emit = defineEmits<{
  close: []
}>()

const currentPageIndex = ref(0)

const handlePrevPage = () => {
  if (currentPageIndex.value > 0) {
    currentPageIndex.value--
  }
}

const handleNextPage = () => {
  currentPageIndex.value++
}

const handleDownload = () => {
  console.log('Download documento:', props.document?.id)
  // Implementare logica di download
}
</script>

<template>
  <BaseModal v-if="document" :is-open="isOpen" :title="document.title" max-width="md" @close="emit('close')">
    <template #header>
      <div class="document-header">
        <h2 class="document-title">{{ document.title }}</h2>
      </div>
    </template>

    <!-- DocumentViewer with default style -->
    <DocumentViewer :document="document" :current-page-index="currentPageIndex" :show-panel="false"
      preview-height="35vh" @prev-page="handlePrevPage" @next-page="handleNextPage" />

    <template #footer>
      <button class="action-button download-button" @click="handleDownload" :aria-label="$t('documentModal.download')">
        <ArrowDownTrayIcon class="icon-action" />
        <span class="button-label">{{ $t('documentModal.download') }}</span>
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>
.document-header {
  width: 100%;
}

.document-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-radius: 1rem;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  border: 1px solid transparent;
}

.download-button {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  backdrop-filter: blur(16px);
  border-color: var(--white-30);
  color: var(--white);
  box-shadow: 0 4px 16px var(--accent-primary-30), inset 0 1px 0 var(--white-20);
  margin-left: auto;
}

.download-button:hover {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--accent-primary-40), inset 0 1px 0 var(--white-30);
}

.icon-action {
  width: 1.25rem;
  height: 1.25rem;
}

.button-label {
  display: inline;
}

@media (max-width: 768px) {
  .action-button {
    width: 100%;
  }
}
</style>