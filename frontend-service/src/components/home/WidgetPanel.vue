<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  CalendarIcon, 
  BellIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'
import WidgetSelector from './WidgetSelector.vue'
import type { WidgetOption } from '../../types/widget'
import HealthMetricWidget from '../health/HealthMetricWidget.vue'
import HealthChart from '../health/HealthChart.vue'
import { 
  getHealthParameter,
  getHealthHistory,
  WIDGET_DATA,
  getAvailableWidgets
} from '../../constants/mockData'

const { t } = useI18n()
const isWidgetSelectorOpen = ref(false)
const selectedWidgetIds = ref<string[]>([])
const isLoadingWidgets = ref(false)
const loadingProgress = ref(0)

const availableWidgets = computed<WidgetOption[]>(() => getAvailableWidgets(t))

const activeWidgets = computed(() => {
  return availableWidgets.value.filter(widget => 
    selectedWidgetIds.value.includes(widget.id)
  )
})

const getChartData = (id: string) => {
  const chartId = id.replace('-chart', '')
  const history = getHealthHistory(chartId)
  const param = getHealthParameter(chartId)
  
  if (!history || !param) return undefined
  
  return {
    data: history,
    title: param.name,
    unit: param.unit,
    normalRange: param.normalRange
  }
}

const handleSaveWidgets = async (newSelection: string[]) => {
  isWidgetSelectorOpen.value = false
  isLoadingWidgets.value = true
  loadingProgress.value = 0
  
  const totalSteps = newSelection.length
  
  for (let i = 0; i < totalSteps; i++) {
    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200))
    loadingProgress.value = ((i + 1) / totalSteps) * 100
  }
  
  // Final delay to show 100% completion
  await new Promise(resolve => setTimeout(resolve, 200))
  
  selectedWidgetIds.value = newSelection
  localStorage.setItem('selectedWidgets', JSON.stringify(newSelection))
  isLoadingWidgets.value = false
  loadingProgress.value = 0
}

onMounted(() => {
  const saved = localStorage.getItem('selectedWidgets')
  if (saved) {
    try {
      selectedWidgetIds.value = JSON.parse(saved)
    } catch (e) {
      selectedWidgetIds.value = ['next-visit', 'new-docs']
    }
  } else {
    selectedWidgetIds.value = ['next-visit', 'new-docs']
  }
})
</script>

<template>
  <div class="widget-panel">
    <div class="panel-header">
      <h3 class="widget-panel-title">{{ $t('home.quickOverview') }}</h3>
      <button 
        class="icon-button" 
        type="button" 
        :aria-label="$t('widgets.emptyState.addButton')"
        @click="isWidgetSelectorOpen = true"
      >
        <PlusIcon class="icon-sm" />
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingWidgets" class="loading-state">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div class="loading-text">
          <p class="loading-title">{{ $t('widgets.loading.title') }}</p>
          <p class="loading-description">{{ $t('widgets.loading.description') }}</p>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: loadingProgress + '%' }"></div>
        </div>
        <div class="loading-percentage">{{ Math.round(loadingProgress) }}%</div>
      </div>
    </div>

    <div v-else-if="activeWidgets.length === 0" class="empty-state">
      <p class="empty-title">{{ $t('widgets.emptyState.title') }}</p>
      <p class="empty-description">{{ $t('widgets.emptyState.description') }}</p>
      <button class="add-widget-btn" @click="isWidgetSelectorOpen = true">
        <PlusIcon class="icon-svg" />
        {{ $t('widgets.emptyState.addButton') }}
      </button>
    </div>

    <div v-else class="widget-list">
      <template v-for="widget in activeWidgets" :key="widget.id">
        <!-- Quick Stats Widgets -->
        <div v-if="widget.id === 'next-visit'" class="widget-card">
          <div class="widget-row">
            <div class="icon-pill">
              <CalendarIcon class="icon-svg" />
            </div>
            <div class="widget-info">
              <div class="widget-label">{{ $t('widgets.items.nextVisit.name') }}</div>
              <div class="widget-value">3 {{ $t('widgets.items.nextVisit.description') || 'days' }}</div>
            </div>
          </div>
        </div>

        <div v-else-if="widget.id === 'new-docs'" class="widget-card">
          <div class="widget-row">
            <div class="icon-pill">
              <BellIcon class="icon-svg" />
            </div>
            <div class="widget-info">
              <div class="widget-label">{{ $t('widgets.items.newDocs.name') }}</div>
              <div class="widget-value">2</div>
            </div>
          </div>
        </div>

        <div v-else-if="widget.id === 'medication-reminder'" class="widget-card">
          <div class="widget-row">
            <div class="icon-pill icon-emoji">💊</div>
            <div class="widget-info">
              <div class="widget-label">{{ WIDGET_DATA.nextMedicationReminder.medication }}</div>
              <div class="widget-value">{{ WIDGET_DATA.nextMedicationReminder.time }}</div>
            </div>
          </div>
        </div>

        <!-- Health Metric Widgets -->
        <HealthMetricWidget
          v-else-if="widget.category === 'health-metric' && getHealthParameter(widget.id)"
          :parameter="getHealthParameter(widget.id)!"
          :compact="true"
        />

        <!-- Health Chart Widgets -->
        <HealthChart
          v-else-if="widget.category === 'health-chart' && getChartData(widget.id)"
          :title="getChartData(widget.id)!.title"
          :data="getChartData(widget.id)!.data"
          :unit="getChartData(widget.id)!.unit"
          :normal-range="getChartData(widget.id)!.normalRange"
          :compact="true"
        />
      </template>
    </div>

    <!-- Widget Selector Modal -->
    <WidgetSelector
      :is-open="isWidgetSelectorOpen"
      :available-widgets="availableWidgets"
      :selected-widget-ids="selectedWidgetIds"
      @close="isWidgetSelectorOpen = false"
      @save="handleSaveWidgets"
    />
  </div>
</template>

<style scoped>
.widget-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: var(--white-40);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--white-60);
  border-radius: 1.5rem;
  padding: 1.25rem;
  box-shadow: 0 8px 32px var(--black-8), inset 0 1px 0 var(--white-80);
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  overflow: hidden;
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}
.widget-panel-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--section-title-color);
}
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.65rem;
  cursor: pointer;
  border: 1px solid var(--white-60);
  color: var(--text-primary-50);
  .loading-title {
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-primary-60);
    margin-bottom: 0.25rem;
  }
  .loading-description {
    font-size: 0.85rem;
    color: var(--text-primary-30);
  }
  .loading-percentage {
    font-size: 0.85rem;
    color: var(--text-primary-30);
    text-align: center;
    margin-top: 0.25rem;
  }
  .empty-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--widget-label-color);
    text-align: center;
  }
  .empty-description {
    font-size: 0.85rem;
    color: var(--widget-label-color);
    text-align: center;
    margin-bottom: 0.5rem;
  }
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  position: relative;
  background: var(--white-50);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px var(--black-6), inset 0 1px 0 var(--white-60);
}
.icon-button:hover {
  background: var(--white-70);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--black-10), inset 0 1px 0 var(--white-80);
}
.widget-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.widget-card {
  background: var(--white-50);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 0.75rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--white-40);
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  box-shadow: 0 2px 8px var(--black-6), inset 0 1px 0 var(--white-60);
}
.widget-card:hover {
  box-shadow: 0 4px 16px var(--black-12), inset 0 1px 0 var(--white-80);
  transform: translateY(-2px);
  background: var(--white-70);
}
.widget-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.widget-info {
  flex: 1 1 0%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}
.icon-pill {
  width: 2.5rem;
  height: 2.5rem;
  background: var(--white-80);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--white-30);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px var(--black-5);
  font-size: 1.5rem;
}
.icon-svg {
  width: 1.5rem;
  height: 1.5rem;
}

.icon-sm {
  width: 1.25rem;
  height: 1.25rem;
}
.icon-emoji {
  font-size: 1.5rem;
}
.widget-label {
  font-size: 0.875rem;
  color: var(--widget-label-color);
}
.widget-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--widget-value-color);
}
.empty-state {
  font-weight: 600;
  color: var(--white);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 1rem;
}
.add-widget-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: var(--blue-3b82f6-15);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--blue-3b82f6-40);
  border-radius: 0.75rem;
  color: var(--blue-3b82f6);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  box-shadow: 0 2px 8px var(--blue-3b82f6-15), inset 0 1px 0 var(--white-30);
}
.add-widget-btn:hover {
  background: var(--blue-3b82f6-25);
  border-color: var(--blue-3b82f6-60);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px var(--blue-3b82f6-30), inset 0 1px 0 var(--white-50);
}
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
}
.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 300px;
}
.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid var(--accent-primary-20);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.loading-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  text-align: center;
}
.progress-bar {
  width: 100%;
  height: 0.5rem;
  background: var(--accent-primary-15);
  border-radius: 0.25rem;
  overflow: hidden;
  box-shadow: inset 0 1px 2px var(--black-10);
}
.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  border-radius: 0.25rem;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px var(--accent-primary-50);
}
/* Responsive styles */
@media (max-width: 600px) {
  .widget-panel {
    padding: 0.5rem;
    border-radius: 1rem;
  }
  .widget-card {
    padding: 0.5rem 0.5rem;
    border-radius: 0.5rem;
  }
  .icon-pill {
    width: 2rem;
    height: 2rem;
    font-size: 1.1rem;
  }
  .widget-label {
    font-size: 0.8rem;
  }
  .widget-value {
    font-size: 1rem;
  }
}
</style>
