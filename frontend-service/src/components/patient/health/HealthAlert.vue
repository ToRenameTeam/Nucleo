<script setup lang="ts">
import { computed } from 'vue';
import type { HealthAlert } from '../../../types/health';

const props = defineProps<{ alert: HealthAlert }>();

const alertClass = computed(() => {
  return [
    'health-alert',
    props.alert.severity === 'danger' ? 'health-alert-danger' : 'health-alert-warning',
  ];
});

// Compute icon color class
const iconClass = computed(() => {
  return [
    'health-alert-icon',
    props.alert.severity === 'danger' ? 'health-alert-icon-danger' : 'health-alert-icon-warning',
  ];
});

// Compute title color class
const titleClass = computed(() => {
  return [
    'health-alert-title',
    props.alert.severity === 'danger' ? 'health-alert-title-danger' : 'health-alert-title-warning',
  ];
});

// Compute text color class
const textClass = computed(() => {
  return [
    'health-alert-text',
    props.alert.severity === 'danger' ? 'health-alert-text-danger' : 'health-alert-text-warning',
  ];
});
</script>

<template>
  <div :class="alertClass">
    <div class="health-alert-content">
      <div class="health-alert-icon-wrapper">
        <svg
          :class="iconClass"
          viewBox="0 0 20 20"
          aria-hidden="true"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <div class="health-alert-body">
        <h3 :class="titleClass">
          {{ alert.parameterName }}
        </h3>
        <p :class="textClass">
          {{ alert.message }}
        </p>
        <p :class="textClass">
          <span class="health-alert-recommendation-icon" aria-hidden="true">💡</span>
          {{ alert.recommendation }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.health-alert {
  padding: 1rem;
  border-radius: 1rem;
  border-left-width: 4px;
  margin-bottom: 0.75rem;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  box-shadow: 0 4px 16px var(--shadow), inset 0 1px 0 var(--white-50);
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
}

.health-alert-danger {
  background: var(--error-10-on-bg);
  border-left: 4px solid var(--error);
  border: 1px solid var(--error-30);
}

.health-alert-warning {
  background: var(--warning-bg-accessible);
  border-left: 4px solid var(--warning);
  border: 1px solid var(--warning-30);
}

/* Responsive layout for alert content */
.health-alert-content {
  display: flex;
  align-items: flex-start;
}

.health-alert-icon-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
}

.health-alert-icon {
  width: 1.5rem;
  height: 1.5rem;
  display: block;
}
.health-alert-icon-danger {
  color: var(--error);
}
.health-alert-icon-warning {
  color: var(--warning);
}

.health-alert-body {
  margin-left: 0.75rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.health-alert-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  line-height: 1.2;
}
.health-alert-title-danger {
  color: var(--error);
}
.health-alert-title-warning {
  color: var(--warning-text-accessible);
}

.health-alert-text {
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
  line-height: 1.4;
}
.health-alert-text-danger {
  color: var(--error);
}
.health-alert-text-warning {
  color: var(--warning-text-accessible);
}

.health-alert-recommendation-icon {
  margin-right: 0.3em;
}

@media (max-width: 600px) {
  .health-alert {
    padding: 0.75rem;
    border-radius: 0.75rem;
    margin-bottom: 0.5rem;
  }
  .health-alert-content {
    flex-direction: column;
    align-items: stretch;
  }
  .health-alert-icon-wrapper {
    width: 2rem;
    height: 2rem;
    margin-bottom: 0.5rem;
  }
  .health-alert-body {
    margin-left: 0;
  }
}
</style>
