<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CalendarIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'
import type { DateRange } from '../../../types/date-range'

interface DateRangeFilter {
  modelValue: DateRange
}

const props = defineProps<DateRangeFilter>()
const emit = defineEmits<{
  'update:modelValue': [value: DateRange]
}>()

const { t } = useI18n()
const showPicker = ref(false)
const fromDate = ref('')
const toDate = ref('')

// Preset date ranges
const presets = computed(() => [
  {
    id: 'last-month',
    label: t('documents.dateRange.lastMonth'),
    getDates: () => {
      const to = new Date()
      to.setHours(23, 59, 59, 999)
      const from = new Date()
      from.setMonth(from.getMonth() - 1)
      from.setHours(0, 0, 0, 0)
      return { from, to }
    }
  },
  {
    id: 'last-3-months',
    label: t('documents.dateRange.last3Months'),
    getDates: () => {
      const to = new Date()
      to.setHours(23, 59, 59, 999)
      const from = new Date()
      from.setMonth(from.getMonth() - 3)
      from.setHours(0, 0, 0, 0)
      return { from, to }
    }
  },
  {
    id: 'last-6-months',
    label: t('documents.dateRange.last6Months'),
    getDates: () => {
      const to = new Date()
      to.setHours(23, 59, 59, 999)
      const from = new Date()
      from.setMonth(from.getMonth() - 6)
      from.setHours(0, 0, 0, 0)
      return { from, to }
    }
  },
  {
    id: 'last-year',
    label: t('documents.dateRange.lastYear'),
    getDates: () => {
      const to = new Date()
      to.setHours(23, 59, 59, 999)
      const from = new Date()
      from.setFullYear(from.getFullYear() - 1)
      from.setHours(0, 0, 0, 0)
      return { from, to }
    }
  }
])

const isActive = computed(() => {
  return props.modelValue.from !== null || props.modelValue.to !== null
})

const formattedRange = computed(() => {
  if (!props.modelValue.from && !props.modelValue.to) {
    return t('documents.dateRange.selectRange')
  }
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('it-IT', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }).format(date)
  }
  
  if (props.modelValue.from && props.modelValue.to) {
    return `${formatDate(props.modelValue.from)} - ${formatDate(props.modelValue.to)}`
  }
  
  if (props.modelValue.from) {
    return `${t('documents.dateRange.from')} ${formatDate(props.modelValue.from)}`
  }
  
  if (props.modelValue.to) {
    return `${t('documents.dateRange.to')} ${formatDate(props.modelValue.to)}`
  }
  
  return ''
})

// Initialize input values from props
watch(() => props.modelValue, (value) => {
  if (value.from) {
    fromDate.value = value.from.toISOString().split('T')[0] || ''
  } else {
    fromDate.value = ''
  }
  
  if (value.to) {
    toDate.value = value.to.toISOString().split('T')[0] || ''
  } else {
    toDate.value = ''
  }
}, { immediate: true })

const applyPreset = (preset: typeof presets.value[0]) => {
  const dates = preset.getDates()
  emit('update:modelValue', dates)
  showPicker.value = false
}

const applyCustomRange = () => {
  const range: DateRange = {
    from: fromDate.value ? (() => {
      const date = new Date(fromDate.value)
      date.setHours(0, 0, 0, 0)
      return date
    })() : null,
    to: toDate.value ? (() => {
      const date = new Date(toDate.value)
      date.setHours(23, 59, 59, 999)
      return date
    })() : null
  }
  emit('update:modelValue', range)
  showPicker.value = false
}

const clearRange = () => {
  emit('update:modelValue', { from: null, to: null })
  showPicker.value = false
}
</script>

<template>
  <div class="date-range-filter">
    <button 
      class="range-button"
      :class="{ 'range-button-active': isActive }"
      @click="showPicker = !showPicker"
      :aria-label="$t('documents.dateRange.selectRange')"
    >
      <CalendarIcon class="icon-calendar" />
      <span class="range-label">{{ formattedRange }}</span>
      <XMarkIcon 
        v-if="isActive" 
        class="icon-clear clear-icon"
        @click.stop="clearRange"
        :aria-label="$t('documents.dateRange.clearRange')"
      />
    </button>

    <Transition name="dropdown">
      <div v-if="showPicker" class="date-picker-dropdown">
        <div class="picker-section">
          <h4 class="section-title">{{ $t('documents.dateRange.quickSelect') }}</h4>
          <div class="presets-grid">
            <button
              v-for="preset in presets"
              :key="preset.id"
              class="preset-button"
              @click="applyPreset(preset)"
              :aria-label="preset.label"
            >
              {{ preset.label }}
            </button>
          </div>
        </div>

        <div class="picker-divider"></div>

        <div class="picker-section">
          <h4 class="section-title">{{ $t('documents.dateRange.customRange') }}</h4>
          <div class="date-inputs">
            <div class="date-input-group">
              <label class="input-label">{{ $t('documents.dateRange.from') }}</label>
              <input 
                v-model="fromDate"
                type="date"
                class="date-input"
                :aria-label="$t('documents.dateRange.from')"
              />
            </div>
            <div class="date-input-group">
              <label class="input-label">{{ $t('documents.dateRange.to') }}</label>
              <input 
                v-model="toDate"
                type="date"
                class="date-input"
                :aria-label="$t('documents.dateRange.to')"
              />
            </div>
          </div>
          <button class="apply-button" @click="applyCustomRange" :aria-label="$t('documents.dateRange.apply')">
            {{ $t('documents.dateRange.apply') }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.date-range-filter {
  position: relative;
  z-index: 200;
}

.range-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: var(--white-50);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--white-40);
  border-radius: 0.75rem;
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  box-shadow: 0 2px 8px var(--shadow), inset 0 1px 0 var(--white-60);
  white-space: nowrap;
  position: relative;
  z-index: 201;
}

.range-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px var(--shadow), inset 0 1px 0 var(--white-80);
}

.range-button-active {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: var(--bg-primary);
  border-color: var(--white-30);
  box-shadow: 0 4px 16px var(--accent-primary-30);
}

.range-button-active:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px var(--accent-primary-40);
}

.icon-calendar {
  width: 1.25rem;
  height: 1.25rem;
}

.icon-clear {
  width: 1rem;
  height: 1rem;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.icon-clear:hover {
  opacity: 1;
}

.range-label {
  display: inline;
}

.date-picker-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 320px;
  background: var(--bg-secondary-98);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--text-primary-10);
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 12px 40px var(--black-20), inset 0 1px 0 var(--white-90);
  z-index: 210;
  pointer-events: auto;
  isolation: isolate;
}

.picker-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-muted);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.presets-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.preset-button {
  padding: 0.625rem;
  background: var(--accent-primary-8);
  border: 1px solid var(--accent-primary-20);
  border-radius: 0.5rem;
  color: var(--text-interactive);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  pointer-events: auto;
}

.preset-button:hover {
  background: var(--accent-primary-15);
  border-color: var(--accent-primary-40);
  transform: translateY(-1px);
}

.picker-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, var(--border-color) 50%, transparent 100%);
  margin: 1rem 0;
}

.date-inputs {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.date-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.input-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.date-input {
  padding: 0.625rem;
  background: var(--white-60);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-default);
  transition: all 0.2s;
}

.date-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--accent-primary-10);
}

.apply-button {
  padding: 0.625rem;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  border: none;
  border-radius: 0.5rem;
  color: var(--bg-primary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  box-shadow: 0 2px 8px var(--accent-primary-30);
}

.apply-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--accent-primary-40);
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
