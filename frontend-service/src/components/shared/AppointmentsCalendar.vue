<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { CalendarOptions, EventClickArg, DateSelectArg } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { Appointment } from '../../types/appointment'
import { parseItalianDate, parseItalianDateSlash, formatDateToISO } from '../../utils/dateUtils'

interface Props {
  /** Appointments to display on calendar */
  appointments: Appointment[]
  /** ID of the currently selected appointment */
  selectedAppointmentId?: string | null
  /** Whether date selection is enabled */
  selectable?: boolean
  /** Whether to show week view option */
  showWeekView?: boolean
  /** Custom header toolbar configuration */
  headerToolbar?: {
    left?: string
    center?: string
    right?: string
  }
  /** Calendar locale */
  locale?: string
  /** Calendar height */
  height?: string | number
  /** Max dots to show per day before showing "+N" */
  maxDotsPerDay?: number
  /** Color for appointment dots */
  dotColor?: string
  /** Color for selected appointment dot */
  selectedDotColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  selectedAppointmentId: null,
  selectable: true,
  showWeekView: true,
  locale: 'it',
  height: 'auto',
  maxDotsPerDay: 3,
  dotColor: 'var(--blue-3b82f6)',
  selectedDotColor: 'var(--gray-171717)'
})

const emit = defineEmits<{
  eventClick: [appointmentId: string]
  dateSelect: [dateRange: { start: string; end: string }]
}>()

function parseDateToISO(dateString: string): string {
  // Try parsing with slash format first (dd/mm/yyyy or d/m/yyyy)
  let date = parseItalianDateSlash(dateString)
  
  // If slash format fails, try Italian format (dd Mese yyyy)
  if (!date) {
    date = parseItalianDate(dateString)
  }
  
  // If all parsing fails, use current date
  return date ? formatDateToISO(date) : formatDateToISO(new Date())
}

const calendarEvents = computed(() => {
  const appointmentsByDate = new Map<string, Appointment[]>()
  
  props.appointments.forEach(apt => {
    const dateKey = parseDateToISO(apt.date)
    if (!appointmentsByDate.has(dateKey)) {
      appointmentsByDate.set(dateKey, [])
    }
    appointmentsByDate.get(dateKey)?.push(apt)
  })
  
  const events: any[] = []
  
  appointmentsByDate.forEach((apts, date) => {
    apts.forEach((apt, index) => {
      if (index < props.maxDotsPerDay) {
        events.push({
          id: apt.id,
          start: date,
          allDay: true,
          display: 'block',
          title: '●',
          classNames: props.selectedAppointmentId === apt.id ? ['appointment-dot', 'selected'] : ['appointment-dot'],
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: props.selectedAppointmentId === apt.id ? props.selectedDotColor : props.dotColor
        })
      }
    })
    
    if (apts.length > props.maxDotsPerDay) {
      events.push({
        id: `more-${date}`,
        start: date,
        allDay: true,
        display: 'block',
        title: `+${apts.length - props.maxDotsPerDay}`,
        classNames: ['appointment-dot-more'],
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        textColor: props.dotColor
      })
    }
  })
  
  return events
})

const calendarOptions = ref<CalendarOptions>({
  plugins: [dayGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  locale: props.locale,
  headerToolbar: props.headerToolbar || {
    left: 'prev,next today',
    center: 'title',
    right: props.showWeekView ? 'dayGridMonth,dayGridWeek' : 'dayGridMonth'
  },
  events: calendarEvents.value,
  selectable: props.selectable,
  selectMirror: true,
  dayMaxEvents: false,
  weekends: true,
  eventClick: handleEventClick,
  select: handleDateSelect,
  height: props.height,
  eventDisplay: 'block'
})

function handleEventClick(clickInfo: EventClickArg) {
  if (!clickInfo.event.id.startsWith('more-')) {
    emit('eventClick', clickInfo.event.id)
  }
}

function handleDateSelect(selectInfo: DateSelectArg) {
  emit('dateSelect', {
    start: selectInfo.startStr,
    end: selectInfo.endStr
  })
}

// Watch for changes in appointments to update calendar events
watch(() => props.appointments, () => {
  calendarOptions.value = {
    ...calendarOptions.value,
    events: calendarEvents.value
  }
}, { deep: true })
</script>

<template>
  <div class="appointments-calendar">
    <FullCalendar :options="{ ...calendarOptions, events: calendarEvents }" />
  </div>
</template>

<style scoped>
.appointments-calendar {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 2px solid var(--border-color);
  box-shadow: 0 0.5rem 1.875rem var(--black-8);
  width: 100%;
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

:deep(.fc-col-header) {
  position: sticky !important;
  top: 0 !important;
  z-index: 2 !important;
  background: white !important;
}

:deep(.fc-scrollgrid-sync-table) {
  position: relative !important;
}

:deep(.fc-event.appointment-indicator) {
  display: none !important;
}

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

@media (max-width: 768px) {
  .appointments-calendar {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .appointments-calendar {
    padding: 0.5rem;
  }
}
</style>
