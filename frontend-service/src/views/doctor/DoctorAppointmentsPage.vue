<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { CalendarIcon, ListBulletIcon, UserIcon, ClockIcon, MapPinIcon, PencilIcon, XCircleIcon } from '@heroicons/vue/24/outline'
import TagBar from '../../components/shared/TagBar.vue'
import AppointmentsCalendar from '../../components/shared/AppointmentsCalendar.vue'
import BaseCard from '../../components/shared/BaseCard.vue'
import CardList from '../../components/shared/CardList.vue'
import type { Tag } from '../../types/tag'
import type { Appointment } from '../../types/appointment'
import type { CardMetadata } from '../../types/shared'
import { appointmentsApi } from '../../api/appointments'
import { MOCK_APPOINTMENTS } from '../../constants/mockData'
import { TAG_COLOR_MAP, TAG_ICON_MAP } from '../../constants/mockData'
import type { BadgeColors } from '../../types/document'

const { t } = useI18n()

// View mode: 'list' or 'calendar'
const viewMode = ref<'list' | 'calendar'>('list')

// State
const appointments = ref<Appointment[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const selectedAppointmentId = ref<string | null>(null)
const selectedTag = ref('all')

// Mock doctor ID (in produzione verrebbe dal contesto/store)
const doctorId = 'doc-001'

// Computed tags based on appointments
const tags = computed<Tag[]>(() => [
  { id: 'all', label: t('calendar.categories.all'), count: appointments.value.length },
  { id: 'confirmed', label: t('doctor.appointments.categories.confirmed'), count: appointments.value.filter(a => a.tags?.includes('CONFIRMED')).length },
  { id: 'pending', label: t('doctor.appointments.categories.pending'), count: appointments.value.filter(a => a.tags?.includes('PENDING')).length },
  { id: 'completed', label: t('doctor.appointments.categories.completed'), count: appointments.value.filter(a => a.tags?.includes('COMPLETED')).length },
  { id: 'cancelled', label: t('doctor.appointments.categories.cancelled'), count: appointments.value.filter(a => a.tags?.includes('CANCELLED')).length }
])

// Filtered and sorted appointments
const filteredAppointments = computed(() => {
  let filtered = appointments.value
  
  // Filter by tag
  if (selectedTag.value !== 'all') {
    filtered = filtered.filter(apt => 
      apt.tags?.some(tag => tag.toLowerCase() === selectedTag.value.toLowerCase())
    )
  }
  
  // Sort by proximity (closest appointments first)
  return filtered.sort((a, b) => {
    const dateA = parseDateForSorting(a.date, a.time)
    const dateB = parseDateForSorting(b.date, b.time)
    return dateA.getTime() - dateB.getTime()
  })
})

// Parse date and time for sorting
function parseDateForSorting(dateStr: string, timeStr?: string): Date {
  // Parse Italian date format (DD/MM/YYYY)
  const parts = dateStr.split('/').map(Number)
  const day = parts[0] || 1
  const month = parts[1] || 1
  const year = parts[2] || new Date().getFullYear()
  const date = new Date(year, month - 1, day)
  
  if (timeStr) {
    const timeParts = timeStr.split(':').map(Number)
    const hours = timeParts[0] || 0
    const minutes = timeParts[1] || 0
    date.setHours(hours, minutes)
  }
  
  return date
}

// Get badge colors for tags
function getBadgeColors(tag: string): BadgeColors {
  const normalizedTag = tag.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  const colorKey = TAG_COLOR_MAP[normalizedTag]

  if (colorKey) {
    return {
      color: `var(--badge-${colorKey})`,
      bgColor: `var(--badge-${colorKey}-bg)`,
      borderColor: `var(--badge-${colorKey}-border)`
    }
  }

  return {
    color: 'var(--text-primary)',
    bgColor: 'var(--bg-secondary-30)',
    borderColor: 'var(--border-color)'
  }
}

// Get badge icon for tags
function getBadgeIcon(tag: string): string {
  const normalizedTag = tag.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  return TAG_ICON_MAP[normalizedTag] || ''
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

// Load appointments
async function loadAppointments() {
  isLoading.value = true
  error.value = null
  
  try {
    // Try to fetch from API
    const fetchedAppointments = await appointmentsApi.getAppointmentsByDoctor(doctorId)
    appointments.value = fetchedAppointments
    
    // If no appointments from API, use mock data for development
    if (fetchedAppointments.length === 0) {
      console.warn('No appointments from API, using mock data')
      appointments.value = MOCK_APPOINTMENTS
    }
  } catch (err) {
    console.error('Error loading appointments:', err)
    error.value = t('doctor.appointments.errorLoading')
    
    // Fallback to mock data in case of error
    appointments.value = MOCK_APPOINTMENTS
  } finally {
    isLoading.value = false
  }
}

// Event handlers
function handleTagSelected(tagId: string) {
  selectedTag.value = tagId
}

function handleAppointmentClick(id: string) {
  selectedAppointmentId.value = id
  
  // Scroll to appointment if in list view on desktop
  if (viewMode.value === 'list' && window.innerWidth >= 768) {
    const element = document.getElementById(`appointment-${id}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }
}

function handleCalendarEventClick(appointmentId: string) {
  selectedAppointmentId.value = appointmentId
  
  // Scroll to appointment in the list if both are visible
  if (window.innerWidth >= 1024) {
    const element = document.getElementById(`appointment-${appointmentId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }
}

function handleEditAppointment(id: string) {
  console.log('Edit appointment:', id)
  // TODO: Implementare dialog di modifica
}

function handleCancelAppointment(id: string) {
  console.log('Cancel appointment:', id)
  // TODO: Implementare conferma e cancellazione
}

function handleDateSelect(dateRange: { start: string; end: string }) {
  console.log('Date range selected:', dateRange)
  // TODO: Implementare selezione data per creare nuovo appuntamento
}

// Load appointments on mount
onMounted(() => {
  loadAppointments()
})
</script>

<template>
  <div class="doctor-appointments-page">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <div>
          <h1 class="page-title">{{ $t('doctor.appointments.title') }}</h1>
          <p class="page-subtitle">{{ $t('doctor.appointments.subtitle') }}</p>
        </div>
        
        <!-- View Mode Toggle -->
        <div class="view-toggle">
          <button 
            class="view-toggle-btn"
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
            :title="$t('doctor.appointments.listView')"
          >
            <ListBulletIcon class="icon" />
            <span class="view-toggle-label">{{ $t('doctor.appointments.listView') }}</span>
          </button>
          <button 
            class="view-toggle-btn"
            :class="{ active: viewMode === 'calendar' }"
            @click="viewMode = 'calendar'"
            :title="$t('doctor.appointments.calendarView')"
          >
            <CalendarIcon class="icon" />
            <span class="view-toggle-label">{{ $t('doctor.appointments.calendarView') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Tag Bar -->
    <div class="tag-bar-container">
      <TagBar :tags="tags" @tag-selected="handleTagSelected" />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <p>{{ $t('common.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="loadAppointments">
        {{ $t('common.retry') }}
      </button>
    </div>

    <!-- Content Section -->
    <div v-else class="content-section">
      <!-- List View -->
      <div v-if="viewMode === 'list'" class="list-view">
        <div class="appointments-list-container">
          <h2 class="appointments-list-title">{{ $t('doctor.appointments.appointmentsList') }}</h2>
          
          <CardList v-if="filteredAppointments.length > 0" gap="sm">
            <BaseCard
              v-for="appointment in filteredAppointments"
              :key="appointment.id"
              :card-id="`appointment-${appointment.id}`"
              :title="appointment.title"
              :description="appointment.description"
              :icon="CalendarIcon"
              :metadata="getAppointmentMetadata(appointment)"
              :selected="selectedAppointmentId === appointment.id"
              @click="handleAppointmentClick(appointment.id)"
            >
              <template v-if="appointment.tags && appointment.tags.length > 0" #badges>
                <div class="badges-row">
                  <div 
                    v-for="tag in appointment.tags.slice(0, 2)" 
                    :key="tag" 
                    class="appointment-badge" 
                    :style="{
                      color: getBadgeColors(tag).color,
                      backgroundColor: getBadgeColors(tag).bgColor,
                      borderColor: getBadgeColors(tag).borderColor
                    }"
                  >
                    <span class="badge-icon">{{ getBadgeIcon(tag) }}</span>
                    <span class="badge-label">{{ tag }}</span>
                  </div>
                </div>
              </template>

              <template #actions>
                <button
                  class="action-button edit-button"
                  @click.stop="handleEditAppointment(appointment.id)"
                  :title="$t('appointments.editAppointment')"
                >
                  <PencilIcon class="icon-md" />
                  <span>{{ $t('appointments.editAppointment') }}</span>
                </button>
                <button
                  class="action-button cancel-button"
                  @click.stop="handleCancelAppointment(appointment.id)"
                  :title="$t('appointments.cancelAppointment')"
                >
                  <XCircleIcon class="icon-md" />
                  <span>{{ $t('appointments.cancelAppointment') }}</span>
                </button>
              </template>
            </BaseCard>
          </CardList>
          
          <div v-else class="empty-state">
            <p class="empty-state-text">{{ $t('doctor.appointments.noAppointments') }}</p>
          </div>
        </div>
      </div>

      <!-- Calendar View -->
      <div v-else-if="viewMode === 'calendar'" class="calendar-view">
        <div class="calendar-grid">
          <AppointmentsCalendar
            :appointments="filteredAppointments"
            :selected-appointment-id="selectedAppointmentId"
            @event-click="handleCalendarEventClick"
            @date-select="handleDateSelect"
          />
          
          <div class="appointments-list-container">
            <h2 class="appointments-list-title">{{ $t('doctor.appointments.appointmentsList') }}</h2>
            
            <CardList v-if="filteredAppointments.length > 0" gap="sm">
              <BaseCard
                v-for="appointment in filteredAppointments"
                :key="appointment.id"
                :card-id="`appointment-${appointment.id}`"
                :title="appointment.title"
                :description="appointment.description"
                :icon="CalendarIcon"
                :metadata="getAppointmentMetadata(appointment)"
                :selected="selectedAppointmentId === appointment.id"
                @click="handleAppointmentClick(appointment.id)"
              >
                <template v-if="appointment.tags && appointment.tags.length > 0" #badges>
                  <div class="badges-row">
                    <div 
                      v-for="tag in appointment.tags.slice(0, 2)" 
                      :key="tag" 
                      class="appointment-badge" 
                      :style="{
                        color: getBadgeColors(tag).color,
                        backgroundColor: getBadgeColors(tag).bgColor,
                        borderColor: getBadgeColors(tag).borderColor
                      }"
                    >
                      <span class="badge-icon">{{ getBadgeIcon(tag) }}</span>
                      <span class="badge-label">{{ tag }}</span>
                    </div>
                  </div>
                </template>

                <template #actions>
                  <button
                    class="action-button edit-button"
                    @click.stop="handleEditAppointment(appointment.id)"
                    :title="$t('appointments.editAppointment')"
                  >
                    <PencilIcon class="icon-md" />
                    <span>{{ $t('appointments.editAppointment') }}</span>
                  </button>
                  <button
                    class="action-button cancel-button"
                    @click.stop="handleCancelAppointment(appointment.id)"
                    :title="$t('appointments.cancelAppointment')"
                  >
                    <XCircleIcon class="icon-md" />
                    <span>{{ $t('appointments.cancelAppointment') }}</span>
                  </button>
                </template>
              </BaseCard>
            </CardList>
            
            <div v-else class="empty-state">
              <p class="empty-state-text">{{ $t('doctor.appointments.noAppointments') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.doctor-appointments-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 100vw;
  overflow-x: hidden;
  padding: 2rem;
  background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-mid) 50%, var(--bg-gradient-end) 100%);
  position: relative;
}

.doctor-appointments-page::before {
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

.view-toggle {
  display: flex;
  gap: 0.5rem;
  background: var(--white-20);
  backdrop-filter: blur(12px);
  border-radius: 1rem;
  padding: 0.25rem;
}

.view-toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: transparent;
  color: var(--gray-525252);
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  white-space: nowrap;
}

.view-toggle-btn:hover {
  background: var(--white-30);
  color: var(--gray-171717);
}

.view-toggle-btn.active {
  background: var(--white-80);
  color: var(--gray-171717);
  box-shadow: 0 2px 8px var(--black-8);
}

.view-toggle-label {
  display: inline;
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
  position: relative;
  z-index: 1;
  animation: fadeIn 0.5s cubic-bezier(0, 0, 0.2, 1);
  animation-delay: 0.2s;
  animation-fill-mode: both;
  margin-bottom: 2rem;
}

.list-view {
  width: 100%;
}

.calendar-view {
  width: 100%;
}

.calendar-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 3rem;
  background: var(--white-40);
  backdrop-filter: blur(20px);
  border: 1px solid var(--white-60);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px var(--black-8);
  position: relative;
  z-index: 1;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: var(--btn-secondary-bg);
  backdrop-filter: blur(12px);
  color: var(--btn-secondary-text);
  border: 1px solid var(--btn-secondary-border);
  border-radius: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px var(--btn-secondary-shadow);
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
  display: inline-block;
  vertical-align: middle;
}

.appointments-list-container {
  display: flex;
  flex-direction: column;
  background: var(--white-40);
  backdrop-filter: blur(20px);
  border: 1px solid var(--white-60);
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 8px 32px var(--black-8), inset 0 1px 0 var(--white-80);
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  width: 100%;
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

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.625rem;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  white-space: nowrap;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  width: 100%;
}

.edit-button {
  background: var(--white-60);
  border-color: var(--white-50);
  color: var(--text-primary);
  box-shadow: 0 2px 8px var(--shadow), inset 0 1px 0 var(--white-80);
}

.edit-button:hover {
  background: var(--white-80);
  border-color: var(--white-70);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow), inset 0 1px 0 var(--white-90);
}

.cancel-button {
  background: var(--white-50);
  border-color: var(--error-40);
  color: var(--error);
  box-shadow: 0 2px 8px var(--error-10), inset 0 1px 0 var(--white-60);
}

.cancel-button:hover {
  background: var(--white-70);
  border-color: var(--error-60);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--error-20), inset 0 1px 0 var(--white-80);
}

.icon-md {
  width: 1.25rem;
  height: 1.25rem;
  display: inline-block;
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
  .calendar-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .doctor-appointments-page {
    padding: 0.75rem;
  }

  .header-content {
    flex-direction: column;
    padding: 1rem 1.25rem;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .page-subtitle {
    font-size: 0.875rem;
  }

  .view-toggle {
    width: 100%;
  }

  .view-toggle-btn {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .view-toggle-label {
    display: none;
  }

  .view-toggle-btn {
    padding: 0.625rem;
  }
  
  .appointments-list-title {
    font-size: 1.125rem;
  }
}

@media (max-width: 640px) {
  .action-button span {
    display: none;
  }
  
  .action-button {
    padding: 0.5rem;
    justify-content: center;
    min-width: 2rem;
  }
}
</style>
