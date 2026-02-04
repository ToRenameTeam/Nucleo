<script setup lang="ts">
import { ref, computed } from 'vue'
import { DocumentPlusIcon, CloudArrowUpIcon } from '@heroicons/vue/24/outline'
import BaseModal from '../shared/BaseModal.vue'
import type { CreateReportRequest } from '../../api/documents'

interface Props {
  isOpen: boolean
  patientId: string
  appointmentId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  'document-created': [documentId: string]
}>()

// Form state
const documentType = ref<'report' | 'upload'>('report')
const isLoading = ref(false)
const errorMessage = ref('')

// Report form fields
const reportForm = ref({
  doctorId: 'doc-001', // TODO: Get from auth context
  summary: '',
  tags: [] as string[],
  servicePrescriptionId: '',
  executionDate: new Date().toISOString().split('T')[0],
  findings: '',
  clinicalQuestion: '',
  conclusion: '',
  recommendations: ''
})

// Upload form fields
const uploadFile = ref<File | null>(null)

// Tag input
const tagInput = ref('')

const isFormValid = computed(() => {
  if (documentType.value === 'report') {
    return reportForm.value.summary.trim() !== '' &&
           reportForm.value.findings.trim() !== '' &&
           reportForm.value.executionDate !== ''
  } else {
    return uploadFile.value !== null
  }
})

function handleClose() {
  if (!isLoading.value) {
    resetForm()
    emit('close')
  }
}

function resetForm() {
  documentType.value = 'report'
  errorMessage.value = ''
  reportForm.value = {
    doctorId: 'doc-001',
    summary: '',
    tags: [],
    servicePrescriptionId: '',
    executionDate: new Date().toISOString().split('T')[0],
    findings: '',
    clinicalQuestion: '',
    conclusion: '',
    recommendations: ''
  }
  uploadFile.value = null
  tagInput.value = ''
}

function addTag() {
  const tag = tagInput.value.trim()
  if (tag && !reportForm.value.tags.includes(tag)) {
    reportForm.value.tags.push(tag)
    tagInput.value = ''
  }
}

function removeTag(index: number) {
  reportForm.value.tags.splice(index, 1)
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    uploadFile.value = target.files[0] ?? null
  }
}

async function handleSubmit() {
  if (!isFormValid.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const { documentsApiService } = await import('../../api/documents')

    if (documentType.value === 'report') {
      // Create report document
      const request: CreateReportRequest = {
        type: 'report',
        doctorId: reportForm.value.doctorId,
        metadata: {
          summary: reportForm.value.summary,
          tags: reportForm.value.tags
        },
        servicePrescriptionId: reportForm.value.servicePrescriptionId || 'default-prescription-id',
        executionDate: reportForm.value.executionDate || (new Date().toISOString().split('T')[0] ?? ''),
        findings: reportForm.value.findings,
        ...(reportForm.value.clinicalQuestion && { clinicalQuestion: reportForm.value.clinicalQuestion }),
        ...(reportForm.value.conclusion && { conclusion: reportForm.value.conclusion }),
        ...(reportForm.value.recommendations && { recommendations: reportForm.value.recommendations })
      }

      const response = await documentsApiService.createDocument(props.patientId, request)
      emit('document-created', response.id)
    } else {
      // Upload document file
      if (!uploadFile.value) {
        throw new Error('No file selected')
      }
      
      const uploadResponse = await documentsApiService.uploadDocument(props.patientId, uploadFile.value)
      if (uploadResponse.success && uploadResponse.documentId) {
        emit('document-created', uploadResponse.documentId)
      } else {
        throw new Error(uploadResponse.message || 'Upload failed')
      }
    }

    resetForm()
  } catch (error: any) {
    console.error('Error creating document:', error)
    errorMessage.value = error.response?.data?.message || error.message || 'Failed to create document'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <BaseModal
    :is-open="isOpen"
    :title="$t('doctor.appointments.actions.addDocument')"
    subtitle="Crea o carica un documento medico per questa visita"
    max-width="lg"
    @close="handleClose"
  >
    <!-- Modal Body -->
    <div class="modal-content">
      <!-- Document Type Selection -->
      <div class="form-group">
        <label class="form-label">Tipo di Documento</label>
        <div class="type-selector">
          <button
            type="button"
            class="type-btn"
            :class="{ active: documentType === 'report' }"
            @click="documentType = 'report'"
            :disabled="isLoading"
          >
            <DocumentPlusIcon class="icon" />
            <span>Crea Report</span>
          </button>
          <button
            type="button"
            class="type-btn"
            :class="{ active: documentType === 'upload' }"
            @click="documentType = 'upload'"
            :disabled="isLoading"
          >
            <CloudArrowUpIcon class="icon" />
            <span>Carica File</span>
          </button>
        </div>
      </div>

      <!-- Report Form -->
      <form v-if="documentType === 'report'" class="document-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="summary" class="form-label">Riepilogo *</label>
          <input
            id="summary"
            v-model="reportForm.summary"
            type="text"
            class="form-input"
            placeholder="Breve descrizione del documento"
            required
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label class="form-label">Tag</label>
          <div class="tags-container">
            <div v-if="reportForm.tags.length > 0" class="tags-list">
              <span
                v-for="(tag, index) in reportForm.tags"
                :key="index"
                class="tag"
              >
                {{ tag }}
                <button
                  type="button"
                  @click="removeTag(index)"
                  class="tag-remove"
                  :disabled="isLoading"
                >
                  ×
                </button>
              </span>
            </div>
            <input
              v-model="tagInput"
              type="text"
              class="form-input"
              placeholder="Aggiungi tag e premi Invio"
              @keydown.enter.prevent="addTag"
              :disabled="isLoading"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="execution-date" class="form-label">Data Esecuzione *</label>
          <input
            id="execution-date"
            v-model="reportForm.executionDate"
            type="date"
            class="form-input"
            required
            :disabled="isLoading"
          />
        </div>

        <div class="form-group">
          <label for="findings" class="form-label">Referto *</label>
          <textarea
            id="findings"
            v-model="reportForm.findings"
            class="form-textarea"
            rows="4"
            placeholder="Descrivi i risultati..."
            required
            :disabled="isLoading"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="clinical-question" class="form-label">Quesito Clinico</label>
          <textarea
            id="clinical-question"
            v-model="reportForm.clinicalQuestion"
            class="form-textarea"
            rows="2"
            placeholder="Opzionale..."
            :disabled="isLoading"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="conclusion" class="form-label">Conclusioni</label>
          <textarea
            id="conclusion"
            v-model="reportForm.conclusion"
            class="form-textarea"
            rows="3"
            placeholder="Opzionale..."
            :disabled="isLoading"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="recommendations" class="form-label">Raccomandazioni</label>
          <textarea
            id="recommendations"
            v-model="reportForm.recommendations"
            class="form-textarea"
            rows="3"
            placeholder="Opzionale..."
            :disabled="isLoading"
          ></textarea>
        </div>
      </form>

      <!-- Upload Form -->
      <form v-else class="document-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="file-upload" class="form-label">File PDF *</label>
          <div class="file-upload-container">
            <input
              id="file-upload"
              type="file"
              accept=".pdf,application/pdf"
              @change="handleFileChange"
              class="file-input"
              :disabled="isLoading"
            />
            <div v-if="uploadFile" class="file-name">
              📄 {{ uploadFile.name }}
            </div>
          </div>
        </div>
      </form>

      <!-- Error Message -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="modal-actions">
        <button
          type="button"
          class="btn btn-secondary"
          @click="handleClose"
          :disabled="isLoading"
        >
          Annulla
        </button>
        <button
          type="button"
          class="btn btn-primary"
          @click="handleSubmit"
          :disabled="!isFormValid || isLoading"
        >
          <span v-if="isLoading">Creazione...</span>
          <span v-else>Crea Documento</span>
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.modal-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.document-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-171717);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: inherit;
  font-size: 1rem;
  color: var(--gray-171717);
  background: var(--white-70);
  backdrop-filter: blur(12px);
  border: 1px solid var(--white-50);
  border-radius: 0.75rem;
  box-shadow: 0 2px 8px var(--black-6), inset 0 1px 0 var(--white-80);
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--sky-0ea5e9);
  box-shadow: 0 0 0 3px var(--sky-0ea5e9-20), 0 2px 8px var(--black-8);
  background: var(--white-80);
}

.form-input:disabled,
.form-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.type-selector {
  display: flex;
  gap: 0.75rem;
}

.type-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  background: var(--white-50);
  backdrop-filter: blur(12px);
  border: 1.5px solid var(--white-70);
  border-radius: 0.75rem;
  font-weight: 600;
  color: var(--gray-525252);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  box-shadow: 0 2px 8px var(--black-6), inset 0 1px 0 var(--white-80);
}

.type-btn:hover:not(:disabled) {
  background: var(--white-60);
  border-color: var(--sky-0ea5e9);
  color: var(--sky-0ea5e9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--black-8), inset 0 1px 0 var(--white-90);
}

.type-btn.active {
  background: var(--sky-0ea5e9-15);
  border-color: var(--sky-0ea5e9);
  color: var(--sky-0ea5e9);
  box-shadow: 0 4px 16px var(--sky-0ea5e9-20), inset 0 1px 0 var(--white-80);
}

.type-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

.tags-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: var(--sky-0ea5e9-15);
  border: 1px solid var(--sky-0ea5e9-30);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--sky-0ea5e9);
  box-shadow: 0 2px 4px var(--black-5), inset 0 1px 0 var(--white-40);
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  background: var(--black-10);
  border: none;
  border-radius: 0.25rem;
  font-size: 1.125rem;
  line-height: 1;
  color: var(--sky-0ea5e9);
  cursor: pointer;
  transition: all 0.2s;
}

.tag-remove:hover:not(:disabled) {
  background: var(--black-20);
}

.file-upload-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.file-input {
  padding: 0.75rem;
  background: var(--white-70);
  backdrop-filter: blur(12px);
  border: 1.5px dashed var(--white-50);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px var(--black-6), inset 0 1px 0 var(--white-80);
}

.file-input:hover:not(:disabled) {
  border-color: var(--sky-0ea5e9);
  background: var(--white-80);
}

.file-name {
  padding: 0.75rem 1rem;
  background: var(--sky-0ea5e9-10);
  border: 1px solid var(--sky-0ea5e9-30);
  border-radius: 0.75rem;
  font-size: 0.875rem;
  color: var(--sky-0ea5e9);
  box-shadow: 0 2px 4px var(--black-5), inset 0 1px 0 var(--white-40);
}

.error-message {
  padding: 0.875rem 1rem;
  background: var(--red-dc2626-10);
  border: 1px solid var(--red-dc2626-30);
  border-radius: 0.75rem;
  color: var(--red-dc2626);
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 2px 4px var(--black-5);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  width: 100%;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.75rem;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  min-width: 100px;
  box-shadow: 0 2px 8px var(--black-6), inset 0 1px 0 var(--white-50);
}

.btn-secondary {
  background: var(--white-50);
  backdrop-filter: blur(12px);
  border-color: var(--white-70);
  color: var(--gray-525252);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--white-60);
  border-color: var(--white-80);
  color: var(--gray-171717);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--black-8), inset 0 1px 0 var(--white-70);
}

.btn-primary {
  background: var(--sky-0ea5e9-80);
  backdrop-filter: blur(12px);
  border-color: var(--white-30);
  color: #ffffff;
  box-shadow: 0 4px 16px var(--sky-0ea5e9-30), inset 0 1px 0 var(--white-25);
}

.btn-primary:hover:not(:disabled) {
  background: var(--sky-0284c7-85);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px var(--sky-0ea5e9-40), inset 0 1px 0 var(--white-30);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* Responsive */
@media (max-width: 768px) {
  .type-selector {
    flex-direction: column;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>
