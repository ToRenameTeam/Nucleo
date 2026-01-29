<script setup lang="ts">
import { ref } from 'vue'
import HealthAlert from '../../components/health/HealthAlert.vue'
import HealthMetricWidget from '../../components/health/HealthMetricWidget.vue'
import HealthChart from '../../components/health/HealthChart.vue'
import { 
  HEALTH_PARAMETERS, 
  HEALTH_ALERTS,
  CHOLESTEROL_HISTORY,
  BLOOD_PRESSURE_SYS_HISTORY,
  HEART_RATE_HISTORY,
  GLUCOSE_HISTORY
} from '../../constants/mockData'

const healthParameters = ref(HEALTH_PARAMETERS)
const alerts = ref(HEALTH_ALERTS)
const cholesterolHistory = ref(CHOLESTEROL_HISTORY)
const bloodPressureSysHistory = ref(BLOOD_PRESSURE_SYS_HISTORY)
const heartRateHistory = ref(HEART_RATE_HISTORY)
const glucoseHistory = ref(GLUCOSE_HISTORY)
</script>

<template>
  <div class="health-page">
    <!-- Header Section -->
    <div class="page-header">
      <h1 class="page-title">{{ $t('health.title') }}</h1>
      <p class="page-subtitle">
        {{ $t('health.subtitle') }}
      </p>
    </div>

    <!-- Alerts Section -->
    <div v-if="alerts.length > 0" class="section-spacing">
      <h2 class="section-title">
        {{ $t('health.alerts.title') }}
      </h2>
      <div class="alerts-list">
        <HealthAlert v-for="alert in alerts" :key="alert.id" :alert="alert" />
      </div>
    </div>

    <!-- Metrics Overview Section -->
    <div class="section-spacing">
      <h2 class="section-title">
        {{ $t('health.parameters.title') }}
      </h2>
      <div class="metrics-grid">
        <HealthMetricWidget
          v-for="param in healthParameters"
          :key="param.id"
          :parameter="param"
        />
      </div>
    </div>

    <!-- Charts Section -->
    <div class="section-spacing">
      <h2 class="section-title">
        {{ $t('health.charts.title') }}
      </h2>
      <div class="charts-grid">
        <HealthChart
          :title="$t('health.parameters.cholesterol')"
          :data="cholesterolHistory"
          unit="mg/dL"
          :normal-range="{ min: 120, max: 200 }"
        />
        <HealthChart
          :title="$t('health.parameters.bloodPressureSys')"
          :data="bloodPressureSysHistory"
          unit="mmHg"
          :normal-range="{ min: 90, max: 120 }"
        />
        <HealthChart
          :title="$t('health.parameters.heartRate')"
          :data="heartRateHistory"
          unit="bpm"
          :normal-range="{ min: 60, max: 100 }"
        />
        <HealthChart
          :title="$t('health.parameters.glucose')"
          :data="glucoseHistory"
          unit="mg/dL"
          :normal-range="{ min: 70, max: 100 }"
        />
      </div>
    </div>

    <!-- Info Section -->
    <div class="info-card">
      <div class="info-row">
        <div class="info-icon">
          <svg class="info-svg" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="info-content">
          <h3 class="info-title">
            {{ $t('health.info.title') }}
          </h3>
          <p class="info-description">
            {{ $t('health.info.description') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.health-page {
  width: 100%;
  max-width: 100vw;
  min-height: 100vh;
  overflow-x: hidden;
  padding: 2rem;
  background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-mid) 50%, var(--bg-gradient-end) 100%);
  position: relative;
}

.health-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, var(--sky-0ea5e9-20) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, var(--purple-a855f7-20) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.page-header {
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
  padding: 1.5rem 2rem;
  background: var(--white-40);
  backdrop-filter: blur(20px);
  border: 1px solid var(--white-60);
  border-radius: 1.5rem;
  box-shadow: 0 8px 32px var(--black-8), inset 0 1px 0 var(--white-80);
  animation: slideInDown 0.5s cubic-bezier(0, 0, 0.2, 1);
}

.page-header h1 {
  margin: 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--gray-171717);
  line-height: 1.25;
}

.page-header p {
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
  color: var(--gray-525252);
  line-height: 1.5;
}

.section-spacing {
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
  animation: fadeIn 0.5s cubic-bezier(0, 0, 0.2, 1);
  animation-delay: 0.1s;
  animation-fill-mode: both;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-171717);
  margin-bottom: 1rem;
}

.info-card {
  padding: 1.5rem;
  background: var(--sky-e0f2fe-50);
  backdrop-filter: blur(16px);
  border: 1px solid var(--sky-0ea5e9-30);
  border-radius: 1.25rem;
  box-shadow: 0 4px 16px var(--black-8);
  position: relative;
  z-index: 1;
  animation: fadeIn 0.5s cubic-bezier(0, 0, 0.2, 1);
  animation-delay: 0.3s;
  animation-fill-mode: both;
}

.info-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-on-light-bg);
  margin-bottom: 0.25rem;
}

.info-description {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.page-title {
  margin: 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--gray-171717);
  line-height: 1.25;
}

.page-subtitle {
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
  color: var(--gray-525252);
  line-height: 1.5;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1024px) {
  .metrics-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 600px) {
  .charts-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.charts-grid > * {
  min-width: 0;
}

.info-row {
  display: flex;
  align-items: flex-start;
}

.info-icon {
  flex-shrink: 0;
}

.info-svg {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--sky-0ea5e9);
}

.info-content {
  margin-left: 1rem;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .health-page {
    padding: 1rem;
  }

  .page-header {
    padding: 1.25rem 1.5rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .page-header p {
    font-size: 0.875rem;
  }

  .section-title {
    font-size: 1.125rem;
  }
}

@media (max-width: 480px) {
  .health-page {
    padding: 0.75rem;
  }
  
  .page-header {
    padding: 1rem 1.25rem;
  }
  
  .page-header h1 {
    font-size: 1.375rem;
  }
  
  .page-header p {
    font-size: 0.8125rem;
  }
  
  .section-title {
    font-size: 1rem;
  }
  
  .section-spacing {
    margin-bottom: 1rem;
  }
  
  .info-card {
    padding: 1rem;
  }
}
</style>
