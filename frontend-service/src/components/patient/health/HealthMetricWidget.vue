<script setup lang="ts">
import { computed, ref } from 'vue';
import type { HealthParameter } from '../../../types/health';

// Define props using HealthParameter type from types
const props = withDefaults(defineProps<{
  parameter: HealthParameter;
  compact?: boolean;
}>(), {
  compact: false
});

// State for showing/hiding details
const showDetails = ref(false);

// Check if value is in normal range
const isInRange = computed(() => {
  return (
    props.parameter.value >= props.parameter.normalRange.min &&
    props.parameter.value <= props.parameter.normalRange.max
  );
});

// Status color class based on value range
const statusClass = computed(() => {
  return isInRange.value ? 'metric-value-inrange' : 'metric-value-outrange';
});

// Trend icon and color
const trendIcon = computed(() => {
  if (props.parameter.trend === 'up') return '↗';
  if (props.parameter.trend === 'down') return '↘';
  return '→';
});

const trendClass = computed(() => {
  if (props.parameter.trend === 'up') return 'metric-trend-up';
  if (props.parameter.trend === 'down') return 'metric-trend-down';
  return 'metric-trend-stable';
});

// Toggle details section
const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};
</script>

<template>
  <div :class="compact ? 'compact-metric' : 'metric-widget'">
    <div :class="compact ? 'metric-header-compact' : 'metric-header'">
      <h3 :class="compact ? 'metric-title-compact' : 'metric-title-large'" class="metric-title">{{ parameter.name }}</h3>
      <span :class="[trendClass, compact ? 'metric-trend-compact' : 'metric-trend-large']">{{ trendIcon }}</span>
    </div>
    <div :class="compact ? 'metric-range metric-range-compact' : 'metric-range'">
      {{ $t('health.normalRange') }} {{ parameter.normalRange.min }}-{{ parameter.normalRange.max }} {{ parameter.unit }}
    </div>
    <div :class="compact ? 'metric-value-row-compact' : 'metric-value-row'">
      <span :class="[statusClass, compact ? 'metric-value-compact' : 'metric-value-large']">
        {{ parameter.value }}
      </span>
      <span :class="compact ? 'metric-unit-compact' : 'metric-unit-large'">{{ parameter.unit }}</span>
    </div>

    <!-- Source Documents Section -->
    <div class="source-documents-section">
      <button @click="toggleDetails" class="details-toggle" type="button" :aria-expanded="showDetails">
        <svg class="details-toggle-icon" :class="{ 'rotate-180': showDetails }" fill="none"
          stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
        <span class="metric-details-text">
          {{ showDetails ? $t('health.sourceDocuments.hideDetails') : $t('health.sourceDocuments.showDetails') }}
        </span>
      </button>

      <transition name="expand">
        <div v-if="showDetails" class="details-content">
          <p class="details-description">{{ $t('health.sourceDocuments.description') }}</p>
          <div v-if="parameter.sourceDocuments && parameter.sourceDocuments.length > 0">
            <div v-for="doc in parameter.sourceDocuments" :key="doc.id" class="document-item">
              <div class="document-item-row">
                <svg class="document-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clip-rule="evenodd" />
                </svg>
                <div class="document-item-body">
                  <p class="document-title">{{ doc.title }}</p>
                  <p class="document-date">{{ doc.date }}</p>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="no-documents">{{ $t('health.sourceDocuments.noDocuments') }}</p>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
/* Widget container styles */
.compact-metric {
  width: 100%;
  padding: 0.875rem 1rem;
  background: var(--white-50);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--white-60);
  border-radius: 0.75rem;
  box-shadow: 0 4px 16px var(--shadow), inset 0 1px 0 var(--white-70);
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  align-self: start;
}
.compact-metric:hover {
  background: var(--white-65);
  box-shadow: 0 8px 24px var(--shadow), inset 0 1px 0 var(--white-80);
  transform: translateY(-2px);
}
.metric-widget {
  padding: 1.5rem;
  background: var(--white-50);
  backdrop-filter: blur(16px);
  border: 1px solid var(--white-60);
  border-radius: 1.25rem;
  box-shadow: 0 4px 16px var(--shadow), inset 0 1px 0 var(--white-70);
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  align-self: start;
}
.metric-widget:hover {
  background: var(--white-65);
  box-shadow: 0 8px 24px var(--shadow), inset 0 1px 0 var(--white-80);
  transform: translateY(-2px);
}

/* Header and layout */
.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.metric-header-compact {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

/* Title and trend */
.metric-title {
  color: var(--text-primary);
  font-weight: 600;
}
.metric-title-large {
  font-size: 1.125rem;
}
.metric-title-compact {
  font-size: 1rem;
}
.metric-trend-up {
  color: var(--error);
}
.metric-trend-down {
  color: var(--success);
}
.metric-trend-stable {
  color: var(--text-secondary);
}
.metric-trend-large {
  font-size: 1.5rem;
  font-weight: bold;
}
.metric-trend-compact {
  font-size: 1.1rem;
  font-weight: bold;
}

/* Range and value */
.metric-range {
  font-size: 0.75rem;
  color: var(--text-secondary);
}
.metric-value-row {
  display: flex;
  align-items: baseline;
  margin-bottom: 1rem;
}
.metric-value-row-compact {
  display: flex;
  align-items: baseline;
  margin-bottom: 0.5rem;
}
.metric-value-inrange {
  color: var(--success);
  font-weight: bold;
}
.metric-value-outrange {
  color: var(--error);
  font-weight: bold;
}
.metric-value-large {
  font-size: 2.25rem;
}
.metric-value-compact {
  font-size: 1.5rem;
}
.metric-unit-large {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-left: 0.5rem;
}
.metric-unit-compact {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-left: 0.25rem;
}

/* Source documents section */
.source-documents-section {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
}
.details-toggle {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.375rem;
  background: transparent;
  border: none;
  color: var(--accent-primary);
  cursor: pointer;
  transition: color 0.2s;
  border-radius: 0.5rem;
}
.details-toggle-icon {
  width: 0.875rem;
  height: 0.875rem;
  transition: transform 0.2s;
}
.metric-details-text {
  margin-left: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--accent-primary);
}
.details-toggle:hover {
  color: var(--accent-primary-70);
  background: var(--accent-primary-5);
}
.details-toggle:hover .metric-details-text {
  color: var(--accent-primary-70);
}

.details-content {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: var(--accent-primary-8-on-bg);
  border-radius: 0.5rem;
  border: 1px solid var(--accent-primary-15);
}
.details-description {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

/* Document item styles */
.document-item {
  padding: 0.5rem;
  background: var(--white-60);
  border-radius: 0.375rem;
  border: 1px solid var(--accent-primary-10);
  transition: all 0.2s;
  margin-bottom: 0.4rem;
}
.document-item:last-child {
  margin-bottom: 0;
}
.document-item-row {
  display: flex;
  align-items: flex-start;
}
.document-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--accent-primary);
  margin-top: 0.125rem;
  flex-shrink: 0;
}
.document-item-body {
  margin-left: 0.3rem;
  flex: 1;
}
.document-title {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.25;
}
.document-date {
  font-size: 0.75rem;
  color: var(--text-secondary);
}
.no-documents {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-style: italic;
}

/* Expand transition for details */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}
.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 400px;
  transform: translateY(0);
}
.rotate-180 {
  transform: rotate(180deg);
}

@media (max-width: 600px) {
  .compact-metric, .metric-widget {
    padding: 0.5rem 0.5rem;
    border-radius: 0.5rem;
  }
  .metric-header, .metric-header-compact {
    margin-bottom: 0.25rem;
  }
  .metric-title-large {
    font-size: 1rem;
  }
  .metric-title-compact {
    font-size: 0.85rem;
  }
  .metric-value-large {
    font-size: 1.5rem;
  }
  .metric-value-compact {
    font-size: 1.1rem;
  }
  .metric-unit-large, .metric-unit-compact {
    font-size: 0.7rem;
    margin-left: 0.2rem;
  }
  .details-content {
    padding: 0.4rem;
    border-radius: 0.3rem;
  }
}
</style>
