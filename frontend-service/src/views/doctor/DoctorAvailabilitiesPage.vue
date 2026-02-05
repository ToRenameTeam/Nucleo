<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuth } from '../../composables/useAuth'
import { 
  PlusIcon, 
  CalendarDaysIcon,
  ExclamationCircleIcon
} from '@heroicons/vue/24/outline'
import WeeklyAvailabilityCalendar from '../../components/doctor/weekly-calendar/WeeklyAvailabilityCalendar.vue'
import ScheduleModal from '../../components/shared/ScheduleModal.vue'
import Toast from '../../components/shared/Toast.vue'
import type { AvailabilityDisplay } from '../../types/availability'
import { availabilitiesApi } from '../../api/availabilities'

const { t } = useI18n()
const { currentUser } = useAuth()

// State
const availabilities = ref<AvailabilityDisplay[]>([])
const activeAvailabilities = computed(() => {
  return availabilities.value.filter(a => a.status !== 'CANCELLED')
})
const isLoading = ref(false)
const error = ref<string | null>(null)
const currentWeekStart = ref(getMonday(new Date()))

// Modal state
const isModalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const editingAvailability = ref<AvailabilityDisplay | null>(null)
const preselectedDate = ref<Date | null>(null)
const preselectedHour = ref<number | null>(null)
const modalTitle = ref('')
const modalSubtitle = ref('')

// Toast state
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info'>('success')

// Delete confirmation state
const showDeleteConfirm = ref(false)
const availabilityToDelete = ref<AvailabilityDisplay | null>(null)

// Get Monday of the current week
function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Statistics
const stats = computed(() => {
  const active = activeAvailabilities.value
  const total = active.length
  const available = active.filter(a => !a.isBooked).length
  const booked = active.filter(a => a.isBooked).length
  
  return { total, available, booked }
})

// Load availabilities
async function loadAvailabilities() {
  if (!currentUser.value?.userId) {
    console.log('[DoctorAvailabilitiesPage] No current user ID available')
    return
  }

  isLoading.value = true
  error.value = null
  
  try {
    const endOfWeek = new Date(currentWeekStart.value)
    endOfWeek.setDate(endOfWeek.getDate() + 6)
    
    const startDate = currentWeekStart.value.toISOString().split('T')[0]
    const endDate = endOfWeek.toISOString().split('T')[0]
    
    const fetchedAvailabilities = await availabilitiesApi.getAvailabilitiesByDoctor(
      currentUser.value.userId,
      startDate,
      endDate
    )
    
    availabilities.value = fetchedAvailabilities
  } catch (err) {
    console.error('Error loading availabilities:', err)
    error.value = t('doctor.availabilities.errorLoading')
  } finally {
    isLoading.value = false
  }
}

// Navigation handlers
function handlePreviousWeek() {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() - 7)
  currentWeekStart.value = newDate
  loadAvailabilities()
}

function handleNextWeek() {
  const newDate = new Date(currentWeekStart.value)
  newDate.setDate(newDate.getDate() + 7)
  currentWeekStart.value = newDate
  loadAvailabilities()
}

function handleTodayWeek() {
  currentWeekStart.value = getMonday(new Date())
  loadAvailabilities()
}

// Modal handlers
function openCreateModal(date?: Date, hour?: number) {
  modalMode.value = 'create'
  editingAvailability.value = null
  preselectedDate.value = date || null
  preselectedHour.value = hour ?? null
  modalTitle.value = 'doctor.availabilities.modal.titleCreate'
  modalSubtitle.value = 'doctor.availabilities.modal.subtitle'
  isModalOpen.value = true
}

function openEditModal(availability: AvailabilityDisplay) {
  if (availability.isBooked) {
    showToastMessage(t('doctor.availabilities.cannotEditBooked'), 'error')
    return
  }
  
  modalMode.value = 'edit'
  editingAvailability.value = availability
  preselectedDate.value = null
  preselectedHour.value = null
  modalTitle.value = 'doctor.availabilities.modal.titleEdit'
  modalSubtitle.value = 'doctor.availabilities.modal.subtitle'
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  editingAvailability.value = null
  preselectedDate.value = null
  preselectedHour.value = null
}

// Save handler
async function handleSave(data: {
  facilityId: string
  serviceTypeId: string
  startDateTime: string
  durationMinutes: number
}) {
  try {
    if (modalMode.value === 'create') {
      await availabilitiesApi.createAvailability({
        doctorId: currentUser.value?.userId || '',
        facilityId: data.facilityId,
        serviceTypeId: data.serviceTypeId,
        startDateTime: data.startDateTime,
        durationMinutes: data.durationMinutes
      })
      showToastMessage(t('doctor.availabilities.toast.created'), 'success')
    } else if (editingAvailability.value) {
      await availabilitiesApi.updateAvailability(editingAvailability.value.id, {
        facilityId: data.facilityId,
        serviceTypeId: data.serviceTypeId,
        startDateTime: data.startDateTime,
        durationMinutes: data.durationMinutes
      })
      showToastMessage(t('doctor.availabilities.toast.updated'), 'success')
    }
    
    closeModal()
    loadAvailabilities()
  } catch (err: any) {
    console.error('Error saving availability:', err)
    // Get localized error message based on error code
    const errorCode = err?.code || 'GENERIC_ERROR'
    const errorKey = `doctor.availabilities.errors.${errorCode}`
    const errorMessage = t(errorKey, t('doctor.availabilities.toast.error'))
    showToastMessage(errorMessage, 'error')
  }
}

// Delete handlers
function handleDeleteClick(availability: AvailabilityDisplay) {
  if (availability.isBooked) {
    showToastMessage(t('doctor.availabilities.cannotDeleteBooked'), 'error')
    return
  }
  
  availabilityToDelete.value = availability
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!availabilityToDelete.value) return
  
  try {
    await availabilitiesApi.deleteAvailability(availabilityToDelete.value.id)
    showToastMessage(t('doctor.availabilities.toast.deleted'), 'success')
    loadAvailabilities()
  } catch (err: any) {
    console.error('Error deleting availability:', err)
    // Get localized error message based on error code
    const errorCode = err?.code || 'GENERIC_ERROR'
    const errorKey = `doctor.availabilities.errors.${errorCode}`
    const errorMessage = t(errorKey, t('doctor.availabilities.toast.error'))
    showToastMessage(errorMessage, 'error')
  } finally {
    showDeleteConfirm.value = false
    availabilityToDelete.value = null
  }
}

function cancelDelete() {
  showDeleteConfirm.value = false
  availabilityToDelete.value = null
}

// Slot click handler
function handleSlotClick(date: Date, hour: number) {
  openCreateModal(date, hour)
}

// Toast helper
function showToastMessage(message: string, type: 'success' | 'error' | 'info' = 'success') {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

function closeToast() {
  showToast.value = false
}

// Load on mount
onMounted(() => {
  loadAvailabilities()
})
</script>

<template>
  <div class="doctor-availabilities-page">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">{{ t('doctor.availabilities.title') }}</h1>
          <p class="page-subtitle">{{ t('doctor.availabilities.subtitle') }}</p>
        </div>
        
        <!-- Add Availability Button -->
        <button 
          class="add-availability-btn"
          @click="openCreateModal()"
        >
          <PlusIcon class="btn-icon" />
          <span>{{ t('doctor.availabilities.addAvailability') }}</span>
        </button>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="stats-section">
      <div class="stat-card">
        <CalendarDaysIcon class="stat-icon total" />
        <div class="stat-content">
          <span class="stat-value">{{ stats.total }}</span>
          <span class="stat-label">{{ t('doctor.availabilities.stats.total') }}</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-indicator available"></div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.available }}</span>
          <span class="stat-label">{{ t('doctor.availabilities.stats.available') }}</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-indicator booked"></div>
        <div class="stat-content">
          <span class="stat-value">{{ stats.booked }}</span>
          <span class="stat-label">{{ t('doctor.availabilities.stats.booked') }}</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>{{ t('common.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <ExclamationCircleIcon class="error-icon" />
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadAvailabilities">
        {{ t('common.retry') }}
      </button>
    </div>

    <!-- Calendar Section -->
    <div v-else class="calendar-section">
      <WeeklyAvailabilityCalendar
        :availabilities="activeAvailabilities"
        :current-week-start="currentWeekStart"
        @previous-week="handlePreviousWeek"
        @next-week="handleNextWeek"
        @today-week="handleTodayWeek"
        @edit-availability="openEditModal"
        @delete-availability="handleDeleteClick"
        @slot-click="handleSlotClick"
      />
    </div>

    <!-- Availability Modal -->
    <ScheduleModal
      :is-open="isModalOpen"
      :mode="modalMode"
      :availability="editingAvailability"
      :preselected-date="preselectedDate"
      :preselected-hour="preselectedHour"
      :title="modalTitle"
      :subtitle="modalSubtitle"
      @close="closeModal"
      @save="handleSave"
    />

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDeleteConfirm" class="delete-confirm-overlay" @click.self="cancelDelete">
          <div class="delete-confirm-modal">
            <div class="delete-confirm-header">
              <ExclamationCircleIcon class="delete-confirm-icon" />
              <h3>{{ t('doctor.availabilities.deleteConfirm.title') }}</h3>
            </div>
            <p class="delete-confirm-message">
              {{ t('doctor.availabilities.deleteConfirm.message') }}
            </p>
            <div class="delete-confirm-actions">
              <button class="btn btn-secondary" @click="cancelDelete">
                {{ t('doctor.availabilities.deleteConfirm.cancel') }}
              </button>
              <button class="btn btn-danger" @click="confirmDelete">
                {{ t('doctor.availabilities.deleteConfirm.confirm') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast Notification -->
    <Toast 
      :show="showToast"
      :message="toastMessage"
      :type="toastType"
      @close="closeToast"
    />
  </div>
</template>

<style scoped>
.doctor-availabilities-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 100vw;
  overflow-x: hidden;
  padding: 2rem;
  background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-mid) 50%, var(--bg-gradient-end) 100%);
  position: relative;
}

.doctor-availabilities-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, var(--sky-0ea5e9-20) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, var(--purple-a855f7-20) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.header-section {
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
  animation: slideInDown 0.5s cubic-bezier(0, 0, 0.2, 1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: var(--white-40);
  backdrop-filter: blur(20px);
  border: 1px solid var(--white-60);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px var(--black-8), inset 0 1px 0 var(--white-80);
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--gray-171717);
  margin: 0;
  line-height: 1.25;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--gray-525252);
  margin-top: 0.5rem;
  line-height: 1.5;
}

.add-availability-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: var(--accent-primary);
  color: var(--white);
  border: none;
  border-radius: 1rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  box-shadow: 0 4px 16px var(--accent-primary-30);
}

.add-availability-btn:hover {
  background: var(--accent-primary-85-black);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px var(--accent-primary-40);
}

.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
  animation: fadeIn 0.5s cubic-bezier(0, 0, 0.2, 1);
  animation-delay: 0.1s;
  animation-fill-mode: both;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--white-40);
  backdrop-filter: blur(20px);
  border: 1px solid var(--white-60);
  border-radius: 1rem;
  box-shadow: 0 4px 16px var(--black-6);
}

.stat-icon {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0.5rem;
  border-radius: 0.75rem;
}

.stat-icon.total {
  background: var(--accent-primary-15);
  color: var(--accent-primary);
}

.stat-indicator {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.5rem;
}

.stat-indicator.available {
  background: var(--success-30);
  border: 2px solid var(--success);
}

.stat-indicator.booked {
  background: var(--accent-primary-30);
  border: 2px solid var(--accent-primary);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-171717);
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--gray-525252);
  margin-top: 0.25rem;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 4rem;
  background: var(--white-40);
  backdrop-filter: blur(20px);
  border: 1px solid var(--white-60);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px var(--black-8);
  position: relative;
  z-index: 1;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid var(--white-60);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  width: 3rem;
  height: 3rem;
  color: var(--error);
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: var(--white-40);
  backdrop-filter: blur(12px);
  color: var(--gray-525252);
  border: 1px solid var(--white-60);
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
}

.retry-btn:hover {
  background: var(--white-60);
  color: var(--gray-171717);
}

.calendar-section {
  position: relative;
  z-index: 1;
  animation: fadeIn 0.5s cubic-bezier(0, 0, 0.2, 1);
  animation-delay: 0.2s;
  animation-fill-mode: both;
  margin-bottom: 2rem;
}

/* Delete Confirmation Modal */
.delete-confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--black-50);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 700;
  padding: 1rem;
}

.delete-confirm-modal {
  background: var(--white-95);
  backdrop-filter: blur(20px);
  border: 1px solid var(--white-60);
  border-radius: 1.5rem;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 16px 48px var(--black-20);
  animation: slideUp 0.3s cubic-bezier(0, 0, 0.2, 1);
}

.delete-confirm-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.delete-confirm-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--error);
}

.delete-confirm-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-171717);
  margin: 0;
}

.delete-confirm-message {
  font-size: 1rem;
  color: var(--gray-525252);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.delete-confirm-actions {
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

.btn-secondary {
  background: var(--white-40);
  backdrop-filter: blur(12px);
  color: var(--gray-525252);
  border: 1px solid var(--white-60);
}

.btn-secondary:hover {
  background: var(--white-60);
  color: var(--gray-171717);
}

.btn-danger {
  background: var(--error);
  color: var(--white);
  border: none;
  box-shadow: 0 4px 12px var(--error-30);
}

.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px var(--error-40);
}

/* Animations */
@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .doctor-availabilities-page {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    padding: 1.25rem;
  }

  .add-availability-btn {
    justify-content: center;
    width: 100%;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }
}
</style>
