<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { VISIT_TYPES } from '../../../constants/mockData'
import LoadingSpinner from '../../shared/LoadingSpinner.vue'

const { t } = useI18n()

import type { VisitTypeSelector } from '../../../types/appointment'
const props = withDefaults(defineProps<VisitTypeSelector>(), {
  loading: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'select': [visitId: string]
}>()

const searchQuery = ref('')
const showDropdown = ref(false)

// Initialize searchQuery if modelValue is already set (preselected)
const initializeSearchQuery = () => {
  if (props.modelValue) {
    const visit = VISIT_TYPES.find(v => v.id === props.modelValue)
    if (visit) {
      searchQuery.value = t(`appointmentBooking.visitTypes.${visit.key}`)
    }
  }
}

onMounted(() => {
  initializeSearchQuery()
})

watch(() => props.modelValue, () => {
  initializeSearchQuery()
})

// Filtra tipi di visite in base alla ricerca
const filteredVisits = computed(() => {
  if (!searchQuery.value) return VISIT_TYPES

  const query = searchQuery.value.toLowerCase()
  return VISIT_TYPES.filter(visit =>
    t(`appointmentBooking.visitTypes.${visit.key}`).toLowerCase().includes(query)
  )
})

const handleVisitSelect = (visitId: string) => {
  const visit = VISIT_TYPES.find(v => v.id === visitId)
  if (visit) {
    searchQuery.value = t(`appointmentBooking.visitTypes.${visit.key}`)
    showDropdown.value = false
    emit('update:modelValue', visitId)
    emit('select', visitId)
  }
}

const handleFocus = () => {
  showDropdown.value = true
}

const handleInput = () => {
  showDropdown.value = true
}
</script>

<template>
  <div class="visit-type-selector">
    <h3 class="section-title">{{ $t('appointmentBooking.selectVisit') }}</h3>

    <div v-if="loading">
      <LoadingSpinner size="small" :message="$t('appointmentBooking.loadingAvailability')" inline />
    </div>

    <div v-else class="search-container">
      <div class="search-wrapper" @click="handleFocus">
        <MagnifyingGlassIcon class="icon-md search-icon" />
        <input v-model="searchQuery" type="text" :placeholder="$t('appointmentBooking.searchPlaceholder')"
          class="search-input" @focus="handleFocus" @input="handleInput" />
      </div>

      <!-- Dropdown visite -->
      <Transition name="dropdown">
        <div v-if="showDropdown && filteredVisits.length > 0" class="visits-dropdown">
          <button v-for="visit in filteredVisits" :key="visit.id" class="visit-option"
            :class="{ 'visit-option-selected': modelValue === visit.id }" @click="handleVisitSelect(visit.id)">
            <span class="visit-name">{{ $t(`appointmentBooking.visitTypes.${visit.key}`) }}</span>
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.visit-type-selector {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.search-container {
  position: relative;
}

.search-wrapper {
  position: relative;
  background: var(--white-40);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 2px solid var(--white-50);
  border-radius: 1rem;
  box-shadow: 0 4px 16px var(--shadow), inset 0 1px 0 var(--white-70);
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  cursor: text;
}

.search-wrapper:focus-within {
  border-color: var(--accent-primary-50);
  box-shadow: 0 4px 20px var(--accent-primary-20), inset 0 1px 0 var(--white-70);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: var(--text-secondary);
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 500;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-secondary);
}

/* Visits Dropdown */
.visits-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background: var(--white-60);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid var(--white-60);
  border-radius: 1rem;
  box-shadow: 0 8px 32px var(--shadow), inset 0 1px 0 var(--white-80);
  max-height: 20rem;
  overflow-y: auto;
  z-index: 10;
}

.visit-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  width: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  border-bottom: 1px solid var(--white-20);
}

.visit-option:last-child {
  border-bottom: none;
}

.visit-option:hover {
  background: var(--white-30);
}

.visit-option-selected {
  background: var(--accent-primary-10);
}

.visit-name {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
  text-align: left;
  flex: 1;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
