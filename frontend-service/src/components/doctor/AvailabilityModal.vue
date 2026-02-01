<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  CalendarIcon,
  ClockIcon,
  BuildingOffice2Icon,
  ClipboardDocumentListIcon
} from '@heroicons/vue/24/outline'
import BaseModal from '../shared/BaseModal.vue'
import type { AvailabilityModalProps } from '../../types/availability'
import type { Facility, ServiceType } from '../../api/masterData'
import { masterDataApi } from '../../api/masterData'

const props = withDefaults(defineProps<AvailabilityModalProps>(), {
  mode: 'create',
  availability: null,
  preselectedDate: null,
  preselectedHour: null
})

const emit = defineEmits<{
  close: []
  save: [data: {
    facilityId: string
    serviceTypeId: string
    startDateTime: string
    durationMinutes: number
  }]
}>()

const { t } = useI18n()

// Form state
const selectedDate = ref('')
const selectedTime = ref('')
const selectedFacilityId = ref('')
const selectedServiceTypeId = ref('')
const selectedDuration = ref(30)
const isLoading = ref(false)
const isSaving = ref(false)

const facilities = ref<Facility[]>([])
const serviceTypes = ref<ServiceType[]>([])

const durationOptions = [
  { value: 15, label: '15 minuti' },
  { value: 30, label: '30 minuti' },
  { value: 45, label: '45 minuti' },
  { value: 60, label: '1 ora' },
  { value: 90, label: '1 ora e 30 minuti' },
  { value: 120, label: '2 ore' }
]

const modalTitle = computed(() => {
  return props.mode === 'create' 
    ? t('doctor.availabilities.modal.titleCreate')
    : t('doctor.availabilities.modal.titleEdit')
})

const isFormValid = computed(() => {
  return selectedDate.value && 
         selectedTime.value && 
         selectedFacilityId.value && 
         selectedServiceTypeId.value &&
         selectedDuration.value > 0
})

async function loadMasterData() {
  isLoading.value = true
  try {
    const [facilitiesData, serviceTypesData] = await Promise.all([
      masterDataApi.getFacilities(),
      masterDataApi.getServiceTypes()
    ])
    facilities.value = facilitiesData
    serviceTypes.value = serviceTypesData
  } catch (error) {
    console.error('Error loading master data:', error)
  } finally {
    isLoading.value = false
  }
}

function initializeForm() {
  if (props.mode === 'edit' && props.availability) {
    // Edit mode - populate from availability
    const avail = props.availability
    selectedDate.value = formatDateForInput(avail.startDateTime)
    selectedTime.value = formatTimeForInput(avail.startDateTime)
    selectedFacilityId.value = avail.facilityId
    selectedServiceTypeId.value = avail.serviceTypeId
    selectedDuration.value = avail.durationMinutes
  } else if (props.preselectedDate) {
    // Create mode with preselected date/hour
    selectedDate.value = formatDateForInput(props.preselectedDate)
    if (props.preselectedHour !== null) {
      selectedTime.value = `${props.preselectedHour.toString().padStart(2, '0')}:00`
    }
    selectedFacilityId.value = ''
    selectedServiceTypeId.value = ''
    selectedDuration.value = 30
  } else {
    // Fresh create mode
    selectedDate.value = ''
    selectedTime.value = ''
    selectedFacilityId.value = ''
    selectedServiceTypeId.value = ''
    selectedDuration.value = 30
  }
}

function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatTimeForInput(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

async function handleSave() {
  if (!isFormValid.value) return
  
  isSaving.value = true
  
  try {
    // Combine date and time in LocalDateTime format (no timezone conversion)
    // Format: YYYY-MM-DDTHH:mm:ss
    const localDateTime = `${selectedDate.value}T${selectedTime.value}:00`
    
    emit('save', {
      facilityId: selectedFacilityId.value,
      serviceTypeId: selectedServiceTypeId.value,
      startDateTime: localDateTime,
      durationMinutes: selectedDuration.value
    })
  } catch (error) {
    console.error('Error saving availability:', error)
  } finally {
    isSaving.value = false
  }
}

function handleClose() {
  emit('close')
}

// Watch for modal open
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    initializeForm()
    if (facilities.value.length === 0) {
      loadMasterData()
    }
  }
})

onMounted(() => {
  if (props.isOpen) {
    initializeForm()
    loadMasterData()
  }
})
</script>

<template>
  <BaseModal
    :is-open="isOpen"
    :title="modalTitle"
    :subtitle="t('doctor.availabilities.modal.subtitle')"
    max-width="md"
    :close-on-backdrop="true"
    @close="handleClose"
  >
    <div class="availability-form">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <p>{{ t('common.loading') }}</p>
      </div>

      <template v-else>
        <!-- Date Field -->
        <div class="form-group">
          <label class="form-label">
            <CalendarIcon class="label-icon" />
            {{ t('doctor.availabilities.modal.date') }}
          </label>
          <input
            v-model="selectedDate"
            type="date"
            class="form-input"
            :min="new Date().toISOString().split('T')[0]"
          />
        </div>

        <!-- Time Field -->
        <div class="form-group">
          <label class="form-label">
            <ClockIcon class="label-icon" />
            {{ t('doctor.availabilities.modal.time') }}
          </label>
          <input
            v-model="selectedTime"
            type="time"
            class="form-input"
            step="900"
          />
        </div>

        <!-- Duration Field -->
        <div class="form-group">
          <label class="form-label">
            <ClockIcon class="label-icon" />
            {{ t('doctor.availabilities.modal.duration') }}
          </label>
          <select v-model="selectedDuration" class="form-select">
            <option 
              v-for="option in durationOptions" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>

        <!-- Facility Field -->
        <div class="form-group">
          <label class="form-label">
            <BuildingOffice2Icon class="label-icon" />
            {{ t('doctor.availabilities.modal.facility') }}
          </label>
          <select v-model="selectedFacilityId" class="form-select">
            <option value="" disabled>
              {{ t('doctor.availabilities.modal.selectFacility') }}
            </option>
            <option 
              v-for="facility in facilities" 
              :key="facility._id" 
              :value="facility._id"
            >
              {{ facility.name }}
            </option>
          </select>
        </div>

        <!-- Service Type Field -->
        <div class="form-group">
          <label class="form-label">
            <ClipboardDocumentListIcon class="label-icon" />
            {{ t('doctor.availabilities.modal.serviceType') }}
          </label>
          <select v-model="selectedServiceTypeId" class="form-select">
            <option value="" disabled>
              {{ t('doctor.availabilities.modal.selectServiceType') }}
            </option>
            <option 
              v-for="serviceType in serviceTypes" 
              :key="serviceType._id" 
              :value="serviceType._id"
            >
              {{ serviceType.name }}
            </option>
          </select>
        </div>
      </template>
    </div>

    <template #footer>
      <div class="modal-actions">
        <button 
          class="btn btn-secondary" 
          @click="handleClose"
          :disabled="isSaving"
        >
          {{ t('doctor.availabilities.modal.cancel') }}
        </button>
        <button 
          class="btn btn-primary" 
          @click="handleSave"
          :disabled="!isFormValid || isSaving"
        >
          <span v-if="isSaving">{{ t('common.loading') }}</span>
          <span v-else>{{ t('doctor.availabilities.modal.save') }}</span>
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.availability-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 0.5rem 0;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--gray-525252);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-525252);
}

.label-icon {
  width: 1rem;
  height: 1rem;
  color: var(--accent-primary);
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-family: inherit;
  color: var(--gray-171717);
  background: var(--white-60);
  backdrop-filter: blur(12px);
  border: 1px solid var(--white-60);
  border-radius: 0.75rem;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--accent-primary-50);
  box-shadow: 0 0 0 3px var(--accent-primary-15);
}

.form-input::placeholder {
  color: var(--gray-a3a3a3);
}

.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23525252'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.25rem;
  padding-right: 2.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
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
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--white-40);
  backdrop-filter: blur(12px);
  color: var(--gray-525252);
  border: 1px solid var(--white-60);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--white-60);
  color: var(--gray-171717);
}

.btn-primary {
  background: var(--accent-primary);
  color: var(--white);
  border: none;
  box-shadow: 0 4px 12px var(--accent-primary-30);
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-primary-85-black);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px var(--accent-primary-40);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}
</style>
