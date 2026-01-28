<script setup lang="ts">
import AppointmentCard from '../shared/AppointmentCard.vue'
import type { UpcomingAppointments } from '../../types/appointment'

const props = defineProps<UpcomingAppointments>()

const emit = defineEmits<{
  appointmentClick: [id: string]
}>()
</script>

<template>
  <div class="upcoming-appointments-list">
    <div v-if="props.appointments.length === 0" class="no-appointments-message">
      {{ $t('home.noAppointments') }}
    </div>
    <div v-else class="appointments-list">
      <AppointmentCard
        v-for="appointment in props.appointments"
        :key="appointment.id"
        :appointment="appointment"
        @click="emit('appointmentClick', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.upcoming-appointments-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.no-appointments-message {
  color: var(--text-secondary);
  text-align: center;
  padding: 2rem 0;
  font-size: 1rem;
  background: var(--bg-secondary-40);
  border-radius: 12px;
  border: 1px dashed var(--border-color);
}

.appointments-list {
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .upcoming-appointments-list,
  .appointments-list {
    gap: 0.75rem;
  }
  .no-appointments-message {
    font-size: 0.95rem;
    padding: 1.25rem 0;
  }
}
</style>
