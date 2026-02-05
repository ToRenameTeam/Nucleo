<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../../composables/useAuth'
import TagBar from '../../components/shared/TagBar.vue'
import type { Tag } from '../../types/tag'
import AppointmentsCalendar from '../../components/shared/AppointmentsCalendar.vue'
import LoadingSpinner from '../../components/shared/LoadingSpinner.vue'
import BaseCard from '../../components/shared/BaseCard.vue'
import CardList from '../../components/shared/CardList.vue'
import type { Appointment } from '../../types/appointment'
import type { CardMetadata, CardAction } from '../../types/shared'
import { CalendarIcon, ClockIcon, UserIcon, MapPinIcon, PencilIcon, XCircleIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'
import { appointmentsApi } from '../../api/appointments'
import ScheduleModal from '../../components/shared/ScheduleModal.vue'
import { formatCategory } from '../../utils/formatters'
import { getBadgeColors, getBadgeIcon } from '../../utils/badgeHelpers'

const { t } = useI18n()

const { currentUser } = useAuth()

const appointments = ref<Appointment[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const isRescheduleModalOpen = ref(false)
const appointmentToReschedule = ref<Appointment | null>(null)

async function loadAppointments() {
  if (!currentUser.value?.userId) {
    console.log('[PatientCalendarPage] No current user ID available')
    return
  }

  isLoading.value = true
  error.value = null
  
  try {
    console.log('[PatientCalendarPage] Fetching appointments for patient:', currentUser.value.userId)
    const data = await appointmentsApi.getAppointmentsByPatient(currentUser.value.userId)
    // Filter only appointments with SCHEDULED status
    appointments.value = data.filter(apt => apt.status === 'SCHEDULED')
    console.log('[PatientCalendarPage] Loaded appointments:', data.length, 'Scheduled:', appointments.value.length)
  } catch (err) {
    console.error('[PatientCalendarPage] Error loading appointments:', err)
    error.value = err instanceof Error ? err.message : t('calendar.errors.loadingAppointments')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadAppointments()
})

const tags = computed<Tag[]>(() => {
  const allAppointments = appointments.value
  
  // Get unique categories from appointments
  const categoriesSet = new Set<string>()
  allAppointments.forEach(apt => {
    if (apt.category && apt.category.length > 0) {
      // Category is now an array, add each category
      apt.category.forEach(cat => categoriesSet.add(cat))
    }
  })
  
  const categoryTags: Tag[] = Array.from(categoriesSet).map(category => ({
    id: category,
    label: formatCategory(category),
    count: allAppointments.filter(a => a.category && a.category.includes(category)).length
  }))
  
  return [
    { id: 'all', label: t('calendar.categories.all'), count: allAppointments.length },
    ...categoryTags
  ]
})

const selectedTag = ref('all')
const selectedAppointmentId = ref<string | null>(null)

const filteredAppointments = computed(() => {
  const allAppointments = appointments.value
  if (selectedTag.value === 'all') {
    return allAppointments
  }
  return allAppointments.filter(apt => apt.category && apt.category.includes(selectedTag.value))
})

const currentAppointmentInfo = computed(() => {
  if (!appointmentToReschedule.value) return null
  return {
    user: appointmentToReschedule.value.user,
    date: appointmentToReschedule.value.date,
    time: appointmentToReschedule.value.time,
    location: appointmentToReschedule.value.location
  }
})

function handleTagSelected(tagId: string) {
  selectedTag.value = tagId
}

function handleCalendarEventClick(appointmentId: string) {
  selectedAppointmentId.value = appointmentId
  
  if (window.innerWidth >= 768) {
    const element = document.getElementById(appointmentId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }
}

function handleDateSelect(dateRange: { start: string; end: string }) {
  console.log('Selected date range:', dateRange)
}

function handleAppointmentClick(id: string) {
  selectedAppointmentId.value = id
}

async function handleEditAppointment(id: string) {
  try {
    isLoading.value = true
    
    const appointment = await appointmentsApi.getAppointmentById(id)
    
    if (appointment) {
      appointmentToReschedule.value = appointment
      isRescheduleModalOpen.value = true
    } else {
      console.error('[PatientCalendarPage] Appointment not found:', id)
      error.value = t('calendar.errors.appointmentNotFound')
    }
  } catch (err) {
    console.error('[PatientCalendarPage] Error loading appointment details:', err)
    error.value = t('calendar.errors.loadingDetails')
  } finally {
    isLoading.value = false
  }
}

async function handleCancelAppointment(id: string) {
  console.log('Cancel appointment:', id)
  if (!confirm(t('appointments.confirmCancel'))) {
    return
  }
  
  try {
    await appointmentsApi.deleteAppointment(id)
    // Reload appointments after cancellation
    await loadAppointments()
  } catch (err) {
    console.error('[PatientCalendarPage] Error cancelling appointment:', err)
    error.value = t('calendar.errors.cancellingAppointment')
  }
}

async function handleSelectAvailability(availabilityId: string) {
  if (!appointmentToReschedule.value) return
  
  try {
    isLoading.value = true
    
    await appointmentsApi.updateAppointment(
      appointmentToReschedule.value.id,
      undefined,
      availabilityId
    )
    
    isRescheduleModalOpen.value = false
    appointmentToReschedule.value = null
    
    // Reload appointments after rescheduling
    await loadAppointments()
  } catch (err) {
    console.error('[PatientCalendarPage] Error rescheduling appointment:', err)
    error.value = t('calendar.errors.reschedulingAppointment')
  } finally {
    isLoading.value = false
  }
}

// Get actions for appointment card
function getAppointmentActions(): CardAction[] {
  return [
    {
      id: 'edit',
      label: t('appointments.editAppointment'),
      icon: PencilIcon,
      variant: 'warning',
      onClick: handleEditAppointment
    },
    {
      id: 'cancel',
      label: t('appointments.cancelAppointment'),
      icon: XCircleIcon,
      variant: 'danger',
      onClick: handleCancelAppointment
    }
  ]
}

// Get metadata for appointment card
function getAppointmentMetadata(appointment: Appointment): CardMetadata[] {
  const meta: CardMetadata[] = [
    { icon: CalendarIcon, label: appointment.date }
  ]
  
  if (appointment.time) {
    meta.push({ icon: ClockIcon, label: appointment.time })
  }
  
  if (appointment.user) {
    meta.push({ icon: UserIcon, label: appointment.user })
  }
  
  if (appointment.location) {
    meta.push({ icon: MapPinIcon, label: appointment.location })
  }
  
  return meta
}
</script>

<template>
  <div class="calendar-page">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <div>
          <h1 class="page-title">{{ $t('calendar.title') }}</h1>
          <p class="page-subtitle">{{ $t('calendar.subtitle') }}</p>
        </div>
      </div>
    </div>

    <!-- Tag Bar -->
    <div class="tag-bar-container">
      <TagBar :tags="tags" @tag-selected="handleTagSelected" />
    </div>

    <!-- Calendar and Appointments Section -->
    <div class="content-section">
      <!-- Calendar -->
      <div class="calendar-container">
        <AppointmentsCalendar
          :appointments="filteredAppointments"
          :selected-appointment-id="selectedAppointmentId"
          @event-click="handleCalendarEventClick"
          @date-select="handleDateSelect"
        />
      </div>

      <!-- Appointments List -->
      <div class="appointments-list-container">
        <h2 class="appointments-list-title">{{ $t('calendar.appointments') }}</h2>
        
        <!-- Loading State -->
        <LoadingSpinner 
          v-if="isLoading" 
          :message="$t('calendar.loading')" 
          size="medium"
        />
        
        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <p class="error-text">{{ error }}</p>
          <button class="retry-btn" @click="loadAppointments">{{ $t('calendar.retry') }}</button>
        </div>
        
        <!-- Appointments List -->
        <CardList v-else-if="filteredAppointments.length > 0" gap="sm">
          <BaseCard
            v-for="appointment in filteredAppointments"
            :key="appointment.id"
            :card-id="appointment.id"
            :title="appointment.title"
            :description="appointment.serviceTypeDescription || appointment.description"
            :icon="CalendarIcon"
            :metadata="getAppointmentMetadata(appointment)"
            :actions="getAppointmentActions()"
            :selected="selectedAppointmentId === appointment.id"
            @click="handleAppointmentClick(appointment.id)"
          >
            <template v-if="appointment.category && appointment.category.length > 0" #badges>
              <div class="badges-row">
                <div 
                  v-for="cat in appointment.category"
                  :key="cat"
                  class="appointment-badge" 
                  :style="{
                    color: getBadgeColors(cat).color,
                    backgroundColor: getBadgeColors(cat).bgColor,
                    borderColor: getBadgeColors(cat).borderColor
                  }"
                >
                  <span class="badge-icon">{{ getBadgeIcon(cat) }}</span>
                  <span class="badge-label">{{ formatCategory(cat) }}</span>
                </div>
              </div>
            </template>
          </BaseCard>
        </CardList>
        
        <div v-else class="empty-state">
          <p class="empty-state-text">{{ $t('calendar.noAppointments') }}</p>
        </div>
      </div>
    </div>

    <!-- Reschedule Modal -->
    <ScheduleModal
      v-if="appointmentToReschedule"
      :is-open="isRescheduleModalOpen"
      mode="select"
      :doctor-id="appointmentToReschedule.doctorId || ''"
      :current-appointment="currentAppointmentInfo"
      title="patient.reschedule.title"
      subtitle="patient.reschedule.subtitle"
      @close="isRescheduleModalOpen = false"
      @select-availability="handleSelectAvailability"
    />
  </div>
</template>

<style scoped>
.calendar-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 100vw;
  overflow-x: hidden;
  padding: 2rem;
  background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-mid) 50%, var(--bg-gradient-end) 100%);
  position: relative;
}

.calendar-page::before {
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
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: var(--white-40);
  backdrop-filter: blur(20px);
  border: 1px solid var(--white-60);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px var(--black-8), inset 0 1px 0 var(--white-80);
  animation: slideInDown 0.5s cubic-bezier(0, 0, 0.2, 1);
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

.tag-bar-container {
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
  animation: fadeIn 0.5s cubic-bezier(0, 0, 0.2, 1);
  animation-delay: 0.1s;
  animation-fill-mode: both;
}

.content-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  position: relative;
  z-index: 1;
  animation: fadeIn 0.5s cubic-bezier(0, 0, 0.2, 1);
  animation-delay: 0.2s;
  animation-fill-mode: both;
  margin-bottom: 2rem;
  align-items: start;
}

.calendar-container {
  width: 100%;
}

.appointments-list-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  background: var(--white-40);
  backdrop-filter: blur(20px);
  border: 1px solid var(--white-60);
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 8px 32px var(--black-8), inset 0 1px 0 var(--white-80);
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
}

.appointments-list-container:hover {
  box-shadow: 0 12px 40px var(--black-12), inset 0 1px 0 var(--white-90);
}

.appointments-list-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-171717);
  margin: 0 0 1rem 0;
  line-height: 1.25;
}

.badges-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.appointment-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border: 1.5px solid;
  border-radius: 0.75rem;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-weight: 600;
  font-size: 0.8125rem;
  box-shadow: 0 2px 8px var(--badge-shadow), inset 0 1px 0 var(--white-40);
  width: fit-content;
  animation: fadeInScale 0.4s cubic-bezier(0, 0, 0.2, 1);
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
}

.badge-icon {
  font-size: 1.125rem;
  line-height: 1;
}

.badge-label {
  font-weight: 600;
  letter-spacing: 0.01em;
  font-size: 0.8125rem;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  text-align: center;
  background: var(--white-15);
  backdrop-filter: blur(12px);
  border: 1px solid var(--white-20);
  border-radius: 1rem;
  box-shadow: 0 4px 16px var(--black-8);
}

.empty-state-text {
  color: var(--gray-525252);
  margin: 0;
}

.error-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  text-align: center;
  background: var(--rgba-error-5);
  backdrop-filter: blur(12px);
  border: 1px solid var(--rgba-error-20);
  border-radius: 1rem;
  box-shadow: 0 4px 16px var(--black-8);
  gap: 1rem;
}

.error-text {
  color: var(--error-dc2626);
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: var(--sky-0ea5e9-20);
  backdrop-filter: blur(12px);
  border: 1px solid var(--white-20);
  border-radius: 0.75rem;
  color: var(--sky-0ea5e9);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  box-shadow: 0 2px 8px var(--black-10);
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--black-12);
  background: var(--sky-0ea5e9-30);
}

.retry-btn:active {
  transform: translateY(0);
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* FullCalendar customization styles are handled by AppointmentsCalendar component */

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

/* Responsive Design */
@media (max-width: 1024px) {
  .content-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .content-section {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 640px) {
  .calendar-page {
    padding: 0.75rem;
  }

  .header-content {
    padding: 1rem 1.25rem;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .page-subtitle {
    font-size: 0.875rem;
  }

  .new-appointment-btn {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
  }
  
  .appointments-list-title {
    font-size: 1.125rem;
  }
}

@media (max-width: 480px) {
  .calendar-page {
    padding: 0.5rem;
  }
  
  .header-content {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.375rem;
  }
  
  .page-subtitle {
    font-size: 0.8125rem;
  }
}

.calendar-container {
    padding: 0.5rem;
}

.appointments-container {
  padding: 0.5rem;
}
</style>