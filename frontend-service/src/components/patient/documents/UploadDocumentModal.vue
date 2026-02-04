<script setup lang="ts">
import { computed } from 'vue'
import BaseModal from '../../shared/BaseModal.vue'
import { DocumentIcon } from '@heroicons/vue/24/outline'

interface Props {
  isOpen: boolean
  file: File | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const fileSize = computed(() => {
  if (!props.file) return '0 KB'

  const bytes = props.file.size
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
})

const fileName = computed(() => props.file?.name || '')
</script>

<template>
  <BaseModal
    :is-open="props.isOpen"
    :title="$t('upload.confirmTitle')"
    :subtitle="$t('upload.confirmSubtitle')"
    max-width="sm"
    @close="emit('close')"
  >
    <div class="upload-content">
      <!-- File Preview -->
      <div class="file-preview">
        <div class="file-icon-wrapper">
          <DocumentIcon class="file-icon" />
        </div>
        <div class="file-info">
          <p class="file-name">{{ fileName }}</p>
          <p class="file-size">{{ fileSize }}</p>
        </div>
      </div>

      <!-- Info Message -->
      <div class="info-message">
        <p>{{ $t('upload.confirmMessage') }}</p>
      </div>
    </div>

    <!-- Footer Buttons -->
    <template #footer>
      <button
        class="modal-button cancel-button"
        @click="emit('close')"
      >
        {{ $t('upload.cancel') }}
      </button>
      <button
        class="modal-button confirm-button"
        @click="emit('confirm')"
      >
        {{ $t('upload.confirmUpload') }}
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>
.upload-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--white-40);
  border: 1px solid var(--white-50);
  border-radius: 1rem;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.file-icon-wrapper {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--sky-0ea5e9) 0%, var(--purple-a855f7) 100%);
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px var(--black-8);
}

.file-icon {
  width: 1.75rem;
  height: 1.75rem;
  color: white;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-171717);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 0.875rem;
  color: var(--gray-737373);
  margin: 0.25rem 0 0 0;
}

.info-message {
  padding: 1rem;
  background: var(--sky-0ea5e9-10);
  border: 1px solid var(--sky-0ea5e9-30);
  border-radius: 0.75rem;
}

.info-message p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--gray-525252);
  line-height: 1.5;
}

.modal-button {
  flex: 1;
  padding: 0.875rem 1.5rem;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  border: none;
}

.cancel-button {
  background: var(--white-40);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: var(--gray-525252);
  border: 1px solid var(--white-50);
  box-shadow: 0 2px 8px var(--black-6), inset 0 1px 0 var(--white-50);
}

.cancel-button:hover {
  background: var(--white-50);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--black-8), inset 0 1px 0 var(--white-60);
}

.confirm-button {
  background: linear-gradient(135deg, var(--sky-0ea5e9) 0%, var(--purple-a855f7) 100%);
  color: white;
  box-shadow: 0 4px 16px var(--sky-0ea5e9-30);
}

.confirm-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--sky-0ea5e9-30);
}

@media (max-width: 768px) {
  .file-preview {
    padding: 1rem;
  }

  .file-icon-wrapper {
    width: 2.5rem;
    height: 2.5rem;
  }

  .file-icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  .modal-button {
    padding: 0.75rem 1.25rem;
    font-size: 0.9375rem;
  }
}
</style>
