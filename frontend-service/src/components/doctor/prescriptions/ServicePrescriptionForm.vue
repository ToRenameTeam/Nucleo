<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import FormModal from '../../shared/FormModal.vue'
import type { UserInfo } from '../../../api/users'
import { masterDataApi, type ServiceType, type Facility } from '../../../api/masterData'

const { t } = useI18n()

// Props
const props = defineProps<{
  isOpen: boolean
  saveError?: string
  isSaving?: boolean
  isLoadingUsers?: boolean
  users?: UserInfo[]
}>()

// Emits
const emit = defineEmits<{
  close: []
  back: []
  save: [prescription: ServicePrescriptionFormData]
}>()

// Types
export interface ServicePrescriptionFormData {
  patientId: string
  patientName: string
  patientFiscalCode: string
  serviceId: string
  serviceName: string
  facilityId: string
  facilityName: string
  validityType: 'until_date' | 'until_execution'
  validityDate: string
  priority: 'ROUTINE' | 'URGENT' | 'EMERGENCY'
}

// Form data
const formData = ref<ServicePrescriptionFormData>({
  patientId: '',
  patientName: '',
  patientFiscalCode: '',
  serviceId: '',
  serviceName: '',
  facilityId: '',
  facilityName: '',
  validityType: 'until_date',
  validityDate: getDefaultValidityDate(),
  priority: 'ROUTINE'
})

// Patient search state
const patientSearchQuery = ref('')
const showPatientSuggestions = ref(false)
const selectedPatient = ref<UserInfo | null>(null)

// Service search state
const serviceSearchQuery = ref('')
const showServiceSuggestions = ref(false)
const selectedService = ref<ServiceType | null>(null)
const allServices = ref<ServiceType[]>([])
const isLoadingServices = ref(false)

// Facility search state
const facilitySearchQuery = ref('')
const showFacilitySuggestions = ref(false)
const selectedFacility = ref<Facility | null>(null)
const allFacilities = ref<Facility[]>([])
const isLoadingFacilities = ref(false)

// Priority options
const priorityOptions = [
  { value: 'ROUTINE', label: 'Routine', description: 'Non urgente' },
  { value: 'URGENT', label: 'Urgente', description: 'Da eseguire prima possibile' },
  { value: 'EMERGENCY', label: 'Emergenza', description: 'Richiede attenzione immediata' }
]

// Computed: filtered patients based on search
const filteredPatients = computed(() => {
  if (!patientSearchQuery.value || patientSearchQuery.value.length < 2) {
    return []
  }

  const query = patientSearchQuery.value.toLowerCase().trim()
  return (props.users || []).filter(user => {
    const fullName = `${user.name} ${user.lastName}`.toLowerCase()
    const fiscalCode = user.fiscalCode.toLowerCase()
    return fullName.includes(query) || fiscalCode.includes(query)
  }).slice(0, 8)
})

// Computed: filtered services based on search
const filteredServices = computed(() => {
  // Se non c'è query, mostra tutti i servizi
  if (!serviceSearchQuery.value || serviceSearchQuery.value.trim().length === 0) {
    return allServices.value.slice(0, 10)
  }

  const query = serviceSearchQuery.value.toLowerCase().trim()
  return allServices.value.filter(service => {
    const name = service.name.toLowerCase()
    const code = service.code.toLowerCase()
    const description = service.description?.toLowerCase() || ''
    return name.includes(query) || code.includes(query) || description.includes(query)
  }).slice(0, 10)
})

// Computed: filtered facilities based on search
const filteredFacilities = computed(() => {
  // Se non c'è query, mostra tutte le strutture
  if (!facilitySearchQuery.value || facilitySearchQuery.value.trim().length === 0) {
    return allFacilities.value.slice(0, 10)
  }

  const query = facilitySearchQuery.value.toLowerCase().trim()
  return allFacilities.value.filter(facility => {
    const name = facility.name.toLowerCase()
    const city = facility.city?.toLowerCase() || ''
    return name.includes(query) || city.includes(query)
  }).slice(0, 10)
})

// Computed: form validity check
const isFormValid = computed(() => {
  return (
    formData.value.patientId &&
    formData.value.serviceId &&
    formData.value.facilityId &&
    formData.value.priority &&
    (formData.value.validityType === 'until_execution' || formData.value.validityDate)
  )
})

// Helper functions
function getDefaultValidityDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 90) // Default 90 days validity for service prescriptions
  return date.toISOString().split('T')[0] ?? ''
}

function getMinDate(): string {
  return new Date().toISOString().split('T')[0] ?? ''
}

function getPriorityLabel(priority: string): { label: string; description: string } {
  const found = priorityOptions.find(p => p.value === priority)
  return found ? { label: found.label, description: found.description } : { label: priority, description: '' }
}

// Patient handlers
const handlePatientInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  patientSearchQuery.value = target.value
  selectedPatient.value = null
  formData.value.patientId = ''
  formData.value.patientName = ''
  formData.value.patientFiscalCode = ''
  showPatientSuggestions.value = patientSearchQuery.value.length >= 2
}

const selectPatient = (user: UserInfo) => {
  selectedPatient.value = user
  formData.value.patientId = user.userId
  formData.value.patientName = `${user.name} ${user.lastName}`
  formData.value.patientFiscalCode = user.fiscalCode
  patientSearchQuery.value = `${user.name} ${user.lastName}`
  showPatientSuggestions.value = false
}

const handlePatientFocus = () => {
  if (patientSearchQuery.value.length >= 2) {
    showPatientSuggestions.value = true
  }
}

const handlePatientBlur = () => {
  setTimeout(() => {
    showPatientSuggestions.value = false
  }, 200)
}

// Service handlers
const handleServiceInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  serviceSearchQuery.value = target.value
  selectedService.value = null
  formData.value.serviceId = ''
  formData.value.serviceName = ''
  showServiceSuggestions.value = true
}

const selectService = (service: ServiceType) => {
  selectedService.value = service
  formData.value.serviceId = service._id
  formData.value.serviceName = service.name
  serviceSearchQuery.value = service.name
  showServiceSuggestions.value = false
}

const handleServiceFocus = () => {
  // Mostra sempre i suggerimenti al focus
  showServiceSuggestions.value = true
}

const handleServiceBlur = () => {
  setTimeout(() => {
    showServiceSuggestions.value = false
  }, 200)
}

// Facility handlers
const handleFacilityInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  facilitySearchQuery.value = target.value
  selectedFacility.value = null
  formData.value.facilityId = ''
  formData.value.facilityName = ''
  showFacilitySuggestions.value = true
}

const selectFacility = (facility: Facility) => {
  selectedFacility.value = facility
  formData.value.facilityId = facility._id
  formData.value.facilityName = facility.name
  facilitySearchQuery.value = facility.name
  showFacilitySuggestions.value = false
}

const handleFacilityFocus = () => {
  // Mostra sempre i suggerimenti al focus
  showFacilitySuggestions.value = true
}

const handleFacilityBlur = () => {
  setTimeout(() => {
    showFacilitySuggestions.value = false
  }, 200)
}

// Load services and facilities on mount
const loadMasterData = async () => {
  // Load services
  isLoadingServices.value = true
  try {
    allServices.value = await masterDataApi.getServiceTypes()
    console.log('[ServicePrescriptionForm] Loaded service types:', allServices.value.length)
  } catch (error) {
    console.error('[ServicePrescriptionForm] Error loading service types:', error)
  } finally {
    isLoadingServices.value = false
  }

  // Load facilities
  isLoadingFacilities.value = true
  try {
    allFacilities.value = await masterDataApi.getFacilities()
    console.log('[ServicePrescriptionForm] Loaded facilities:', allFacilities.value.length)
  } catch (error) {
    console.error('[ServicePrescriptionForm] Error loading facilities:', error)
  } finally {
    isLoadingFacilities.value = false
  }
}

// Reset form
const resetForm = () => {
  formData.value = {
    patientId: '',
    patientName: '',
    patientFiscalCode: '',
    serviceId: '',
    serviceName: '',
    facilityId: '',
    facilityName: '',
    validityType: 'until_date',
    validityDate: getDefaultValidityDate(),
    priority: 'ROUTINE'
  }
  patientSearchQuery.value = ''
  serviceSearchQuery.value = ''
  facilitySearchQuery.value = ''
  selectedPatient.value = null
  selectedService.value = null
  selectedFacility.value = null
  showPatientSuggestions.value = false
  showServiceSuggestions.value = false
  showFacilitySuggestions.value = false
}

// Watch for modal open/close
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadMasterData()
  } else {
    resetForm()
  }
})

// Handle save
const handleSave = () => {
  if (!isFormValid.value) {
    return
  }
  emit('save', { ...formData.value })
}

// Handle cancel
const handleCancel = () => {
  emit('close')
}

// Close dropdowns when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.autocomplete-container')) {
    showPatientSuggestions.value = false
    showServiceSuggestions.value = false
    showFacilitySuggestions.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>


<template>
  <FormModal 
    :is-open="isOpen" 
    :title="t('doctor.documents.prescriptions.service.title')"
    :subtitle="t('doctor.documents.prescriptions.service.subtitle')" 
    :show-back="true" 
    :save-label="t('common.save')"
    :cancel-label="t('common.cancel')" 
    :is-saving="isSaving" 
    :save-error="saveError" 
    max-width="md"
    @close="emit('close')" 
    @back="emit('back')" 
    @save="handleSave" 
    @cancel="handleCancel"
  >
    <form class="prescription-form" @submit.prevent="handleSave">
      
      <!-- Patient Search -->
      <div class="form-group">
        <label for="patient-search" class="form-label">
          {{ t('doctor.documents.prescriptions.service.patientName') }}
          <span class="required">*</span>
        </label>
        <div class="autocomplete-container">
          <input 
            id="patient-search" 
            :value="patientSearchQuery" 
            type="text" 
            class="form-input"
            :class="{ 'has-selection': selectedPatient }"
            :placeholder="isLoadingUsers ? 'Caricamento pazienti...' : t('doctor.documents.prescriptions.medicine.patientNamePlaceholder')"
            :disabled="isLoadingUsers"
            autocomplete="off"
            required
            @input="handlePatientInput"
            @focus="handlePatientFocus"
            @blur="handlePatientBlur"
          />
          
          <Transition name="dropdown">
            <div v-if="showPatientSuggestions && filteredPatients.length > 0" class="suggestions-dropdown">
              <button
                v-for="user in filteredPatients" 
                :key="user.userId" 
                type="button"
                class="suggestion-item"
                @mousedown.prevent="selectPatient(user)"
              >
                <div class="suggestion-main">
                  <span class="suggestion-name">{{ user.name }} {{ user.lastName }}</span>
                </div>
                <span class="suggestion-fiscal-code">{{ user.fiscalCode }}</span>
              </button>
            </div>
          </Transition>
          
          <Transition name="dropdown">
            <div v-if="showPatientSuggestions && patientSearchQuery.length >= 2 && filteredPatients.length === 0" class="suggestions-dropdown">
              <div class="suggestion-item no-results">
                {{ t('doctor.documents.prescriptions.noPatientResults') }}
              </div>
            </div>
          </Transition>
        </div>
        
        <!-- Selected patient info badge -->
        <div v-if="selectedPatient" class="selected-badge">
          <span class="badge-label">Paziente selezionato:</span>
          <span class="badge-value">{{ selectedPatient.name }} {{ selectedPatient.lastName }} - {{ selectedPatient.fiscalCode }}</span>
        </div>
      </div>

      <!-- Service/Visit Type Search -->
      <div class="form-group">
        <label for="service-search" class="form-label">
          Tipo di visita/esame
          <span class="required">*</span>
        </label>
        <div class="autocomplete-container">
          <input 
            id="service-search" 
            :value="serviceSearchQuery" 
            type="text" 
            class="form-input"
            :class="{ 'has-selection': selectedService }"
            :placeholder="isLoadingServices ? 'Caricamento servizi...' : 'Cerca tipo di visita o esame...'"
            :disabled="isLoadingServices"
            autocomplete="off"
            required
            @input="handleServiceInput"
            @focus="handleServiceFocus"
            @blur="handleServiceBlur"
          />
          
          <Transition name="dropdown">
            <div v-if="showServiceSuggestions && filteredServices.length > 0" class="suggestions-dropdown">
              <button
                v-for="service in filteredServices" 
                :key="service._id" 
                type="button"
                class="suggestion-item"
                @mousedown.prevent="selectService(service)"
              >
                <div class="suggestion-main">
                  <span class="suggestion-name">{{ service.name }}</span>
                  <span v-if="service.category" class="suggestion-strength">{{ service.category }}</span>
                </div>
                <span v-if="service.description" class="suggestion-detail">{{ service.description }}</span>
              </button>
            </div>
          </Transition>
          
          <Transition name="dropdown">
            <div v-if="showServiceSuggestions && serviceSearchQuery.length >= 2 && filteredServices.length === 0" class="suggestions-dropdown">
              <div class="suggestion-item no-results">
                Nessun servizio trovato
              </div>
            </div>
          </Transition>
        </div>
        
        <!-- Selected service info badge -->
        <div v-if="selectedService" class="selected-badge service-badge">
          <span class="badge-label">Servizio selezionato:</span>
          <span class="badge-value">{{ selectedService.name }}<span v-if="selectedService.category"> ({{ selectedService.category }})</span></span>
        </div>
      </div>

      <!-- Facility Search -->
      <div class="form-group">
        <label for="facility-search" class="form-label">
          Struttura sanitaria
          <span class="required">*</span>
        </label>
        <div class="autocomplete-container">
          <input 
            id="facility-search" 
            :value="facilitySearchQuery" 
            type="text" 
            class="form-input"
            :class="{ 'has-selection': selectedFacility }"
            :placeholder="isLoadingFacilities ? 'Caricamento strutture...' : 'Cerca struttura sanitaria...'"
            :disabled="isLoadingFacilities"
            autocomplete="off"
            required
            @input="handleFacilityInput"
            @focus="handleFacilityFocus"
            @blur="handleFacilityBlur"
          />
          
          <Transition name="dropdown">
            <div v-if="showFacilitySuggestions && filteredFacilities.length > 0" class="suggestions-dropdown">
              <button
                v-for="facility in filteredFacilities" 
                :key="facility._id" 
                type="button"
                class="suggestion-item"
                @mousedown.prevent="selectFacility(facility)"
              >
                <div class="suggestion-main">
                  <span class="suggestion-name">{{ facility.name }}</span>
                </div>
                <span v-if="facility.city" class="suggestion-detail">{{ facility.city }}</span>
              </button>
            </div>
          </Transition>
          
          <Transition name="dropdown">
            <div v-if="showFacilitySuggestions && facilitySearchQuery.length >= 2 && filteredFacilities.length === 0" class="suggestions-dropdown">
              <div class="suggestion-item no-results">
                Nessuna struttura trovata
              </div>
            </div>
          </Transition>
        </div>
        
        <!-- Selected facility info badge -->
        <div v-if="selectedFacility" class="selected-badge facility-badge">
          <span class="badge-label">Struttura selezionata:</span>
          <span class="badge-value">{{ selectedFacility.name }}<span v-if="selectedFacility.city"> - {{ selectedFacility.city }}</span></span>
        </div>
      </div>

      <!-- Validity Section -->
      <div class="form-section">
        <h3 class="section-title">Validità prescrizione</h3>
        
        <div class="form-row">
          <div class="form-group flex-1">
            <label class="form-label">Tipo validità <span class="required">*</span></label>
            <div class="radio-group">
              <label class="radio-option">
                <input 
                  v-model="formData.validityType" 
                  type="radio" 
                  value="until_date" 
                  name="validityType"
                />
                <span class="radio-label">Fino a data</span>
              </label>
              <label class="radio-option">
                <input 
                  v-model="formData.validityType" 
                  type="radio" 
                  value="until_execution" 
                  name="validityType"
                />
                <span class="radio-label">Fino ad esecuzione</span>
              </label>
            </div>
          </div>
        </div>
        
        <div v-if="formData.validityType === 'until_date'" class="form-row">
          <div class="form-group flex-1">
            <label for="validity-date" class="form-label">
              Data scadenza <span class="required">*</span>
            </label>
            <input 
              id="validity-date"
              v-model="formData.validityDate" 
              type="date" 
              class="form-input"
              :min="getMinDate()"
              required
            />
          </div>
        </div>
      </div>

      <!-- Priority Section -->
      <div class="form-section">
        <h3 class="section-title">Priorità</h3>
        
        <div class="form-group">
          <label class="form-label">Livello di priorità <span class="required">*</span></label>
          <div class="priority-options">
            <label 
              v-for="option in priorityOptions" 
              :key="option.value" 
              class="priority-option"
              :class="{ 'selected': formData.priority === option.value }"
            >
              <input 
                v-model="formData.priority" 
                type="radio" 
                :value="option.value" 
                name="priority"
                class="priority-radio"
              />
              <div class="priority-content">
                <span class="priority-label">{{ option.label }}</span>
                <span class="priority-description">{{ option.description }}</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <!-- Summary Preview -->
      <div v-if="isFormValid" class="prescription-summary">
        <h4 class="summary-title">Riepilogo prescrizione</h4>
        <p class="summary-text">
          <strong>{{ selectedService?.name }}</strong><br>
          Struttura: {{ selectedFacility?.name }}<br>
          Priorità: {{ getPriorityLabel(formData.priority).label }} - {{ getPriorityLabel(formData.priority).description }}
        </p>
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

.form-section {
  background: var(--white-40);
  border-radius: 1rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--white-60);
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.flex-1 {
  flex: 1;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.required {
  color: var(--red-dc2626);
  margin-left: 0.125rem;
}

.form-input,
.form-select {
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
.form-select:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: var(--white-80);
  box-shadow: 0 4px 12px var(--accent-primary-20), inset 0 1px 0 var(--white);
}

.form-input::placeholder {
  color: var(--text-tertiary);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-input.has-selection {
  border-color: var(--accent-primary);
  background: var(--white-70);
}

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23737373'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.25rem;
  padding-right: 2.5rem;
}

/* Autocomplete */
.autocomplete-container {
  position: relative;
}

.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 0;
  right: 0;
  background: var(--white);
  border: 1px solid var(--white-80);
  border-radius: 0.75rem;
  box-shadow: 0 8px 24px var(--shadow-lg);
  max-height: 280px;
  overflow-y: auto;
  z-index: 1000;
}

.suggestion-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
  background: transparent;
  text-align: left;
  border-bottom: 1px solid var(--white-90);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover,
.suggestion-item:focus {
  background: var(--accent-primary-10);
  outline: none;
}

.suggestion-item.no-results {
  color: var(--text-tertiary);
  cursor: default;
  font-style: italic;
}

.suggestion-item.no-results:hover {
  background: transparent;
}

.suggestion-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.suggestion-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9375rem;
}

.suggestion-strength {
  font-size: 0.8125rem;
  color: var(--accent-primary);
  font-weight: 500;
}

.suggestion-fiscal-code,
.suggestion-detail {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin-top: 0.125rem;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
}

.suggestion-detail {
  font-family: inherit;
}

/* Selected badge */
.selected-badge {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, var(--accent-primary-10) 0%, var(--accent-secondary-10, var(--accent-primary-10)) 100%);
  border: 1px solid var(--accent-primary-30);
  border-radius: 0.75rem;
  margin-top: 0.5rem;
}

.service-badge {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #fbbf24;
}

.facility-badge {
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  border-color: #c084fc;
}

.badge-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* Radio group */
.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.radio-option input[type="radio"] {
  width: 1.125rem;
  height: 1.125rem;
  accent-color: var(--accent-primary);
  cursor: pointer;
}

.radio-label {
  font-size: 0.9375rem;
  color: var(--text-primary);
}

/* Priority options */
.priority-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.priority-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--white-70);
  border: 2px solid var(--white-80);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.priority-option:hover {
  background: var(--white-80);
  border-color: var(--accent-primary-40);
}

.priority-option.selected {
  background: var(--accent-primary-10);
  border-color: var(--accent-primary);
}

.priority-radio {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--accent-primary);
  cursor: pointer;
}

.priority-content {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.priority-label {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
}

.priority-description {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

/* Summary */
.prescription-summary {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #7dd3fc;
  border-radius: 1rem;
  padding: 1rem 1.25rem;
}

.summary-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #0369a1;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.5rem 0;
}

.summary-text {
  font-size: 0.9375rem;
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0;
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

/* Responsive */
@media (max-width: 640px) {
  .prescription-form {
    gap: 1.25rem;
  }
  
  .form-section {
    padding: 0.875rem 1rem;
  }

  .form-row {
    flex-direction: column;
    gap: 1rem;
  }

  .form-input,
  .form-select {
    font-size: 1rem;
    padding: 0.875rem 1rem;
  }

  .radio-group {
    flex-direction: column;
    gap: 0.75rem;
  }

  .selected-badge {
    padding: 0.625rem 0.875rem;
  }

  .suggestions-dropdown {
    max-height: 200px;
  }

  .priority-option {
    padding: 0.875rem;
  }
}
</style>
