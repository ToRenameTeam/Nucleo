<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { BeakerIcon, ClockIcon } from '@heroicons/vue/24/outline'
import type { MedicinePrescription } from '../../../types/document'
import { parseItalianDate } from '../../../utils/dateUtils'

const props = defineProps<{
  document: MedicinePrescription
}>()

const { t } = useI18n()

const prescriptionInfo = computed(() => {
  const { dosage, validity } = props.document
  const periodKey = dosage.frequency.period.toLowerCase()
  const durationUnitKey = dosage.duration.unit.toLowerCase()
  return {
    medicine: dosage.medicineId,
    dose: `${dosage.dose.amount} ${t(`units.${dosage.dose.unit.toLowerCase()}`)}`,
    frequency: `${dosage.frequency.timesPerPeriod}x ${t(`periods.${periodKey}`)}`,
    duration: `${dosage.duration.length} ${t(`durationUnits.${durationUnitKey}`)}`,
    validUntil: validity.type === 'until_date' && 'date' in validity
      ? parseItalianDate(validity.date)
      : t('prescription.validUntilExecution')
  }
})
</script>

<template>
  <div v-if="prescriptionInfo" class="prescription-details">
    <div class="info-row">
      <BeakerIcon class="info-icon" />
      <div class="info-content">
        <span class="info-label">{{ t('doctor.documents.medicine') }}</span>
        <span class="info-value">{{ prescriptionInfo.medicine }}</span>
      </div>
    </div>
    <div class="info-row">
      <ClockIcon class="info-icon" />
      <div class="info-content">
        <span class="info-label">{{ t('doctor.documents.dosage') }}</span>
        <span class="info-value">{{ prescriptionInfo.dose }} - {{ prescriptionInfo.frequency }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prescription-details {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin-top: 1rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
}

.info-icon {
  width: 1rem;
  height: 1rem;
  color: var(--accent-primary);
  flex-shrink: 0;
}

.info-content {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
  align-items: baseline;
}

.info-label {
  font-weight: 600;
  color: var(--gray-525252);
}

.info-value {
  color: var(--gray-171717);
  font-weight: 500;
}
</style>
