<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CalendarOptions, EventClickArg, DateSelectArg } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import TagBar from '../../components/shared/TagBar.vue'
import type { Tag } from '../../types/tag'
import AppointmentCard from '../../components/shared/AppointmentCard.vue'
import CardList from '../../components/shared/CardList.vue'
import type { Appointment } from '../../types/appointment'
import { MOCK_APPOINTMENTS } from '../../constants/mockData'
import { useI18n } from 'vue-i18n'
import { parseItalianDate, formatDateToISO } from '../../utils/dateUtils'

const { t } = useI18n()

const appointments = ref<Appointment[]>(MOCK_APPOINTMENTS)

const tags = computed<Tag[]>(() => [
  { id: 'all', label: t('calendar.categories.all'), count: appointments.value.length },
  { id: 'cardiologia', label: t('calendar.categories.cardiologia'), count: appointments.value.filter(a => a.tags?.includes('Cardiologia')).length },
  { id: 'analisi', label: t('calendar.categories.analisi'), count: appointments.value.filter(a => a.tags?.includes('Analisi')).length },
  { id: 'pediatria', label: t('calendar.categories.pediatria'), count: appointments.value.filter(a => a.tags?.includes('Pediatria')).length }
])

const selectedTag = ref('all')
const selectedAppointmentId = ref<string | null>(null)

const calendarEvents = computed(() => {
  const appointmentsByDate = new Map<string, Appointment[]>()
  
  appointments.value.forEach(apt => {
    const dateKey = parseDateToISO(apt.date)
    if (!appointmentsByDate.has(dateKey)) {
      appointmentsByDate.set(dateKey, [])
    }
    appointmentsByDate.get(dateKey)?.push(apt)
  })
  
  const events: any[] = []
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--blue-3b82f6').trim() || getComputedStyle(document.documentElement).getPropertyValue('--blue-3b82f6')
  const selectedColor = getComputedStyle(document.documentElement).getPropertyValue('--gray-171717').trim() || getComputedStyle(document.documentElement).getPropertyValue('--black')
  
  appointmentsByDate.forEach((apts, date) => {
    apts.forEach((apt, index) => {
      if (index < 3) {
        events.push({
          id: apt.id,
          start: date,
          allDay: true,
          display: 'block',
          title: '●',
          classNames: selectedAppointmentId.value === apt.id ? ['appointment-dot', 'selected'] : ['appointment-dot'],
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: selectedAppointmentId.value === apt.id ? selectedColor : primaryColor
        })
      }
    })
    
    if (apts.length > 3) {
      events.push({
        id: `more-${date}`,
        start: date,
        allDay: true,
        display: 'block',
        title: `+${apts.length - 3}`,
        classNames: ['appointment-dot-more'],
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        textColor: primaryColor
      })
    }
  })
  
  return events
})

const calendarOptions = ref<CalendarOptions>({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  locale: 'it',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,dayGridWeek'
  },
  events: calendarEvents.value,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: false,
  weekends: true,
  eventClick: handleEventClick,
  select: handleDateSelect,
  height: 'auto',
  eventDisplay: 'block'
})

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

function handleEventClick(clickInfo: EventClickArg) {
  selectedAppointmentId.value = clickInfo.event.id
  
  if (window.innerWidth >= 768) {
    const element = document.getElementById(`appointment-${clickInfo.event.id}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }
}

function handleDateSelect(selectInfo: DateSelectArg) {
  console.log('Selected date range:', selectInfo.startStr, 'to', selectInfo.endStr)
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

function parseDateToISO(dateString: string): string {
  const date = parseItalianDate(dateString)
  if (date) {
    return formatDateToISO(date)
  }
  // fallback: today
  return formatDateToISO(new Date())
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
        <FullCalendar :options="{ ...calendarOptions, events: calendarEvents }" />
      </div>

      <!-- Appointments List -->
      <div class="appointments-container">
        <h2 class="appointments-title">{{ $t('calendar.appointments') }}</h2>
        <CardList gap="sm">
          <AppointmentCard
            v-for="appointment in filteredAppointments"
            :id="`appointment-${appointment.id}`"
            :key="appointment.id"
            :appointment="appointment"
            :selected="selectedAppointmentId === appointment.id"
            @click="handleAppointmentClick"
            @edit="handleEditAppointment"
            @cancel="handleCancelAppointment"
          />
          
          <div v-if="filteredAppointments.length === 0" class="empty-state">
            <p class="empty-state-text">{{ $t('calendar.noAppointments') }}</p>
          </div>
        </CardList>
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
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 2px solid var(--border-color);
  box-shadow: 0 0.5rem 1.875rem var(--black-8);
}

.appointments-container {
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

.appointments-container:hover {
  box-shadow: 0 12px 40px var(--black-12), inset 0 1px 0 var(--white-90);
}

.appointments-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-171717);
  margin-bottom: 1rem;
  line-height: 1.25;
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
}

/* FullCalendar customization */
:deep(.fc) {
  font-family: inherit;
}

:deep(.fc-button) {
  background-color: var(--fc-button-bg) !important;
  border-color: var(--fc-button-bg) !important;
  text-transform: capitalize;
}

:deep(.fc-button:hover) {
  background-color: var(--fc-button-hover-bg) !important;
}

:deep(.fc-button-active) {
  background-color: var(--fc-button-hover-bg) !important;
}

:deep(.fc-daygrid-day-number) {
  color: var(--fc-day-number);
  font-weight: 500;
}

:deep(.fc-col-header-cell-cushion) {
  color: var(--fc-header-text);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
}

:deep(.fc-event) {
  cursor: pointer;
}

:deep(.fc-daygrid-day.fc-day-today) {
  background-color: var(--fc-today-bg) !important;
}

/* Header sticky per i giorni della settimana */
:deep(.fc-col-header) {
  position: sticky !important;
  top: 0 !important;
  z-index: 2 !important;
  background: white !important;
}

:deep(.fc-scrollgrid-sync-table) {
  position: relative !important;
}

/* Nascondi gli eventi di default per mostrare solo i pallini */
:deep(.fc-event.appointment-indicator) {
  display: none !important;
}

/* Stili per i pallini degli appuntamenti */
:deep(.fc-daygrid-day-frame) {
  position: relative;
}

:deep(.fc-event.appointment-dot) {
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
  margin: 0 2px !important;
  font-size: 1rem;
}

:deep(.fc-event.appointment-dot .fc-event-main) {
  padding: 0 !important;
}

:deep(.fc-event.appointment-dot .fc-event-title) {
  font-size: 0.625rem;
  line-height: 1;
}

:deep(.fc-event.appointment-dot.selected .fc-event-title) {
  font-size: 0.75rem;
  font-weight: bold;
}

:deep(.fc-event.appointment-dot-more) {
  border: none !important;
  background: transparent !important;
  padding: 0 !important;
  margin: 0 2px !important;
}

:deep(.fc-event.appointment-dot-more .fc-event-main) {
  padding: 0 !important;
}

:deep(.fc-event.appointment-dot-more .fc-event-title) {
  font-size: 0.625rem;
  font-weight: 700;
  line-height: 1;
}

/* Centra gli eventi nella cella */
:deep(.fc-daygrid-day-events) {
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: unset;
}

:deep(.fc-daygrid-event-harness) {
  position: relative !important;
  margin: 0 !important;
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
  .content-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .content-section {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .calendar-container,
  .appointments-container {
    padding: 1rem;
  }
  .appointments-title {
    font-size: 1.125rem;
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

  .calendar-container {
    padding: 1rem;
  }

  .appointments-title {
    font-size: 1.25rem;
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
  
  .calendar-container {
    padding: 0.5rem;
  }
  
  .appointments-container {
    padding: 0.5rem;
  }
}
</style>
