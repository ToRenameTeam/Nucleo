<script setup lang="ts">
import { computed } from 'vue'
import { TIME_SLOTS } from '../../constants/mockData'
import LoadingSpinner from '../shared/LoadingSpinner.vue'
import type { TimeSlotSelector } from '../../types/appointment'

const props = withDefaults(defineProps<TimeSlotSelector>(), {
  disabled: false,
  loading: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'select': [time: string]
}>()

const availableTimeSlots = computed(() => {
  if (!props.selectedDate) return []
  
  const occupiedCount = Math.floor(TIME_SLOTS.length * 0.3)
  const occupiedIndices = new Set<number>()
  
  const seed = props.selectedDate.split('-').join('')
  let randomValue = parseInt(seed) % 1000
  
  while (occupiedIndices.size < occupiedCount) {
    randomValue = (randomValue * 9301 + 49297) % 233280
    const index = randomValue % TIME_SLOTS.length
    occupiedIndices.add(index)
  }
  
  return TIME_SLOTS.map((slot, index) => ({
    time: slot,
    available: !occupiedIndices.has(index)
  }))
})

const handleTimeSelect = (time: string, available: boolean) => {
  if (!available) return
  emit('update:modelValue', time)
  emit('select', time)
}
</script>

<template>
  <div class="time-slot-selector" :class="{ 'section-disabled': disabled }">
    <h3 class="section-title">{{ $t('appointmentBooking.selectTime') }}</h3>
    
    <LoadingSpinner 
      v-if="loading" 
      size="small" 
      :message="$t('appointmentBooking.loadingAvailability')" 
      inline 
    />

    <div v-else-if="selectedDate && !loading" class="times-grid">
      <button
        v-for="slot in availableTimeSlots"
        :key="slot.time"
        class="time-slot"
        :class="{ 
          'time-selected': modelValue === slot.time,
          'time-unavailable': !slot.available 
        }"
        :disabled="!slot.available"
        @click="handleTimeSelect(slot.time, slot.available)"
      >
        {{ slot.time }}
      </button>
    </div>

    <div v-else-if="!selectedDate" class="placeholder-message">
      <p>{{ $t('appointmentBooking.selectDate') }}</p>
    </div>
  </div>
</template>

<style scoped>
.time-slot-selector {
  margin-bottom: 2rem;
}

.time-slot-selector:last-child {
  margin-bottom: 0;
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

/* Times Grid */
.times-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr));
  gap: 0.625rem;
}

.time-slot {
  position: relative;
  background: var(--white-30);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 2px solid var(--white-50);
  border-radius: 0.625rem;
  padding: 0.75rem 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  box-shadow: 0 2px 8px var(--shadow), inset 0 1px 0 var(--white-60);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.time-slot:hover:not(:disabled) {
  background: var(--white-40);
  border-color: var(--accent-primary-40);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--shadow), inset 0 1px 0 var(--white-70);
}

.time-selected {
  background: linear-gradient(135deg, var(--accent-primary-15) 0%, var(--accent-secondary-15) 100%);
  border-color: var(--accent-primary-70);
  box-shadow: 0 4px 20px var(--accent-primary-30), inset 0 1px 0 var(--white-70);
}

.time-unavailable {
  opacity: 0.4;
  cursor: not-allowed;
  text-decoration: line-through;
  background: var(--text-secondary-20);
}

@media (max-width: 768px) {
  .times-grid {
    grid-template-columns: repeat(auto-fill, minmax(4rem, 1fr));
  }
}
</style>
