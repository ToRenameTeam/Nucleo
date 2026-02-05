<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import FormModal from '../../shared/FormModal.vue'
import type { UserInfo } from '../../../api/users'
import { masterDataApi, type Medicine } from '../../../api/masterData'

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
  save: [prescription: MedicinePrescriptionFormData]
}>()

// Types
export interface MedicinePrescriptionFormData {
  patientId: string
  patientName: string
  patientFiscalCode: string
  medicineId: string
  medicineName: string
  validityType: 'until_date' | 'until_execution'
  validityDate: string
  doseAmount: number
  doseUnit: string
  frequencyTimes: number
  frequencyPeriod: string
  durationLength: number
  durationUnit: string
}

// Form data
const formData = ref<MedicinePrescriptionFormData>({
  patientId: '',
  patientName: '',
  patientFiscalCode: '',
  medicineId: '',
  medicineName: '',
  validityType: 'until_date',
  validityDate: getDefaultValidityDate(),
  doseAmount: 1,
  doseUnit: 'MILLIGRAM',
  frequencyTimes: 1,
  frequencyPeriod: 'DAY',
  durationLength: 7,
  durationUnit: 'DAY'
})

// Patient search state
const patientSearchQuery = ref('')
const showPatientSuggestions = ref(false)
const selectedPatient = ref<UserInfo | null>(null)

// Medicine search state
const medicineSearchQuery = ref('')
const showMedicineSuggestions = ref(false)
const selectedMedicine = ref<Medicine | null>(null)
const allMedicines = ref<Medicine[]>([])
const isLoadingMedicines = ref(false)

// Options
// Backend DoseUnit enum: GRAM, MILLIGRAM, LITER, MILLILITER
const doseUnits = [
  { value: 'MILLIGRAM', label: 'mg' },
  { value: 'GRAM', label: 'g' },
  { value: 'MILLILITER', label: 'ml' },
  { value: 'LITER', label: 'l' }
]

const frequencyPeriods = [
  { value: 'DAY', label: 'al giorno' },
  { value: 'WEEK', label: 'a settimana' },
  { value: 'MONTH', label: 'al mese' }
]

const durationUnits = [
  { value: 'DAY', label: 'giorni' },
  { value: 'WEEK', label: 'settimane' },
  { value: 'MONTH', label: 'mesi' }
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

// Computed: filtered medicines based on search
const filteredMedicines = computed(() => {
  if (!medicineSearchQuery.value || medicineSearchQuery.value.length < 2) {
    return []
  }

  const query = medicineSearchQuery.value.toLowerCase().trim()
  return allMedicines.value.filter(medicine => {
    const name = medicine.name.toLowerCase()
    const activeIngredient = medicine.activeIngredient.toLowerCase()
    const description = medicine.description.toLowerCase()
    return name.includes(query) || activeIngredient.includes(query) || description.includes(query)
  }).slice(0, 8)
})

// Computed: form validity check
const isFormValid = computed(() => {
  return (
    formData.value.patientId &&
    formData.value.medicineId &&
    formData.value.doseAmount > 0 &&
    formData.value.doseUnit &&
    formData.value.frequencyTimes > 0 &&
    formData.value.frequencyPeriod &&
    formData.value.durationLength > 0 &&
    formData.value.durationUnit &&
    (formData.value.validityType === 'until_execution' || formData.value.validityDate)
  )
})

// Helper functions
function getDefaultValidityDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 30) // Default 30 days validity
  return date.toISOString().split('T')[0] ?? ''
}

function getMinDate(): string {
  return new Date().toISOString().split('T')[0] ?? ''
}

function getDoseUnitLabel(unit: string): string {
  const found = doseUnits.find(u => u.value === unit)
  return found ? found.label : unit
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
  // Delay to allow click on suggestion
  setTimeout(() => {
    showPatientSuggestions.value = false
  }, 200)
}

// Medicine handlers
const handleMedicineInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  medicineSearchQuery.value = target.value
  selectedMedicine.value = null
  formData.value.medicineId = ''
  formData.value.medicineName = ''
  showMedicineSuggestions.value = medicineSearchQuery.value.length >= 2
}

const selectMedicine = (medicine: Medicine) => {
  selectedMedicine.value = medicine
  formData.value.medicineId = medicine._id
  formData.value.medicineName = medicine.name
  medicineSearchQuery.value = `${medicine.name} (${medicine.strength})`
  showMedicineSuggestions.value = false
}

const handleMedicineFocus = () => {
  if (medicineSearchQuery.value.length >= 2) {
    showMedicineSuggestions.value = true
  }
}

const handleMedicineBlur = () => {
  setTimeout(() => {
    showMedicineSuggestions.value = false
  }, 200)
}

// Load medicines on mount
const loadMedicines = async () => {
  isLoadingMedicines.value = true
  try {
    allMedicines.value = await masterDataApi.getMedicines({ active: true })
    console.log('[MedicinePrescriptionForm] Loaded medicines:', allMedicines.value.length)
  } catch (error) {
    console.error('[MedicinePrescriptionForm] Error loading medicines:', error)
  } finally {
    isLoadingMedicines.value = false
  }
}

// Reset form
const resetForm = () => {
  formData.value = {
    patientId: '',
    patientName: '',
    patientFiscalCode: '',
    medicineId: '',
    medicineName: '',
    validityType: 'until_date',
    validityDate: getDefaultValidityDate(),
    doseAmount: 1,
    doseUnit: 'MILLIGRAM',
    frequencyTimes: 1,
    frequencyPeriod: 'DAY',
    durationLength: 7,
    durationUnit: 'DAY'
  }
  patientSearchQuery.value = ''
  medicineSearchQuery.value = ''
  selectedPatient.value = null
  selectedMedicine.value = null
  showPatientSuggestions.value = false
  showMedicineSuggestions.value = false
}

// Watch for modal open/close
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadMedicines()
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
    showMedicineSuggestions.value = false
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
    :title="t('doctor.documents.prescriptions.medicine.title')"
    :subtitle="t('doctor.documents.prescriptions.medicine.subtitle')" 
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
          {{ t('doctor.documents.prescriptions.medicine.patientName') }}
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

      <!-- Medicine Search -->
      <div class="form-group">
        <label for="medicine-search" class="form-label">
          {{ t('doctor.documents.prescriptions.medicine.medicineName') }}
          <span class="required">*</span>
        </label>
        <div class="autocomplete-container">
          <input 
            id="medicine-search" 
            :value="medicineSearchQuery" 
            type="text" 
            class="form-input"
            :class="{ 'has-selection': selectedMedicine }"
            :placeholder="isLoadingMedicines ? 'Caricamento farmaci...' : t('doctor.documents.prescriptions.medicine.medicineNamePlaceholder')"
            :disabled="isLoadingMedicines"
            autocomplete="off"
            required
            @input="handleMedicineInput"
            @focus="handleMedicineFocus"
            @blur="handleMedicineBlur"
          />
          
          <Transition name="dropdown">
            <div v-if="showMedicineSuggestions && filteredMedicines.length > 0" class="suggestions-dropdown">
              <button
                v-for="medicine in filteredMedicines" 
                :key="medicine._id" 
                type="button"
                class="suggestion-item"
                @mousedown.prevent="selectMedicine(medicine)"
              >
                <div class="suggestion-main">
                  <span class="suggestion-name">{{ medicine.name }}</span>
                  <span class="suggestion-strength">{{ medicine.strength }}</span>
                </div>
                <span class="suggestion-detail">{{ medicine.activeIngredient }} - {{ medicine.dosageForm }}</span>
              </button>
            </div>
          </Transition>
          
          <Transition name="dropdown">
            <div v-if="showMedicineSuggestions && medicineSearchQuery.length >= 2 && filteredMedicines.length === 0" class="suggestions-dropdown">
              <div class="suggestion-item no-results">
                Nessun farmaco trovato
              </div>
            </div>
          </Transition>
        </div>
        
        <!-- Selected medicine info badge -->
        <div v-if="selectedMedicine" class="selected-badge medicine-badge">
          <span class="badge-label">Farmaco selezionato:</span>
          <span class="badge-value">{{ selectedMedicine.name }} {{ selectedMedicine.strength }} ({{ selectedMedicine.activeIngredient }})</span>
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

      <!-- Dosage Section -->
      <div class="form-section">
        <h3 class="section-title">{{ t('doctor.documents.prescriptions.medicine.dosage') }}</h3>
        
        <div class="form-row">
          <div class="form-group flex-1">
            <label for="dose-amount" class="form-label">
              Quantità <span class="required">*</span>
            </label>
            <input 
              id="dose-amount"
              v-model.number="formData.doseAmount" 
              type="number" 
              class="form-input"
              min="1"
              step="0.5"
              required
            />
          </div>
          <div class="form-group flex-1">
            <label for="dose-unit" class="form-label">
              Unità <span class="required">*</span>
            </label>
            <select 
              id="dose-unit"
              v-model="formData.doseUnit" 
              class="form-select"
              required
            >
              <option v-for="unit in doseUnits" :key="unit.value" :value="unit.value">
                {{ unit.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Frequency Section -->
      <div class="form-section">
        <h3 class="section-title">{{ t('doctor.documents.prescriptions.medicine.frequency') }}</h3>
        
        <div class="form-row">
          <div class="form-group flex-1">
            <label for="frequency-times" class="form-label">
              Volte <span class="required">*</span>
            </label>
            <input 
              id="frequency-times"
              v-model.number="formData.frequencyTimes" 
              type="number" 
              class="form-input"
              min="1"
              required
            />
          </div>
          <div class="form-group flex-1">
            <label for="frequency-period" class="form-label">
              Periodo <span class="required">*</span>
            </label>
            <select 
              id="frequency-period"
              v-model="formData.frequencyPeriod" 
              class="form-select"
              required
            >
              <option v-for="period in frequencyPeriods" :key="period.value" :value="period.value">
                {{ period.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Duration Section -->
      <div class="form-section">
        <h3 class="section-title">{{ t('doctor.documents.prescriptions.medicine.duration') }}</h3>
        
        <div class="form-row">
          <div class="form-group flex-1">
            <label for="duration-length" class="form-label">
              Durata <span class="required">*</span>
            </label>
            <input 
              id="duration-length"
              v-model.number="formData.durationLength" 
              type="number" 
              class="form-input"
              min="1"
              required
            />
          </div>
          <div class="form-group flex-1">
            <label for="duration-unit" class="form-label">
              Unità <span class="required">*</span>
            </label>
            <select 
              id="duration-unit"
              v-model="formData.durationUnit" 
              class="form-select"
              required
            >
              <option v-for="unit in durationUnits" :key="unit.value" :value="unit.value">
                {{ unit.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Summary Preview -->
      <div v-if="isFormValid" class="prescription-summary">
        <h4 class="summary-title">Riepilogo prescrizione</h4>
        <p class="summary-text">
          <strong>{{ selectedMedicine?.name }}</strong> {{ selectedMedicine?.strength }}<br>
          {{ formData.doseAmount }} {{ getDoseUnitLabel(formData.doseUnit) }} - 
          {{ formData.frequencyTimes }} {{ frequencyPeriods.find(p => p.value === formData.frequencyPeriod)?.label }}<br>
          per {{ formData.durationLength }} {{ durationUnits.find(u => u.value === formData.durationUnit)?.label }}
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

.medicine-badge {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-color: #6ee7b7;
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
}
</style>
