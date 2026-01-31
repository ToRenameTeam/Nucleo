<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { UserIcon, MapPinIcon } from '@heroicons/vue/24/outline'
import BaseModal from '../../shared/BaseModal.vue'
import VisitTypeSelector from './VisitTypeSelector.vue'
import DateSelector from './DateSelector.vue'
import TimeSlotSelector from './TimeSlotSelector.vue'
import { getAppointmentDetails } from '../../../constants/mockData'
import type { AppointmentBooking } from '../../../types/appointment'

const props = withDefaults(defineProps<AppointmentBooking>(), {})

const emit = defineEmits<{
  close: []
  confirm: [appointment: any]
}>()

// Component state
const selectedVisit = ref<string | null>(props.preselectedVisit || null)
const selectedDate = ref<string | null>(null)
const selectedTime = ref<string | null>(null)
const isLoadingDates = ref(false)
const isLoadingTimes = ref(false)
const appointmentDetailsRef = ref<HTMLElement | null>(null)

// Watch for preselected visit to auto-load dates
watch(() => props.preselectedVisit, (newValue) => {
  if (newValue && props.isOpen) {
    selectedVisit.value = newValue
    selectedDate.value = null
    selectedTime.value = null
    isLoadingDates.value = true
    setTimeout(() => {
      isLoadingDates.value = false
    }, 1500)
  }
}, { immediate: true })

const resetFields = () => {
  selectedVisit.value = null
  selectedDate.value = null
  selectedTime.value = null
  isLoadingDates.value = false
  isLoadingTimes.value = false
}

const handleClose = () => {
  resetFields()
  emit('close')
}

const handleVisitSelect = () => {
  selectedDate.value = null
  selectedTime.value = null
  isLoadingDates.value = true
  setTimeout(() => {
    isLoadingDates.value = false
  }, 1500)
}

const handleDateSelect = () => {
  selectedTime.value = null
  isLoadingTimes.value = true
  setTimeout(() => {
    isLoadingTimes.value = false
  }, 1000)
}

const handleConfirm = () => {
  if (!selectedVisit.value || !selectedDate.value || !selectedTime.value) return
  const appointment = {
    visitType: selectedVisit.value,
    date: selectedDate.value,
    time: selectedTime.value,
  }
  emit('confirm', appointment)
  resetFields()
  emit('close')
}

const canConfirm = computed(() => {
  return selectedVisit.value && selectedDate.value && selectedTime.value
})

const appointmentDetails = computed(() => {
  if (!selectedDate.value || !selectedTime.value) return null
  return getAppointmentDetails(selectedDate.value, selectedTime.value)
})

watch(appointmentDetails, (newDetails) => {
  if (newDetails) {
    setTimeout(() => {
      nextTick(() => {
        const modalBody = appointmentDetailsRef.value?.closest('.modal-body')
        if (modalBody) {
          modalBody.scrollTo({
            top: modalBody.scrollHeight,
            behavior: 'smooth'
          })
        }
      })
    }, 250)
  }
})

</script>

<template>
  <BaseModal :is-open="isOpen" :title="$t('appointmentBooking.title')" max-width="lg" @close="handleClose">
    <!-- Body -->
    <VisitTypeSelector v-model="selectedVisit" @select="handleVisitSelect" />

    <DateSelector v-model="selectedDate" :disabled="!selectedVisit" :loading="isLoadingDates"
      @select="handleDateSelect" />

    <TimeSlotSelector v-model="selectedTime" :selected-date="selectedDate" :disabled="!selectedDate"
      :loading="isLoadingTimes" />

    <!-- Appointment Details -->
    <Transition name="slide-fade">
      <div v-if="appointmentDetails" ref="appointmentDetailsRef" class="appointment-details">
        <h3 class="details-title">{{ $t('appointmentBooking.detailsTitle') }}</h3>
        <div class="details-content">
          <div class="detail-item">
            <div class="detail-icon">
              <UserIcon class="icon-md" />
            </div>
            <div class="detail-text">
              <p class="detail-label">{{ $t('appointmentBooking.doctor') }}</p>
              <p class="detail-value">{{ appointmentDetails.doctor }}</p>
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-icon">
              <MapPinIcon class="icon-md" />
            </div>
            <div class="detail-text">
              <p class="detail-label">{{ $t('appointmentBooking.location') }}</p>
              <p class="detail-value">{{ appointmentDetails.location }}</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Footer -->
    <template #footer>
      <button class="button button-secondary" @click="handleClose">
        {{ $t('appointmentBooking.cancel') }}
      </button>
      <button class="button button-primary" :disabled="!canConfirm" @click="handleConfirm">
        {{ $t('appointmentBooking.confirm') }}
      </button>
    </template>
  </BaseModal>
</template>

<style scoped>
.button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.button-secondary {
  background: var(--white-30);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: var(--text-secondary);
  border: 1px solid var(--white-50);
  box-shadow: 0 2px 8px var(--shadow), inset 0 1px 0 var(--white-50);
}

.button-secondary:hover {
  background: var(--white-40);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--shadow), inset 0 1px 0 var(--white-70);
}

.button-primary {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: var(--bg-primary);
  box-shadow: 0 4px 16px var(--accent-primary-30), inset 0 1px 0 var(--white-20);
}

.button-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px var(--accent-primary-40), inset 0 1px 0 var(--white-30);
}

.button-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.appointment-details {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: var(--accent-primary-8);
  backdrop-filter: blur(12px);
  border: 1.5px solid var(--accent-primary-20);
  border-radius: 1.25rem;
  box-shadow: 0 4px 16px var(--accent-primary-10), inset 0 1px 0 var(--white-50);
}

.details-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.details-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.detail-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: var(--accent-primary-15);
  border: 1px solid var(--accent-primary-25);
  border-radius: 0.75rem;
  color: var(--accent-primary);
  flex-shrink: 0;
  box-shadow: 0 2px 8px var(--accent-primary-10);
}

.icon-md {
  width: 1.25rem;
  height: 1.25rem;
  display: inline-block;
}

.detail-text {
  flex: 1;
  min-width: 0;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.25rem 0;
}

.detail-value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
}

.slide-fade-enter-active {
  animation: slideInUp 0.4s cubic-bezier(0, 0, 0.2, 1);
}

.slide-fade-leave-active {
  animation: slideOut 0.3s cubic-bezier(0, 0, 0.2, 1);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }

  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}
</style>