<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import LoadingSpinner from '../../shared/LoadingSpinner.vue'
import type { DateSelector } from '../../../types/appointment'

const props = withDefaults(defineProps<DateSelector>(), {
  disabled: false,
  loading: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'select': [date: string]
}>()

const dateOffset = ref(0)
const customStartDate = ref<string>(new Date().toISOString().split('T')[0] ?? '')

// Generate available dates starting from tomorrow (or a custom date)
const availableDates = computed(() => {
  const dates: Array<{ value: string; label: string }> = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Start date: tomorrow or custom date
  let startDate: Date
  if (customStartDate.value) {
    startDate = new Date(customStartDate.value)
    startDate.setHours(0, 0, 0, 0)
  } else {
    startDate = new Date(today)
    startDate.setDate(today.getDate() + 1)
  }

  let daysAdded = 0
  let currentOffset = dateOffset.value * 10 // 10 dates per page
  let seed = 1000 + currentOffset // Seed for consistent pseudo-randomness

  for (let i = currentOffset; daysAdded < 10 && i < currentOffset + 30; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const dayOfWeek = date.getDay()
    // Always skip Sunday
    if (dayOfWeek === 0) continue
    // Generate pseudo-random number for this day
    seed = (seed * 9301 + 49297) % 233280
    const random = seed / 233280
    // Inclusion logic:
    // - Saturday: 10% chance
    // - Weekdays: 90% chance
    let includeDate = false
    if (dayOfWeek === 6) {
      includeDate = random < 0.1
    } else {
      includeDate = random < 0.9
    }
    if (includeDate) {
      const isoDate = date.toISOString().split('T')[0]
      if (isoDate) {
        dates.push({
          value: isoDate,
          label: date.toLocaleDateString('it-IT', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })
        })
        daysAdded++
      }
    }
  }
  return dates
})

const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

const handleDateSelect = (date: string) => {
  emit('update:modelValue', date)
  emit('select', date)
}

const loadMoreDates = () => {
  dateOffset.value++
}

const loadPreviousDates = () => {
  if (dateOffset.value > 0) {
    dateOffset.value--
  }
}

const handleCustomDateChange = () => {
  // Reset offset when custom date changes
  dateOffset.value = 0
}

// Reset offset when the component is disabled
watch(() => props.disabled, (newDisabled) => {
  if (newDisabled) {
    dateOffset.value = 0
    customStartDate.value = new Date().toISOString().split('T')[0]!
  }
})
</script>

<template>
  <div class="date-selector" :class="{ 'section-disabled': disabled }">
    <h3 class="section-title">{{ $t('appointmentBooking.selectDate') }}</h3>

    <!-- Loading state -->
    <LoadingSpinner
      v-if="loading"
      size="small"
      :message="$t('appointmentBooking.loadingAvailability')"
      inline
    />

    <!-- Date grid -->
    <div v-else-if="!disabled">
      <!-- Custom date picker -->
      <div class="custom-date-picker">
        <label class="date-picker-label">{{ $t('appointmentBooking.customDateLabel') }}</label>
        <input
          v-model="customStartDate"
          type="date"
          class="date-picker-input"
          :min="minDate"
          max="9999-12-31"
          @change="handleCustomDateChange"
          @keydown.prevent
        />
      </div>

      <div class="dates-grid">
        <button
          v-for="date in availableDates"
          :key="date.value"
          class="date-card"
          :class="{ 'date-selected': modelValue === date.value }"
          @click="handleDateSelect(date.value)"
        >
          <span class="date-label">{{ date.label }}</span>
        </button>
      </div>

      <div class="date-navigation">
        <button
          v-if="dateOffset > 0"
          class="load-more-button"
          @click="loadPreviousDates"
        >
          {{ $t('appointmentBooking.loadPreviousDates') }}
        </button>
        <button
          class="load-more-button"
          @click="loadMoreDates"
        >
          {{ $t('appointmentBooking.loadMoreDates') }}
        </button>
      </div>
    </div>

    <!-- Placeholder when disabled -->
    <div v-else class="placeholder-message">
      <p>{{ $t('appointmentBooking.selectVisit') }}</p>
    </div>
  </div>
</template>

<style scoped>
.date-selector {
  margin-bottom: 2rem;
}

.section-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.placeholder-message {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
  background: var(--bg-secondary-40);
  border-radius: 12px;
  border: 1px dashed var(--border-color);
}

.custom-date-picker {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--white-30);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid var(--white-40);
}

.date-picker-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.date-picker-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--white-60);
  backdrop-filter: blur(15px);
  border: 1px solid var(--white-50);
  border-radius: 8px;
  font-size: 0.9375rem;
  color: var(--text-primary);
  transition: all 0.2s ease;
  cursor: pointer;
}

.date-picker-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
}

.date-picker-input:hover {
  background: var(--white-70);
  border-color: var(--accent-primary-50);
}

.date-picker-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-primary-10);
}

/* Dates Grid */
.dates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  gap: 0.75rem;
}

.date-card {
  position: relative;
  background: var(--white-30);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 2px solid var(--white-50);
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  box-shadow: 0 2px 8px var(--black-6), inset 0 1px 0 var(--white-60);
}

.date-card:hover {
  background: var(--white-40);
  border-color: var(--accent-primary-40);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--shadow), inset 0 1px 0 var(--white-70);
}

.date-selected {
  background: linear-gradient(135deg, var(--accent-primary-15) 0%, var(--accent-secondary-15) 100%);
  border-color: var(--accent-primary-70);
  box-shadow: 0 4px 20px var(--accent-primary-30), inset 0 1px 0 var(--white-70);
}

.date-selected:hover {
  background: linear-gradient(135deg, var(--accent-primary-20) 0%, var(--accent-secondary-20) 100%);
  border-color: var(--accent-primary-80);
}

.date-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  text-transform: capitalize;
}

.date-navigation {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.load-more-button {
  flex: 1;
  padding: 0.875rem 1.5rem;
  background: var(--white-30);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 2px solid var(--white-50);
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--accent-primary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  box-shadow: 0 2px 8px var(--shadow), inset 0 1px 0 var(--white-60);
}

.load-more-button:hover {
  background: var(--white-40);
  border-color: var(--accent-primary-40);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--shadow), inset 0 1px 0 var(--white-70);
}

@media (max-width: 768px) {
  .dates-grid {
    grid-template-columns: repeat(auto-fill, minmax(6rem, 1fr));
  }
}
</style>