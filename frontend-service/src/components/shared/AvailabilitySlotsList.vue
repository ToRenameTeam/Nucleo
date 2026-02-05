<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CalendarIcon, ClockIcon } from '@heroicons/vue/24/outline'
import type { AvailabilityDisplay } from '../../types/availability'
import { formatDateSlash, formatTime, formatDayName, parseItalianDateSlash } from '../../utils/dateUtils'

interface Props {
  availabilities: AvailabilityDisplay[]
  selectedAvailabilityId?: string | null
  emptyMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  selectedAvailabilityId: null,
  emptyMessage: undefined
})

const emit = defineEmits<{
  selectAvailability: [availabilityId: string]
}>()

const { t } = useI18n()

// Group availabilities by date
const availableDates = computed(() => {
  const dateMap = new Map<string, AvailabilityDisplay[]>()
  
  props.availabilities
    .filter(a => a.status === 'AVAILABLE' && !a.isBooked)
    .forEach(availability => {
      const dateKey = formatDateSlash(availability.startDateTime)
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, [])
      }
      dateMap.get(dateKey)!.push(availability)
    })
  
  return Array.from(dateMap.entries())
    .map(([date, slots]) => ({
      date,
      slots: slots.sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime())
    }))
    .sort((a, b) => {
      const dateA = parseItalianDateSlash(a.date)
      const dateB = parseItalianDateSlash(b.date)
      if (!dateA || !dateB) return 0
      return dateA.getTime() - dateB.getTime()
    })
})

function selectAvailability(availabilityId: string) {
  emit('selectAvailability', availabilityId)
}
</script>

<template>
  <div class="availabilities-section">
    <div v-if="availableDates.length === 0" class="empty-state">
      <p>{{ emptyMessage || t('doctor.appointments.reschedule.noAvailabilities') }}</p>
    </div>

    <div v-else class="dates-list">
      <div
        v-for="dateGroup in availableDates"
        :key="dateGroup.date"
        class="date-group"
      >
        <div class="date-header">
          <CalendarIcon class="date-icon" />
          <div>
            <p class="date-day">{{ formatDayName(dateGroup.date) }}</p>
            <p class="date-text">{{ dateGroup.date }}</p>
          </div>
        </div>

        <div class="time-slots">
          <button
            v-for="slot in dateGroup.slots"
            :key="slot.id"
            class="time-slot"
            :class="{ selected: selectedAvailabilityId === slot.id }"
            @click="selectAvailability(slot.id)"
          >
            <ClockIcon class="slot-icon" />
            <div class="slot-content">
              <span class="slot-time">{{ formatTime(slot.startDateTime) }}</span>
              <span class="slot-facility">{{ slot.facilityName }}</span>
              <span class="slot-service">{{ slot.serviceTypeName }}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.availabilities-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-state {
  padding: 3rem;
  text-align: center;
  background: var(--white-15);
  border: 1px solid var(--white-20);
  border-radius: 1rem;
  color: var(--gray-525252);
}

.dates-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.date-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.date-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--white-30);
}

.date-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--sky-0ea5e9);
}

.date-day {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-171717);
  margin: 0;
}

.date-text {
  font-size: 0.8125rem;
  color: var(--gray-525252);
  margin: 0;
}

.time-slots {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.75rem;
}

.time-slot {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--white-20);
  backdrop-filter: blur(12px);
  border: 1.5px solid var(--white-30);
  border-radius: 0.875rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  text-align: left;
}

.time-slot:hover {
  background: var(--white-30);
  border-color: var(--sky-0ea5e9);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--black-8);
}

.time-slot.selected {
  background: var(--sky-0ea5e9-20);
  border-color: var(--sky-0ea5e9);
  box-shadow: 0 4px 16px var(--sky-0ea5e9-30);
}

.slot-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--sky-0ea5e9);
  flex-shrink: 0;
}

.slot-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.slot-time {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-171717);
}

.slot-facility {
  font-size: 0.8125rem;
  color: var(--gray-525252);
}

.slot-service {
  font-size: 0.75rem;
  color: var(--gray-737373);
}
</style>
