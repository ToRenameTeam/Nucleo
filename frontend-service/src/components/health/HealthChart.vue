<script setup lang="ts">
import { computed, ref } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from 'chart.js';
import type { HealthMetricHistory } from '../../types/health';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const props = withDefaults(defineProps<{
  title: string;
  data: HealthMetricHistory;
  unit: string;
  normalRange?: { min: number; max: number };
  compact?: boolean;
}>(), {
  compact: false
});

const showDetails = ref(false);

const chartData = computed(() => ({
  labels: props.data.data.map((d) => d.date),
  datasets: [
    {
      label: props.title,
      data: props.data.data.map((d) => d.value),
      borderColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim() || getComputedStyle(document.documentElement).getPropertyValue('--blue-3b82f6').trim(),
      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-primary-10').trim() || getComputedStyle(document.documentElement).getPropertyValue('--blue-3b82f6-10').trim(),
      fill: true,
      tension: 0.4,
      pointRadius: props.compact ? 2 : 4,
      pointHoverRadius: props.compact ? 4 : 6,
      pointBackgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim() || getComputedStyle(document.documentElement).getPropertyValue('--blue-3b82f6').trim(),
      pointBorderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-primary').trim() || getComputedStyle(document.documentElement).getPropertyValue('--white-100').trim(),
      pointBorderWidth: 2,
    },
  ],
}));

const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--chart-tooltip-bg').trim() || getComputedStyle(document.documentElement).getPropertyValue('--black-80').trim(),
      padding: props.compact ? 8 : 12,
      titleFont: {
        size: props.compact ? 12 : 14,
      },
      bodyFont: {
        size: props.compact ? 11 : 13,
      },
      callbacks: {
        label: (context) => {
          return `${context.parsed.y} ${props.unit}`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim(),
        font: {
          size: props.compact ? 9 : 11,
        },
      },
    },
    y: {
      beginAtZero: false,
      grid: {
        color: getComputedStyle(document.documentElement).getPropertyValue('--chart-grid').trim() || getComputedStyle(document.documentElement).getPropertyValue('--black-5').trim(),
      },
      ticks: {
        color: getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim(),
        font: {
          size: props.compact ? 9 : 11,
        },
        callback: (value) => {
          return `${value} ${props.unit}`;
        },
      },
    },
  },
}));

const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};
</script>

<template>
  <div :class="compact ? 'compact-chart' : 'chart-widget'">
    <div :class="compact ? 'chart-header-compact' : 'chart-header'">
      <h3 :class="compact ? 'chart-title-compact' : 'chart-title'">
        {{ title }}
      </h3>
      <p v-if="normalRange" :class="compact ? 'chart-subtitle-compact' : 'chart-subtitle'">
        {{$t('health.normalRange')}} {{ normalRange.min }}-{{ normalRange.max }} {{ unit }}
      </p>
    </div>
    <div :class="compact ? 'chart-graph-compact' : 'chart-graph'">
      <Line :data="chartData" :options="chartOptions" />
    </div>

    <!-- Source Documents Section -->
    <div class="source-documents-section">
      <button 
        @click="toggleDetails" 
        class="details-toggle"
        type="button"
        :aria-expanded="showDetails"
      >
        <svg 
          class="details-toggle-icon" 
          :class="{ 'rotate-180': showDetails }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
        <span class="details-toggle-text">
          {{ showDetails ? $t('health.sourceDocuments.hideDetails') : $t('health.sourceDocuments.showDetails') }}
        </span>
      </button>

      <transition name="expand">
        <div v-if="showDetails" class="details-content">
          <p class="details-description">{{ $t('health.sourceDocuments.description') }}</p>
          <div v-if="data.sourceDocuments && data.sourceDocuments.length > 0">
            <div 
              v-for="doc in data.sourceDocuments" 
              :key="doc.id" 
              class="document-item"
            >
              <div class="document-item-row">
                <svg class="document-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
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
.compact-chart {
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
.compact-chart:hover {
  background: var(--white-65);
  box-shadow: 0 8px 24px var(--shadow), inset 0 1px 0 var(--white-80);
  transform: translateY(-2px);
}
.chart-widget {
  padding: 1.5rem;
  background: var(--white-50);
  backdrop-filter: blur(16px);
  border: 1px solid var(--white-60);
  border-radius: 1.25rem;
  box-shadow: 0 4px 16px var(--shadow), inset 0 1px 0 var(--white-70);
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  align-self: start;
}
.chart-widget:hover {
  background: var(--white-65);
  box-shadow: 0 8px 24px var(--shadow), inset 0 1px 0 var(--white-80);
}

/* Chart header and graph area */
.chart-header {
  margin-bottom: 1.5rem;
}
.chart-header-compact {
  margin-bottom: 0.5rem;
}
.chart-graph {
  height: 16rem;
  margin-bottom: 1rem;
}
.chart-graph-compact {
  height: 8rem;
  margin-bottom: 0.5rem;
}

/* Chart title and subtitle */
.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}
.chart-title-compact {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}
.chart-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
.chart-subtitle-compact {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* Source documents section */
.source-documents-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.details-toggle {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: var(--accent-primary);
  cursor: pointer;
  transition: color 0.2s;
  border-radius: 0.5rem;
}
.details-toggle-icon {
  width: 1rem;
  height: 1rem;
  transition: transform 0.2s;
}
.details-toggle-text {
  margin-left: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--accent-primary);
}
.details-toggle:hover {
  color: var(--accent-primary-70);
  background: var(--accent-primary-5);
}
.details-toggle:hover .details-toggle-text {
  color: var(--accent-primary-70);
}

.details-content {
  margin-top: 0.75rem;
  padding: 1rem;
  background: var(--accent-primary-8-on-bg);
  border-radius: 0.75rem;
  border: 1px solid var(--accent-primary-15);
}
.details-description {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

/* Document item styles */
.document-item {
  padding: 0.625rem;
  background: var(--white-60);
  border-radius: 0.5rem;
  border: 1px solid var(--accent-primary-10);
  transition: all 0.2s;
  margin-bottom: 0.5rem;
}
.document-item:last-child {
  margin-bottom: 0;
}
.document-item:hover {
  background: var(--white-80);
  border-color: var(--accent-primary-20);
  transform: translateX(2px);
}
.document-item-row {
  display: flex;
  align-items: flex-start;
}
.document-icon {
  width: 1rem;
  height: 1rem;
  color: var(--accent-primary);
  margin-top: 0.125rem;
  flex-shrink: 0;
}
.document-item-body {
  margin-left: 0.5rem;
  flex: 1;
}
.document-title {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-primary);
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
  max-height: 500px;
  transform: translateY(0);
}
.rotate-180 {
  transform: rotate(180deg);
}

@media (max-width: 600px) {
  .compact-chart, .chart-widget {
    padding: 0.5rem 0.5rem;
    border-radius: 0.5rem;
  }
  .chart-header, .chart-header-compact {
    margin-bottom: 0.5rem;
  }
  .chart-graph {
    height: 10rem;
  }
  .chart-graph-compact {
    height: 5rem;
  }
  .details-content {
    padding: 0.5rem;
    border-radius: 0.5rem;
  }
}
</style>
