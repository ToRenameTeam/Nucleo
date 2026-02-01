<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '../../composables/useAuth'
import TagBar from '../../components/shared/TagBar.vue'
import type { Tag } from '../../types/tag'
import AppointmentsCalendar from '../../components/shared/AppointmentsCalendar.vue'
import BaseCard from '../../components/shared/BaseCard.vue'
import CardList from '../../components/shared/CardList.vue'
import type { Appointment } from '../../types/appointment'
import type { CardMetadata, CardAction } from '../../types/shared'
import { PlusIcon, CalendarIcon, ClockIcon, UserIcon, MapPinIcon, PencilIcon, XCircleIcon } from '@heroicons/vue/24/outline'
import { MOCK_APPOINTMENTS, TAG_COLOR_MAP, TAG_ICON_MAP } from '../../constants/mockData'
import { useI18n } from 'vue-i18n'
import type { BadgeColors } from '../../types/document'

const { t } = useI18n()

const { currentUser } = useAuth()

// TODO: Replace MOCK_APPOINTMENTS with real data from API
const appointments = computed<Appointment[]>(() => {
  if (!currentUser.value?.fiscalCode) return []
  return MOCK_APPOINTMENTS.filter(a => a.fiscalCode === currentUser.value?.fiscalCode)
})

const tags = computed<Tag[]>(() => [
  { id: 'all', label: t('calendar.categories.all'), count: appointments.value.length },
  { id: 'cardiologia', label: t('calendar.categories.cardiologia'), count: appointments.value.filter(a => a.tags?.includes('Cardiologia')).length },
  { id: 'analisi', label: t('calendar.categories.analisi'), count: appointments.value.filter(a => a.tags?.includes('Analisi')).length },
  { id: 'pediatria', label: t('calendar.categories.pediatria'), count: appointments.value.filter(a => a.tags?.includes('Pediatria')).length }
])

const selectedTag = ref('all')
const selectedAppointmentId = ref<string | null>(null)

const filteredAppointments = computed(() => {
  if (selectedTag.value === 'all') {
    return appointments.value
  }
  return appointments.value.filter(apt => 
    apt.tags?.some(tag => tag.toLowerCase() === selectedTag.value.toLowerCase())
  )
})

function handleTagSelected(tagId: string) {
  selectedTag.value = tagId
}

function handleCalendarEventClick(appointmentId: string) {
  selectedAppointmentId.value = appointmentId
  
  if (window.innerWidth >= 768) {
    const element = document.getElementById(`appointment-${appointmentId}`)
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

function handleEditAppointment(id: string) {
  console.log('Modifica appuntamento:', id)
  // Implementare apertura dialog per modifica appuntamento
}

function handleCancelAppointment(id: string) {
  console.log('Disdici appuntamento:', id)
  // Implementare conferma e cancellazione appuntamento
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
          :appointments="appointments"
          :selected-appointment-id="selectedAppointmentId"
          @event-click="handleCalendarEventClick"
          @date-select="handleDateSelect"
        />
      </div>

      <!-- Appointments List -->
      <div class="appointments-list-container">
        <h2 class="appointments-list-title">{{ $t('calendar.appointments') }}</h2>
        
        <CardList v-if="filteredAppointments.length > 0" gap="sm">
          <BaseCard
            v-for="appointment in filteredAppointments"
            :key="appointment.id"
            :card-id="appointment.id"
            :title="appointment.title"
            :description="appointment.description"
            :icon="CalendarIcon"
            :metadata="getAppointmentMetadata(appointment)"
            :actions="getAppointmentActions()"
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
          </BaseCard>
        </CardList>
        
        <div v-else class="empty-state">
          <p class="empty-state-text">{{ $t('calendar.noAppointments') }}</p>
        </div>
      </div>
    </div>
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