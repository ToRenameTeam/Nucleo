<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'
import type { DocumentViewer } from '../../../types/document'

// Import report images (currently the same for all)
import referto1 from '../../../assets/documents/referto_ECG_1.jpg'
import referto2 from '../../../assets/documents/referto_ECG_2.jpg'
import referto3 from '../../../assets/documents/referto_ECG_3.jpg'

const props = withDefaults(defineProps<DocumentViewer>(), {
  showPanel: true,
  previewHeight: '22rem',
  showHospital: false
})

const emit = defineEmits<{
  prevPage: []
  nextPage: []
}>()

const { t } = useI18n()

// Array delle immagini del referto
const documentImages = [referto1, referto2, referto3]
const totalPages = documentImages.length

const currentImage = computed(() => {
  return documentImages[props.currentPageIndex]
})

const canGoPrev = computed(() => props.currentPageIndex > 0)
const canGoNext = computed(() => props.currentPageIndex < totalPages - 1)
</script>

<template>
  <div :class="showPanel ? 'document-panel' : 'document-viewer-standalone'">
    <!-- Document Viewer -->
    <div class="document-viewer">
      <!-- Preview with navigation -->
      <div class="document-preview-wrapper">
        <button
          type="button"
          class="nav-button"
          :disabled="!canGoPrev"
          @click="emit('prevPage')"
          :aria-label="t('documents.viewer.page', { current: currentPageIndex, total: totalPages })"
        >
          <ChevronLeftIcon class="icon-nav" />
        </button>

        <div class="preview-area" :style="{ height: previewHeight }">
          <img
            :src="currentImage"
            :alt="`${document?.title} - ${t('documents.viewer.page', { current: currentPageIndex + 1, total: totalPages })}`"
            class="document-image"
          />
        </div>

        <button
          type="button"
          class="nav-button"
          :disabled="!canGoNext"
          @click="emit('nextPage')"
          :aria-label="t('documents.viewer.page', { current: currentPageIndex + 2, total: totalPages })"
        >
          <ChevronRightIcon class="icon-nav" />
        </button>
      </div>

      <!-- Page indicator -->
      <div class="page-indicator">
        <span class="page-text">
          {{ t('documents.viewer.page', { current: currentPageIndex + 1, total: totalPages }) }}
        </span>
      </div>

      <!-- Slot for custom metadata (e.g., icons for modal) -->
      <slot name="metadata">
        <!-- Default: Simple document info (for viewer) -->
        <div class="document-info">
          <!-- Description -->
          <div v-if="document?.description" class="info-section">
            <span class="info-label">{{ t('documents.viewer.description') }}</span>
            <p class="description-text">{{ document.description }}</p>
          </div>

          <!-- Tags -->
          <div v-if="document?.tags?.length" class="info-section">
            <span class="info-label">{{ t('documents.viewer.tags') }}</span>
            <div class="info-tags">
              <span
                v-for="(tag, index) in document.tags"
                :key="index"
                class="info-tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Date -->
          <div class="info-row">
            <span class="info-label">{{ t('documents.viewer.date') }}</span>
            <span class="info-value">{{ document?.date }}</span>
          </div>

          <!-- Doctor -->
          <div class="info-row">
            <span class="info-label">{{ t('documents.viewer.doctor') }}</span>
            <span class="info-value">{{ document?.doctor }}</span>
          </div>

          <!-- Hospital -->
          <div class="info-row">
            <span class="info-label">{{ t('documents.viewer.hospital') }}</span>
            <span class="info-value">{{ document?.hospital }}</span>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.document-panel {
  display: flex;
  flex-direction: column;
  background: var(--white-20);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--white-40);
  border-radius: 1.25rem;
  padding: 1.25rem;
  box-shadow: 0 4px 16px var(--black-6), inset 0 1px 0 var(--white-50);
}

.document-viewer-standalone {
  display: flex;
  flex-direction: column;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  height: 100%;
  min-height: 25rem;
}

.placeholder-icon {
  font-size: 4rem;
  opacity: 0.3;
}

.placeholder-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
  opacity: 0.6;
}

.document-viewer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.document-preview-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.preview-area {
  background: linear-gradient(135deg, var(--bg-gradient-start-40) 0%, var(--bg-gradient-mid-40) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--white-60);
  border-radius: 1rem;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  box-shadow: 0 4px 16px var(--shadow), inset 0 1px 0 var(--white-60);
  overflow: hidden;
}

.document-image {
  height: 100%;
  width: 100%;
  object-fit: contain;
  border-radius: 0.5rem;
}

.nav-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--bg-gradient-start-50) 0%, var(--bg-gradient-mid-50) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--white-60);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  color: var(--accent-primary);
  flex-shrink: 0;
  box-shadow: 0 4px 16px var(--accent-primary-20), inset 0 1px 0 var(--white-70);
}

.icon-nav {
  width: 1.5rem;
  height: 1.5rem;
}

.nav-button:hover:not(:disabled) {
  background: var(--white-60);
  transform: scale(1.1);
  box-shadow: 0 6px 20px var(--shadow), inset 0 1px 0 var(--white-80);
}

.nav-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-indicator {
  text-align: center;
}

.page-text {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
  background: linear-gradient(135deg, var(--bg-gradient-start-40) 0%, var(--bg-gradient-mid-40) 100%);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 0.375rem 0.875rem;
  border-radius: 0.5rem;
  border: 1px solid var(--white-50);
  display: inline-block;
  box-shadow: 0 2px 8px var(--shadow);
}

.document-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.875rem;
  background: var(--white-30);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--white-40);
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px var(--black-5);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  font-size: 0.8125rem;
}

.info-label {
  font-weight: 600;
  color: var(--text-secondary);
}

.info-value {
  color: var(--text-primary);
  font-weight: 500;
}

.description-text {
  color: var(--text-primary);
  line-height: 1.5;
}

.info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.info-tag {
  padding: 0.25rem 0.625rem;
  background: var(--black-6);
  border: 1px solid var(--text-primary-10);
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
}
</style>
