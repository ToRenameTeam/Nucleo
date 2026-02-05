<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  CalendarIcon,
  ClockIcon,
  BuildingOffice2Icon,
  ClipboardDocumentListIcon,
  UserIcon,
  MapPinIcon
} from '@heroicons/vue/24/outline'
import BaseModal from '../shared/BaseModal.vue'
import AvailabilitySlotsList from '../shared/AvailabilitySlotsList.vue'
import type { ScheduleModalProps, AvailabilityDisplay } from '../../types/availability'
import type { Facility, ServiceType } from '../../api/masterData'
import { masterDataApi } from '../../api/masterData'
import { availabilitiesApi } from '../../api/availabilities'
import { formatDateToISO, formatTimeForInput } from '../../utils/dateUtils'

const props = withDefaults(defineProps<ScheduleModalProps>(), {
  mode: 'create',
  availability: null,
  preselectedDate: null,
  preselectedHour: null,
  doctorId: undefined,
  currentAppointment: null
})

const emit = defineEmits<{
  close: []
  save: [data: {
    facilityId: string
    serviceTypeId: string
    startDateTime: string
    durationMinutes: number
  }]
  selectAvailability: [availabilityId: string]
}>()

const { t } = useI18n()

// Form state (for create/edit modes)
const selectedDate = ref('')
const selectedTime = ref('')
const selectedFacilityId = ref('')
const selectedServiceTypeId = ref('')
const selectedDuration = ref(30)
const isLoading = ref(false)
const isSaving = ref(false)

// Selection state (for select mode)
const availabilitiesList = ref<AvailabilityDisplay[]>([])
const selectedAvailabilityId = ref<string | null>(null)

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

const modalTitle = computed(() => t(props.title))

const modalSubtitle = computed(() => t(props.subtitle))

const isFormValid = computed(() => {
  if (props.mode === 'select') {
    return selectedAvailabilityId.value !== null
  }
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

async function loadAvailabilities() {
  if (props.mode !== 'select' || !props.doctorId) return
  
  isLoading.value = true
  try {
    const fetchedAvailabilities = await availabilitiesApi.getAvailabilitiesByDoctor(props.doctorId)
    availabilitiesList.value = fetchedAvailabilities
  } catch (error) {
    console.error('Error loading availabilities:', error)
  } finally {
    isLoading.value = false
  }
}

function initializeForm() {
  if (props.mode === 'edit' && props.availability) {
    // Edit mode - populate from availability
    const avail = props.availability
    selectedDate.value = formatDateToISO(avail.startDateTime)
    selectedTime.value = formatTimeForInput(avail.startDateTime)
    selectedFacilityId.value = avail.facilityId
    selectedServiceTypeId.value = avail.serviceTypeId
    selectedDuration.value = avail.durationMinutes
  } else if (props.preselectedDate) {
    // Create mode with preselected date/hour
    selectedDate.value = formatDateToISO(props.preselectedDate)
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
  
  // Reset selection state
  selectedAvailabilityId.value = null
}

function selectAvailability(availabilityId: string) {
  selectedAvailabilityId.value = availabilityId
}

async function handleSave() {
  if (!isFormValid.value) return
  
  if (props.mode === 'select') {
    // Emit the selected availability
    if (selectedAvailabilityId.value) {
      emit('selectAvailability', selectedAvailabilityId.value)
    }
    return
  }
  
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
    if (props.mode === 'select') {
      loadAvailabilities()
    } else if (facilities.value.length === 0) {
      loadMasterData()
    }
  }
})

onMounted(() => {
  if (props.isOpen) {
    initializeForm()
    if (props.mode === 'select') {
      loadAvailabilities()
    } else {
      loadMasterData()
    }
  }
})
</script>

<template>
  <BaseModal
    :is-open="isOpen"
    :title="modalTitle"
    :subtitle="modalSubtitle"
    :max-width="mode === 'select' ? 'lg' : 'md'"
    :close-on-backdrop="true"
    @close="handleClose"
  >
    <div class="availability-form">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ t('common.loading') }}</p>
      </div>

      <!-- SELECT MODE: Show current appointment and available slots -->
      <template v-else-if="mode === 'select'">
        <!-- Current Appointment Info (only when rescheduling) -->
        <div v-if="currentAppointment" class="appointment-info">
          <h3 class="info-title">{{ t('doctor.appointments.reschedule.currentAppointment') }}</h3>
          <div class="info-grid">
            <div v-if="currentAppointment.user" class="info-item">
              <UserIcon class="info-icon" />
              <span>{{ currentAppointment.user }}</span>
            </div>
            <div class="info-item">
              <CalendarIcon class="info-icon" />
              <span>{{ currentAppointment.date }}</span>
            </div>
            <div v-if="currentAppointment.time" class="info-item">
              <ClockIcon class="info-icon" />
              <span>{{ currentAppointment.time }}</span>
            </div>
            <div v-if="currentAppointment.location" class="info-item">
              <MapPinIcon class="info-icon" />
              <span>{{ currentAppointment.location }}</span>
            </div>
          </div>
        </div>

        <!-- Available Slots -->
        <div class="availabilities-wrapper">
          <h3 class="section-title">{{ t('doctor.appointments.reschedule.selectNewSlot') }}</h3>
          <AvailabilitySlotsList
            :availabilities="availabilitiesList"
            :selected-availability-id="selectedAvailabilityId"
            @select-availability="selectAvailability"
          />
        </div>
      </template>

      <!-- CREATE/EDIT MODE: Show form -->
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
          {{ mode === 'select' ? t('common.cancel') : t('doctor.availabilities.modal.cancel') }}
        </button>
        <button 
          class="btn btn-primary" 
          @click="handleSave"
          :disabled="!isFormValid || isSaving"
        >
          <span v-if="isSaving">{{ t('common.loading') }}</span>
          <span v-else>{{ mode === 'select' ? t('doctor.appointments.reschedule.confirm') : t('doctor.availabilities.modal.save') }}</span>
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--gray-525252);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--white-30);
  border-top-color: var(--sky-0ea5e9);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Select Mode Styles */
.appointment-info {
  padding: 1.5rem;
  background: var(--white-25);
  backdrop-filter: blur(12px);
  border: 1px solid var(--white-30);
  border-radius: 1rem;
}

.info-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-171717);
  margin: 0 0 1rem 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--gray-525252);
}

.info-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: var(--sky-0ea5e9);
}

.availabilities-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-171717);
  margin: 0;
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

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .time-slots {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>
