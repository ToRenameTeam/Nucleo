<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import FormModal from '../../shared/FormModal.vue'
import type { UserInfo } from '../../../api/users'

const { t } = useI18n()

const props = defineProps<{
  isOpen: boolean
  saveError?: string
  isSaving?: boolean
  isLoadingUsers?: boolean
  users?: UserInfo[]
}>()

const emit = defineEmits<{
  close: []
  back: []
  save: [prescription: ServicePrescriptionData]
}>()

interface ServicePrescriptionData {
  userId: string
  patientName: string
  serviceType: string
  description: string
  urgency: 'low' | 'medium' | 'high'
  notes: string
}

const formData = ref<ServicePrescriptionData>({
  userId: '',
  patientName: '',
  serviceType: '',
  description: '',
  urgency: 'medium',
  notes: ''
})

const searchQuery = ref('')
const showSuggestions = ref(false)
const selectedUserIndex = ref(-1)
const selectedUser = ref<UserInfo | null>(null)

const filteredUsers = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 3) {
    return []
  }

  const query = searchQuery.value.toLowerCase()
  return (props.users || []).filter(user => {
    const fullName = `${user.name} ${user.lastName}`.toLowerCase()
    const fiscalCode = user.fiscalCode.toLowerCase()
    return fullName.includes(query) || fiscalCode.includes(query)
  })
})

const handlePatientInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchQuery.value = target.value
  selectedUser.value = null
  formData.value.userId = ''
  showSuggestions.value = searchQuery.value.length >= 3
  selectedUserIndex.value = -1
}

const selectUser = (user: UserInfo) => {
  selectedUser.value = user
  formData.value.userId = user.userId
  searchQuery.value = `${user.name} ${user.lastName}`
  formData.value.patientName = user.fiscalCode
  showSuggestions.value = false
  selectedUserIndex.value = -1
}

const handleSave = async () => {
  if (!formData.value.userId) return

  emit('save', formData.value)
}

const resetForm = () => {
  formData.value = {
    userId: '',
    patientName: '',
    serviceType: '',
    description: '',
    urgency: 'medium',
    notes: ''
  }
  searchQuery.value = ''
  showSuggestions.value = false
  selectedUser.value = null
  selectedUserIndex.value = -1
}

// Reset on modal close
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    resetForm()
  }
})

const handleCancel = () => {
  emit('close')
}
</script>

<template>
  <FormModal :is-open="isOpen" :title="t('doctor.documents.prescriptions.service.title')"
    :subtitle="t('doctor.documents.prescriptions.service.subtitle')" :show-back="true" :save-label="t('common.save')"
    :cancel-label="t('common.cancel')" :is-saving="isSaving" :save-error="saveError" max-width="md"
    @close="emit('close')" @back="emit('back')" @save="handleSave" @cancel="handleCancel">
    <form class="prescription-form" @submit.prevent="handleSave">
      <!-- Search Patient -->
      <div class="form-group">
        <label for="patient-search" class="form-label">
          {{ t('doctor.documents.prescriptions.service.patientName') }}
          <span class="required">*</span>
        </label>
        <div class="autocomplete-wrapper">
          <input id="patient-search" :value="searchQuery" type="text" class="form-input"
            :class="{ 'has-selection': selectedUser }"
            :placeholder="isLoadingUsers ? 'Caricamento pazienti...' : t('doctor.documents.prescriptions.medicine.patientNamePlaceholder')"
            :disabled="isLoadingUsers" required @input="handlePatientInput"
            @focus="() => searchQuery.length >= 3 && (showSuggestions = true)" />
          <div v-if="showSuggestions && filteredUsers.length > 0" class="suggestions-dropdown">
            <div v-for="(user, index) in filteredUsers" :key="user.userId" class="suggestion-item"
              :class="{ 'selected': index === selectedUserIndex }" @click="selectUser(user)"
              @mouseenter="selectedUserIndex = index">
              <div class="suggestion-name">{{ user.name }} {{ user.lastName }}</div>
              <div class="suggestion-fiscal-code">{{ user.fiscalCode }}</div>
            </div>
          </div>
          <div v-else-if="showSuggestions && searchQuery.length >= 3" class="suggestions-dropdown">
            <div class="suggestion-item no-results">
              {{ t('doctor.documents.prescriptions.noPatientResults') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Service Type -->
      <div class="form-group">
        <label for="serviceType" class="form-label">
          {{ t('doctor.documents.prescriptions.service.serviceType') }}
          <span class="required">*</span>
        </label>
        <input id="serviceType" v-model="formData.serviceType" type="text" class="form-input"
          :placeholder="t('doctor.documents.prescriptions.service.serviceTypePlaceholder')" required />
      </div>

      <!-- Description -->
      <div class="form-group">
        <label for="description" class="form-label">
          {{ t('doctor.documents.prescriptions.service.description') }}
        </label>
        <textarea id="description" v-model="formData.description" class="form-textarea"
          :placeholder="t('doctor.documents.prescriptions.service.descriptionPlaceholder')" rows="3" required />
      </div>

      <!-- Urgency -->
      <div class="form-group">
        <label for="urgency" class="form-label">
          {{ t('doctor.documents.prescriptions.service.urgency') }}
        </label>
        <select id="urgency" v-model="formData.urgency" class="form-select" required>
          <option value="low">{{ t('doctor.documents.prescriptions.service.urgencyLow') }}</option>
          <option value="medium">{{ t('doctor.documents.prescriptions.service.urgencyMedium') }}</option>
          <option value="high">{{ t('doctor.documents.prescriptions.service.urgencyHigh') }}</option>
        </select>
      </div>

      <!-- Notes -->
      <div class="form-group">
        <label for="notes" class="form-label">
          {{ t('doctor.documents.prescriptions.service.notes') }}
        </label>
        <textarea id="notes" v-model="formData.notes" class="form-textarea"
          :placeholder="t('doctor.documents.prescriptions.service.notesPlaceholder')" rows="4" />
      </div>
    </form>
  </FormModal>
</template>

<style scoped>
.prescription-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--white-60);
  backdrop-filter: blur(8px);
  border: 1px solid var(--white-80);
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  color: var(--text-primary);
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  box-shadow: 0 2px 4px var(--shadow), inset 0 1px 0 var(--white-90);
}


.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-primary-20), 0 2px 8px var(--black-5);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-select {
  cursor: pointer;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-tertiary);
}

.required {
  color: var(--red-dc2626);
  margin-left: 0.25rem;
}

.autocomplete-wrapper {
  position: relative;
}

.form-input.has-selection {
  border-color: var(--accent-primary);
  background: var(--white-60);
}

.form-input-readonly {
  background: var(--white-90);
  color: var(--text-secondary);
  cursor: not-allowed;
  user-select: all;
}

.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 0;
  right: 0;
  background: var(--white);
  border: 1px solid var(--white-40);
  border-radius: 0.75rem;
  box-shadow: 0 8px 24px var(--black-10);
  max-height: 280px;
  overflow-y: auto;
  z-index: 1000;
}

.suggestion-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.15s ease;
  border-bottom: 1px solid var(--white-90);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover,
.suggestion-item.selected {
  background: var(--accent-primary-10);
}

.suggestion-item.no-results {
  color: var(--text-tertiary);
  cursor: default;
}

.suggestion-item.no-results:hover {
  background: transparent;
}

.suggestion-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9375rem;
}

.suggestion-fiscal-code {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin-top: 0.125rem;
  font-family: 'Courier New', monospace;
}

@media (max-width: 768px) {
  .prescription-form {
    gap: 1.25rem;
  }

  .form-input,
  .form-select,
  .form-textarea {
    font-size: 1rem;
  }
}
</style>
