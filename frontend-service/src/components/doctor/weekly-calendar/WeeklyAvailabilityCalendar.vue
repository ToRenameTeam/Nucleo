<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  PencilSquareIcon, 
  XMarkIcon,
  CalendarDaysIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'
import type { AvailabilityDisplay } from '../../../types/availability'
import {
  formatHour,
  formatTime as formatTimeUtil,
  getWeekRangeLabel,
  generateWeekDays,
  generateHoursArray,
  getAvailabilitiesForSlot,
  hasAvailability,
  getAvailabilityStyle
} from './calendarUtils'

interface Props {
  availabilities: AvailabilityDisplay[]
  currentWeekStart: Date
  startHour?: number
  endHour?: number
}

const props = withDefaults(defineProps<Props>(), {
  startHour: 8,
  endHour: 18
})

const emit = defineEmits<{
  previousWeek: []
  nextWeek: []
  todayWeek: []
  editAvailability: [availability: AvailabilityDisplay]
  deleteAvailability: [availability: AvailabilityDisplay]
  slotClick: [date: Date, hour: number]
}>()

const { t, locale } = useI18n()

const weekDays = computed(() => {
  return generateWeekDays(props.currentWeekStart, locale.value)
})

const hours = computed(() => {
  return generateHoursArray(props.startHour, props.endHour)
})

const weekRangeLabel = computed(() => {
  return getWeekRangeLabel(props.currentWeekStart, locale.value)
})

// Handle slot click for creating new availability
function handleSlotClick(dayDate: Date, hour: number) {
  const slotDate = new Date(dayDate)
  slotDate.setHours(hour, 0, 0, 0)
  emit('slotClick', slotDate, hour)
}

function handleEdit(event: Event, availability: AvailabilityDisplay) {
  event.stopPropagation()
  emit('editAvailability', availability)
}

function handleDelete(event: Event, availability: AvailabilityDisplay) {
  event.stopPropagation()
  emit('deleteAvailability', availability)
}

function formatTime(date: Date): string {
  return formatTimeUtil(date, locale.value)
}
</script>

<template>
  <div class="weekly-calendar">
    <!-- Calendar Header -->
    <div class="calendar-header">
      <div class="week-navigation">
        <button 
          class="nav-btn"
          @click="emit('previousWeek')"
          :title="t('doctor.availabilities.calendar.previousWeek')"
        >
          <ChevronLeftIcon class="nav-icon" />
        </button>
        
        <button 
          class="today-btn"
          @click="emit('todayWeek')"
        >
          <CalendarDaysIcon class="today-icon" />
          {{ t('doctor.availabilities.calendar.today') }}
        </button>
        
        <button 
          class="nav-btn"
          @click="emit('nextWeek')"
          :title="t('doctor.availabilities.calendar.nextWeek')"
        >
          <ChevronRightIcon class="nav-icon" />
        </button>
      </div>
      
      <h3 class="week-range">{{ weekRangeLabel }}</h3>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid">
      <!-- Time Column -->
      <div class="time-column">
        <div class="time-header"></div>
        <div 
          v-for="hour in hours" 
          :key="hour" 
          class="time-cell"
        >
          <span class="time-label">{{ formatHour(hour) }}</span>
        </div>
      </div>

      <!-- Days Columns -->
      <div 
        v-for="day in weekDays" 
        :key="day.date.toISOString()" 
        class="day-column"
      >
        <div 
          class="day-header"
          :class="{ 'is-today': day.isToday }"
        >
          {{ day.label }}
        </div>
        
        <!-- Hour Slots -->
        <div 
          v-for="hour in hours" 
          :key="hour" 
          class="hour-slot"
          :class="{ 'has-availability': hasAvailability(props.availabilities, day.date, hour) }"
          @click="handleSlotClick(day.date, hour)"
        >
          <!-- Availability Blocks -->
          <div 
            v-for="availability in getAvailabilitiesForSlot(props.availabilities, day.date, hour)"
            :key="availability.id"
            class="availability-block"
            :class="{ 
              'is-booked': availability.isBooked,
              'is-available': !availability.isBooked
            }"
            :style="getAvailabilityStyle(availability)"
            @click.stop
          >
            <div class="availability-content">
              <div class="availability-info">
                <span class="availability-time">
                  {{ formatTime(availability.startDateTime) }} - {{ formatTime(availability.endDateTime) }}
                </span>
              </div>
              
              <div class="availability-actions">
                <!-- Status indicator for booked -->
                <div v-if="availability.isBooked" class="booked-indicator">
                  <CheckCircleIcon class="booked-icon" />
                </div>
                
                <!-- Edit button (only for non-booked) -->
                <button 
                  v-if="!availability.isBooked"
                  class="action-btn edit-btn"
                  @click="handleEdit($event, availability)"
                  :title="t('doctor.availabilities.actions.edit')"
                >
                  <PencilSquareIcon class="action-icon" />
                </button>
                
                <!-- Delete button (only for non-booked) -->
                <button 
                  v-if="!availability.isBooked"
                  class="action-btn delete-btn"
                  @click="handleDelete($event, availability)"
                  :title="t('doctor.availabilities.actions.delete')"
                >
                  <XMarkIcon class="action-icon" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="calendar-legend">
      <div class="legend-item">
        <span class="legend-color available"></span>
        <span class="legend-label">{{ t('doctor.availabilities.legend.available') }}</span>
      </div>
      <div class="legend-item">
        <span class="legend-color booked"></span>
        <span class="legend-label">{{ t('doctor.availabilities.legend.booked') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.weekly-calendar {
  display: flex;
  flex-direction: column;
  background: var(--white-40);
  backdrop-filter: blur(20px);
  border: 1px solid var(--white-60);
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 8px 32px var(--black-8), inset 0 1px 0 var(--white-80);
  overflow: hidden;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--white-30);
}

.week-navigation {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: var(--white-30);
  backdrop-filter: blur(12px);
  border: 1px solid var(--white-40);
  border-radius: 0.75rem;
  color: var(--gray-525252);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
}

.nav-btn:hover {
  background: var(--white-50);
  color: var(--gray-171717);
  transform: translateY(-1px);
}

.nav-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.today-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--accent-primary-15);
  backdrop-filter: blur(12px);
  border: 1px solid var(--accent-primary-30);
  border-radius: 0.75rem;
  color: var(--accent-primary);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
}

.today-btn:hover {
  background: var(--accent-primary-25);
  transform: translateY(-1px);
}

.today-icon {
  width: 1rem;
  height: 1rem;
}

.week-range {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-171717);
  margin: 0;
}

.calendar-grid {
  display: flex;
  gap: 0;
  overflow-x: auto;
  border: 1px solid var(--white-40);
  border-radius: 1rem;
  background: var(--white-20);
}

.time-column {
  flex-shrink: 0;
  width: 4rem;
  border-right: 1px solid var(--white-40);
}

.time-header {
  height: 3rem;
  border-bottom: 1px solid var(--white-40);
}

.time-cell {
  height: 4rem;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 0.25rem;
  border-bottom: 1px solid var(--white-20);
}

.time-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-525252);
}

.day-column {
  flex: 1;
  min-width: 8rem;
  border-right: 1px solid var(--white-30);
}

.day-column:last-child {
  border-right: none;
}

.day-header {
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-525252);
  background: var(--white-30);
  border-bottom: 1px solid var(--white-40);
  text-transform: capitalize;
}

.day-header.is-today {
  background: var(--accent-primary-20);
  color: var(--accent-primary);
}

.hour-slot {
  position: relative;
  height: 4rem;
  border-bottom: 1px solid var(--white-20);
  cursor: pointer;
  transition: background 0.15s ease;
}

.hour-slot:hover {
  background: var(--accent-primary-8);
}

.hour-slot.has-availability {
  cursor: default;
}

.availability-block {
  position: absolute;
  left: 2px;
  right: 2px;
  border-radius: 0.5rem;
  padding: 0.375rem 0.5rem;
  overflow: hidden;
  z-index: 1;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
}

.availability-block.is-available {
  background: var(--success-20);
  border: 1px solid var(--success-40);
}

.availability-block.is-available:hover {
  background: var(--success-30);
  box-shadow: 0 2px 8px var(--black-10);
}

.availability-block.is-booked {
  background: var(--accent-primary-20);
  border: 1px solid var(--accent-primary-30);
}

.availability-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  gap: 0.25rem;
}

.availability-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
  flex: 1;
}

.availability-time {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--gray-171717);
  white-space: nowrap;
}

.availability-actions {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  flex-shrink: 0;
}

.booked-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
}

.booked-icon {
  width: 1rem;
  height: 1rem;
  color: var(--accent-primary);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
}

.action-btn:hover {
  transform: translateY(-2px);
}

.action-btn.edit-btn {
  background: rgba(245, 158, 11, 0.8);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3),
              0 2px 4px rgba(0, 0, 0, 0.1),
              inset 0 1px 1px rgba(255, 255, 255, 0.25),
              inset 0 -1px 1px rgba(0, 0, 0, 0.05);
}

.action-btn.edit-btn:hover {
  background: rgba(217, 119, 6, 0.85);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 6px 24px rgba(245, 158, 11, 0.4),
              0 3px 8px rgba(0, 0, 0, 0.15),
              inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.action-btn.delete-btn {
  background: rgba(239, 68, 68, 0.8);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3),
              0 2px 4px rgba(0, 0, 0, 0.1),
              inset 0 1px 1px rgba(255, 255, 255, 0.25),
              inset 0 -1px 1px rgba(0, 0, 0, 0.05);
}

.action-btn.delete-btn:hover {
  background: rgba(220, 38, 38, 0.85);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 6px 24px rgba(239, 68, 68, 0.4),
              0 3px 8px rgba(0, 0, 0, 0.15),
              inset 0 1px 1px rgba(255, 255, 255, 0.3);
}

.action-icon {
  width: 0.875rem;
  height: 0.875rem;
}

.edit-btn .action-icon {
  color: #ffffff;
}

.delete-btn .action-icon {
  color: #ffffff;
}

.calendar-legend {
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--white-30);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-color {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
}

.legend-color.available {
  background: var(--success-30);
  border: 1px solid var(--success-40);
}

.legend-color.booked {
  background: var(--accent-primary-30);
  border: 1px solid var(--accent-primary-40);
}

.legend-label {
  font-size: 0.875rem;
  color: var(--gray-525252);
}

/* Responsive */
@media (max-width: 768px) {
  .weekly-calendar {
    padding: 1rem;
  }

  .calendar-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .week-range {
    font-size: 1rem;
  }

  .day-column {
    min-width: 6rem;
  }

  .day-header {
    font-size: 0.75rem;
  }

  .hour-slot {
    height: 3.5rem;
  }

  .time-cell {
    height: 3.5rem;
  }
}
</style>
