<script setup lang="ts">
import { ref } from 'vue'
import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import type { DocumentModal } from '../../../types/document'
import BaseModal from '../../shared/BaseModal.vue'
import DocumentViewer from './DocumentViewer.vue'
import { useAuth } from '../../../composables/useAuth'
import { documentsApiService } from '../../../api/documents'

const props = defineProps<DocumentModal>()

const emit = defineEmits<{
  close: []
}>()

const { currentUser } = useAuth()
const currentPageIndex = ref(0)
const isDownloading = ref(false)

const handlePrevPage = () => {
  if (currentPageIndex.value > 0) {
    currentPageIndex.value--
  }
}

const handleNextPage = () => {
  currentPageIndex.value++
}

const handleDownload = async () => {
  if (!props.document || isDownloading.value) {
    return
  }

  // Use patientId from document if available (for doctor view), otherwise use current user's ID (for patient view)
  const patientId = props.document.patientId || currentUser.value?.userId

  if (!patientId) {
    console.error('[DocumentModal] No patient ID available for download')
    return
  }

  isDownloading.value = true

  try {
    await documentsApiService.downloadDocument(patientId, props.document.id)
    console.log('[DocumentModal] Download successful for document:', props.document.id)
  } catch (error) {
    console.error('[DocumentModal] Error downloading document:', error)
    // TODO: Mostrare un messaggio di errore all'utente
  } finally {
    isDownloading.value = false
  }
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
      <button
        class="action-button download-button"
        @click="handleDownload"
        :disabled="isDownloading"
        :aria-label="$t('documentModal.download')"
      >
        <ArrowDownTrayIcon class="icon-action" :class="{ 'icon-loading': isDownloading }" />
        <span class="button-label">
          {{ isDownloading ? $t('documentModal.downloading') : $t('documentModal.download') }}
        </span>
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
  width: 100%;
}

.download-button {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  backdrop-filter: blur(16px);
  border-color: var(--white-30);
  color: var(--white);
  box-shadow: 0 4px 16px var(--accent-primary-30), inset 0 1px 0 var(--white-20);
}

.download-button:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--accent-primary-30), inset 0 1px 0 var(--white-30);
}

.download-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.icon-action {
  width: 1.25rem;
  height: 1.25rem;
}

.icon-loading {
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.button-label {
  display: inline;
}

@media (max-width: 768px) {
  .action-button {
    padding: 0.75rem 1rem;
  }
}
</style>