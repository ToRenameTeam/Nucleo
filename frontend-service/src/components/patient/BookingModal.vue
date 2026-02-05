<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  ChevronRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline'
import BaseModal from '../shared/BaseModal.vue'
import AvailabilitySlotsList from '../shared/AvailabilitySlotsList.vue'
import type { AvailabilityDisplay } from '../../types/availability'
import type { ServiceType } from '../../api/masterData'
import type { UserInfo } from '../../api/users'
import { masterDataApi } from '../../api/masterData'
import { userApi } from '../../api/users'
import { availabilitiesApi } from '../../api/availabilities'
import { hasMatchingSpecialization } from '../../utils/specialization'

interface Props {
  isOpen: boolean
  preselectedVisit?: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  confirm: [availabilityId: string]
}>()

const { t } = useI18n()

// Step state
const currentStep = ref(1)

// Step 1: Service Type selection
const serviceTypes = ref<ServiceType[]>([])
const selectedServiceType = ref<ServiceType | null>(null)
const loadingServiceTypes = ref(false)
const searchQuery = ref('')

const filteredServiceTypes = computed(() => {
  if (!searchQuery.value.trim()) {
    return serviceTypes.value
  }
  
  const query = searchQuery.value.toLowerCase().trim()
  return serviceTypes.value.filter(st => 
    st.name.toLowerCase().includes(query) ||
    (st.description && st.description.toLowerCase().includes(query))
  )
})

// Step 2: Doctor selection
const doctors = ref<UserInfo[]>([])
const filteredDoctors = computed(() => {
  if (!selectedServiceType.value || !selectedServiceType.value.category) {
    return []
  }

  const categories = Array.isArray(selectedServiceType.value.category) 
    ? selectedServiceType.value.category 
    : [selectedServiceType.value.category]

  return doctors.value.filter(doctor => {
    if (!doctor.doctor?.specializations) return false
    
    // Use utility function to match specializations with categories
    return hasMatchingSpecialization(doctor.doctor.specializations, categories)
  })
})
const selectedDoctor = ref<UserInfo | null>(null)
const loadingDoctors = ref(false)

// Step 3: Availability selection
const availabilities = ref<AvailabilityDisplay[]>([])
const selectedAvailability = ref<AvailabilityDisplay | null>(null)
const loadingAvailabilities = ref(false)

// Can proceed to next step
const canProceed = computed(() => {
  if (currentStep.value === 1) return selectedServiceType.value !== null
  if (currentStep.value === 2) return selectedDoctor.value !== null
  if (currentStep.value === 3) return selectedAvailability.value !== null
  return false
})

// Load service types
async function loadServiceTypes() {
  loadingServiceTypes.value = true
  try {
    serviceTypes.value = await masterDataApi.getServiceTypes()
  } catch (error) {
    console.error('Error loading service types:', error)
  } finally {
    loadingServiceTypes.value = false
  }
}

// Load doctors
async function loadDoctors() {
  loadingDoctors.value = true
  try {
    const allUsers = await userApi.getAllUsers()
    doctors.value = allUsers.filter(user => user.doctor !== undefined)
    console.log('[BookingModal] Doctors loaded:', doctors.value.length)
  } catch (error) {
    console.error('[BookingModal] Error loading doctors:', error)
  } finally {
    loadingDoctors.value = false
  }
}

// Load availabilities for selected doctor
async function loadAvailabilities() {
  if (!selectedDoctor.value) return
  
  loadingAvailabilities.value = true
  try {
    console.log('[BookingModal] Loading availabilities for doctor:', selectedDoctor.value.userId)
    const fetchedAvailabilities = await availabilitiesApi.getAvailabilitiesByDoctor(
      selectedDoctor.value.userId
    )
    availabilities.value = fetchedAvailabilities
    console.log('[BookingModal] Availabilities loaded:', availabilities.value.length)
  } catch (error) {
    console.error('[BookingModal] Error loading availabilities:', error)
    availabilities.value = []
  } finally {
    loadingAvailabilities.value = false
  }
}

// Select service type
function selectServiceType(serviceType: ServiceType) {
  selectedServiceType.value = serviceType
  selectedDoctor.value = null
  selectedAvailability.value = null
  availabilities.value = []
}

// Select doctor
function selectDoctor(doctor: UserInfo) {
  selectedDoctor.value = doctor
  selectedAvailability.value = null
  loadAvailabilities()
}

// Handle availability selection from AvailabilitySlotsList component
function handleSelectAvailability(availabilityId: string) {
  const availability = availabilities.value.find(a => a.id === availabilityId)
  if (availability) {
    selectedAvailability.value = availability
  }
}

// Next step
async function nextStep() {
  if (!canProceed.value) return
  
  if (currentStep.value === 1) {
    if (doctors.value.length === 0) {
      await loadDoctors()
    }
    console.log('[BookingModal] Selected service:', selectedServiceType.value?.name)
    console.log('[BookingModal] Service categories:', selectedServiceType.value?.category)
    console.log('[BookingModal] Filtered doctors for this service:', filteredDoctors.value.length)
  }
  
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

// Previous step
function previousStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Confirm booking
function handleConfirm() {
  if (!selectedAvailability.value) return
  emit('confirm', selectedAvailability.value.id)
}

// Close modal
function handleClose() {
  emit('close')
}

// Reset modal state
function resetModal() {
  currentStep.value = 1
  selectedServiceType.value = null
  selectedDoctor.value = null
  selectedAvailability.value = null
  availabilities.value = []
  searchQuery.value = ''
}

// Format doctor name with specializations
function formatDoctorName(doctor: UserInfo): string {
  const specs = doctor.doctor?.specializations || []
  const specsText = specs.length > 0 ? ` (${specs.join(', ')})` : ''
  return `Dott. ${doctor.lastName} ${doctor.name}${specsText}`
}

// Watch for modal open
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    resetModal()
    if (serviceTypes.value.length === 0) {
      await loadServiceTypes()
    }
    
    // Preselect service type if provided
    if (props.preselectedVisit) {
      const preselected = serviceTypes.value.find(
        st => st.name.toLowerCase() === props.preselectedVisit?.toLowerCase()
      )
      if (preselected) {
        selectServiceType(preselected)
      }
    }
  }
})

onMounted(() => {
  if (props.isOpen && serviceTypes.value.length === 0) {
    loadServiceTypes()
  }
})
</script>

<template>
  <BaseModal
    :is-open="isOpen"
    :title="t('patient.booking.modal.title')"
    :subtitle="t('patient.booking.modal.subtitle')"
    max-width="xl"
    :close-on-backdrop="true"
    @close="handleClose"
  >
    <div class="booking-modal">
      <!-- Progress Steps -->
      <div class="steps-indicator">
        <div 
          v-for="step in 3" 
          :key="step"
          class="step"
          :class="{ 
            active: currentStep === step, 
            completed: currentStep > step 
          }"
        >
          <div class="step-number">{{ step }}</div>
          <div class="step-label">
            <template v-if="step === 1">{{ t('patient.booking.modal.step1') }}</template>
            <template v-else-if="step === 2">{{ t('patient.booking.modal.step2') }}</template>
            <template v-else>{{ t('patient.booking.modal.step3') }}</template>
          </div>
        </div>
      </div>

      <!-- Step 1: Service Type Selection -->
      <div v-if="currentStep === 1" class="step-content">
        <h3 class="step-title">{{ t('patient.booking.modal.selectServiceType') }}</h3>
        
        <!-- Search Bar -->
        <div class="search-bar">
          <MagnifyingGlassIcon class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            :placeholder="t('appointmentBooking.searchPlaceholder')"
          />
        </div>
        
        <div v-if="loadingServiceTypes" class="loading-state">
          <div class="spinner"></div>
          <p>{{ t('common.loading') }}</p>
        </div>

        <div v-else-if="filteredServiceTypes.length === 0" class="empty-state">
          <p>{{ t('common.noResults') || 'Nessun risultato trovato' }}</p>
        </div>

        <div v-else class="options-list">
          <button
            v-for="serviceType in filteredServiceTypes"
            :key="serviceType._id"
            class="option-card"
            :class="{ selected: selectedServiceType?._id === serviceType._id }"
            @click="selectServiceType(serviceType)"
          >
            <div class="option-content">
              <div class="option-name">{{ serviceType.name }}</div>
              <div v-if="serviceType.description" class="option-description">
                {{ serviceType.description }}
              </div>
            </div>
            <ChevronRightIcon class="option-arrow" />
          </button>
        </div>
      </div>

      <!-- Step 2: Doctor Selection -->
      <div v-if="currentStep === 2" class="step-content">
        <h3 class="step-title">{{ t('patient.booking.modal.selectDoctor') }}</h3>
        
        <div v-if="selectedServiceType" class="selected-info">
          <span class="info-label">{{ t('patient.booking.modal.selectedService') }}:</span>
          <span class="info-value">{{ selectedServiceType.name }}</span>
        </div>

        <div v-if="loadingDoctors" class="loading-state">
          <div class="spinner"></div>
          <p>{{ t('common.loading') }}</p>
        </div>

        <div v-else-if="filteredDoctors.length === 0" class="empty-state">
          <p>{{ t('patient.booking.modal.noDoctorsAvailable') }}</p>
        </div>

        <div v-else class="options-list">
          <button
            v-for="doctor in filteredDoctors"
            :key="doctor.userId"
            class="option-card"
            :class="{ selected: selectedDoctor?.userId === doctor.userId }"
            @click="selectDoctor(doctor)"
          >
            <div class="option-content">
              <div class="option-name">{{ formatDoctorName(doctor) }}</div>
            </div>
            <ChevronRightIcon class="option-arrow" />
          </button>
        </div>
      </div>

      <!-- Step 3: Availability Selection -->
      <div v-if="currentStep === 3" class="step-content">
        <h3 class="step-title">{{ t('patient.booking.modal.selectSlot') }}</h3>
        
        <div class="selected-info-group">
          <div v-if="selectedServiceType" class="selected-info">
            <span class="info-label">{{ t('patient.booking.modal.selectedService') }}:</span>
            <span class="info-value">{{ selectedServiceType.name }}</span>
          </div>
          <div v-if="selectedDoctor" class="selected-info">
            <span class="info-label">{{ t('patient.booking.modal.selectedDoctor') }}:</span>
            <span class="info-value">{{ formatDoctorName(selectedDoctor) }}</span>
          </div>
        </div>

        <div v-if="loadingAvailabilities" class="loading-state">
          <div class="spinner"></div>
          <p>{{ t('common.loading') }}</p>
        </div>

        <div v-else class="availabilities-wrapper">
          <AvailabilitySlotsList
            :availabilities="availabilities"
            :selected-availability-id="selectedAvailability?.id"
            :empty-message="t('patient.booking.modal.noSlotsAvailable')"
            @select-availability="handleSelectAvailability"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="modal-actions">
        <button
          v-if="currentStep > 1"
          class="btn btn-outline"
          @click="previousStep"
        >
          {{ t('common.back') }}
        </button>
        
        <button
          v-if="currentStep < 3"
          class="btn btn-primary"
          :disabled="!canProceed"
          @click="nextStep"
        >
          {{ t('common.next') }}
        </button>

        <button
          v-if="currentStep === 3"
          class="btn btn-primary"
          :disabled="!selectedAvailability"
          @click="handleConfirm"
        >
          {{ t('patient.booking.modal.confirmBooking') }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
/* Sovrascrivo il padding del modal-body per recuperare spazio */
:deep(.modal-body) {
  padding: 1rem 2rem;
}

.booking-modal {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

/* Steps Indicator */
.steps-indicator {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  background: var(--white-15);
  backdrop-filter: blur(var(--blur-md));
  border: 1px solid var(--white-20);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-glass-sm);
}

.step {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  opacity: 0.6;
  transition: all var(--duration-base) var(--ease-out);
}

.step.active,
.step.completed {
  opacity: 1;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: var(--radius-full);
  background: var(--white-30);
  border: 2px solid var(--white-40);
  color: var(--text-secondary);
  font-weight: var(--font-bold);
  font-size: var(--text-base);
  transition: all var(--duration-base) var(--ease-out);
}

.step.active .step-number {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
  box-shadow: 0 0 0 4px var(--accent-primary-15);
  transform: scale(1.05);
}

.step.completed .step-number {
  background: var(--success);
  border-color: var(--success);
  color: white;
}

.step-label {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  display: none;
  white-space: nowrap;
}

@media (min-width: 640px) {
  .step-label {
    display: block;
  }
}

/* Step Content */
.step-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  height: 28rem;
  overflow: hidden;
}

.step-title {
  margin: 0;
  padding: var(--space-2) 0;
  font-size: 1.125rem;
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

/* Search Bar */
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 1rem;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-secondary);
  pointer-events: none;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  font-size: var(--text-base);
  font-family: var(--font-primary);
  color: var(--text-primary);
  background: var(--white-20);
  backdrop-filter: blur(var(--blur-md));
  border: 2px solid var(--white-30);
  border-radius: var(--radius-xl);
  transition: all var(--duration-base) var(--ease-out);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.search-input:focus {
  background: var(--white-30);
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 4px var(--accent-primary-10);
}

.search-input:hover:not(:focus) {
  border-color: var(--white-50);
}

/* Selected Info */
.selected-info-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--white-15);
  backdrop-filter: blur(var(--blur-md));
  border: 1px solid var(--white-20);
  border-radius: var(--radius-lg);
}

.selected-info {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  font-size: var(--text-sm);
}

.info-label {
  font-weight: var(--font-semibold);
  color: var(--text-secondary);
}

.info-value {
  font-weight: var(--font-medium);
  color: var(--text-primary);
}

/* Options List */
.options-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-height: 28rem;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--space-2) var(--space-3) var(--space-2) var(--space-1);
  /* Scroll personalizzato */
  scrollbar-width: thin;
  scrollbar-color: var(--white-40) var(--white-15);
}

.options-list::-webkit-scrollbar {
  width: 8px;
}

.options-list::-webkit-scrollbar-track {
  background: var(--white-15);
  border-radius: var(--radius-full);
}

.options-list::-webkit-scrollbar-thumb {
  background: var(--white-40);
  border-radius: var(--radius-full);
  transition: background var(--duration-fast);
}

.options-list::-webkit-scrollbar-thumb:hover {
  background: var(--white-50);
}

.option-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1.25rem 1.5rem;
  background: var(--white-20);
  backdrop-filter: blur(var(--blur-md));
  border: 2px solid var(--white-30);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-glass-sm);
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-out);
  text-align: left;
}

@media (min-width: 640px) {
  .option-card {
    padding: 1.5rem 2rem;
  }
}

@media (min-width: 768px) {
  .option-card {
    padding: 1.75rem 2.5rem;
  }
}

.option-card:hover {
  background: var(--white-30);
  border-color: var(--white-50);
  transform: translateX(6px);
  box-shadow: var(--shadow-glass-md);
}

.option-card.selected {
  background: var(--accent-primary-15);
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 4px var(--accent-primary-10), var(--shadow-glass-md);
}

.option-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

@media (min-width: 640px) {
  .option-content {
    gap: 0.625rem;
  }
}

.option-name {
  font-size: 0.9375rem;
  font-weight: var(--font-bold);
  color: var(--text-primary);
  line-height: 1.5;
  word-wrap: break-word;
}

@media (min-width: 640px) {
  .option-name {
    font-size: 1rem;
  }
}

@media (min-width: 768px) {
  .option-name {
    font-size: 1.0625rem;
  }
}

.option-description {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.6;
  word-wrap: break-word;
}

@media (min-width: 640px) {
  .option-description {
    font-size: 0.875rem;
  }
}

.option-arrow {
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
  flex-shrink: 0;
  opacity: 0.5;
  transition: all var(--duration-base) var(--ease-out);
  margin-left: 1rem;
}

@media (min-width: 640px) {
  .option-arrow {
    width: 24px;
    height: 24px;
    margin-left: 1.5rem;
  }
}

.option-card:hover .option-arrow {
  transform: translateX(4px);
  opacity: 1;
}

.option-card.selected .option-arrow {
  color: var(--accent-primary);
  opacity: 1;
}

/* Availabilities Section */
.availabilities-wrapper {
  max-height: 28rem;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--space-2) var(--space-3) var(--space-2) var(--space-1);
  /* Scroll personalizzato */
  scrollbar-width: thin;
  scrollbar-color: var(--white-40) var(--white-15);
}

.availabilities-wrapper::-webkit-scrollbar {
  width: 8px;
}

.availabilities-wrapper::-webkit-scrollbar-track {
  background: var(--white-15);
  border-radius: var(--radius-full);
}

.availabilities-wrapper::-webkit-scrollbar-thumb {
  background: var(--white-40);
  border-radius: var(--radius-full);
  transition: background var(--duration-fast);
}

.availabilities-wrapper::-webkit-scrollbar-thumb:hover {
  background: var(--white-50);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-12);
  min-height: 200px;
}

.loading-state p {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--white-30);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  min-height: 200px;
  text-align: center;
  background: var(--white-10);
  border: 2px dashed var(--white-30);
  border-radius: var(--radius-xl);
}

.empty-state p {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin: 0;
}

/* Modal Actions */
.modal-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  padding-top: var(--space-5);
  margin-top: var(--space-2);
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  border: 1px solid transparent;
  min-width: 6rem;
}

.btn:focus-visible {
  outline: 3px solid var(--accent-primary);
  outline-offset: 3px;
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: var(--white);
  border-color: var(--white-20);
  box-shadow: 0 4px 16px var(--accent-primary-30), inset 0 1px 0 var(--white-20);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--accent-primary-40), inset 0 1px 0 var(--white-30);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background: var(--white-40);
  backdrop-filter: blur(12px);
  color: var(--text-primary);
  border-color: var(--white-60);
  box-shadow: 0 2px 8px var(--shadow), inset 0 1px 0 var(--white-60);
}

.btn-outline:hover:not(:disabled) {
  background: var(--white-50);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow), inset 0 1px 0 var(--white-70);
}

.btn-outline:active:not(:disabled) {
  transform: translateY(0);
}
</style>
