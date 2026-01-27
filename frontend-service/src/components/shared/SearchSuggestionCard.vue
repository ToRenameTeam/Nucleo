<script setup lang="ts">
import { computed } from 'vue'
import { SparklesIcon, CalendarIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'
import type { SymptomSuggestion } from '../../types/symptom-suggestion'

const props = defineProps<{ suggestion: SymptomSuggestion }>()

const emit = defineEmits<{ bookAppointment: [suggestion: SymptomSuggestion] }>()

const { t } = useI18n()

// Compute urgency color based on suggestion urgency
const urgencyColor = computed(() => {
  switch (props.suggestion.urgency) {
    case 'high':
      return 'var(--error-15)'
    case 'medium':
      return 'var(--warning-15)'
    case 'low':
      return 'var(--success-green-15)'
    default:
      return 'var(--black-5)'
  }
})

const urgencyBorderColor = computed(() => {
  switch (props.suggestion.urgency) {
    case 'high':
      return 'var(--error-30)'
    case 'medium':
      return 'var(--warning-30)'
    case 'low':
      return 'var(--success-green-30)'
    default:
      return 'var(--black-10)'
  }
})

const urgencyLabel = computed(() => {
  switch (props.suggestion.urgency) {
    case 'high':
      return t('searchSuggestionCard.urgencyHigh')
    case 'medium':
      return t('searchSuggestionCard.urgencyMedium')
    case 'low':
      return t('searchSuggestionCard.urgencyLow')
    default:
      return ''
  }
})

// Emit book appointment event
const handleBookAppointment = () => {
  emit('bookAppointment', props.suggestion)
}
</script>

<template>
  <div class="suggestion-card">
    <div class="suggestion-header">
      <div class="suggestion-icon-badge">
        <SparklesIcon class="suggestion-icon" />
      </div>
      <div class="suggestion-title-section">
        <h3 class="suggestion-title">{{ t('searchSuggestionCard.smartSuggestion') }}</h3>
        <p class="suggestion-subtitle">{{ t('searchSuggestionCard.basedOnSearch', { symptom: props.suggestion.symptom }) }}</p>
      </div>
    </div>

    <div class="suggestion-content">
      <div class="visit-info">
        <div class="visit-icon">{{ props.suggestion.icon }}</div>
        <div class="visit-details">
          <h4 class="visit-title">{{ props.suggestion.suggestedVisit }}</h4>
          <p class="visit-description">{{ props.suggestion.description }}</p>
          <div class="visit-meta">
            <span class="visit-type-badge">{{ props.suggestion.visitType }}</span>
            <span class="urgency-badge" :style="{ backgroundColor: urgencyColor, borderColor: urgencyBorderColor }">
              {{ urgencyLabel }}
            </span>
          </div>
        </div>
      </div>

      <button class="book-button" @click="handleBookAppointment">
        <CalendarIcon class="book-button-icon" />
        <span>{{ t('searchSuggestionCard.bookVisit') }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.suggestion-card {
  padding: 1.25rem;
  background: linear-gradient(135deg, var(--accent-primary-8) 0%, var(--accent-secondary-8) 100%);
  backdrop-filter: blur(16px);
  border: 1px solid var(--accent-primary-20);
  border-radius: 1.25rem;
  box-shadow: 0 8px 32px var(--accent-primary-12), inset 0 1px 0 var(--white-50);
  animation: slideInUp 0.4s cubic-bezier(0, 0, 0.2, 1);
  transition: box-shadow 0.3s cubic-bezier(0, 0, 0.2, 1), transform 0.3s cubic-bezier(0, 0, 0.2, 1), background 0.3s cubic-bezier(0, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.suggestion-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  opacity: 0.6;
}

.suggestion-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px var(--accent-primary-18), inset 0 1px 0 var(--white-60);
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.suggestion-icon-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: var(--accent-primary-15);
  border: 1px solid var(--accent-primary-30);
  border-radius: 0.75rem;
  flex-shrink: 0;
}

.suggestion-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--accent-primary);
}

.suggestion-title-section {
  flex: 1;
}

.suggestion-title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--accent-primary);
  margin: 0;
  line-height: 1.2;
}

.suggestion-subtitle {
  font-size: 0.75rem;
  color: var(--accent-secondary);
  margin: 0.25rem 0 0 0;
  line-height: 1.2;
}

.suggestion-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.visit-info {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--white-60);
  border: 1px solid var(--white-80);
  border-radius: 1rem;
  box-shadow: 0 2px 8px var(--black-4);
}

.visit-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
  line-height: 1;
}

.visit-details {
  flex: 1;
  min-width: 0;
}

.visit-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gray-171717);
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.visit-description {
  font-size: 0.875rem;
  color: var(--gray-525252);
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
}

.visit-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.visit-type-badge,
.urgency-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: 1px solid;
}

.visit-type-badge {
  background: var(--sky-0ea5e9-15);
  color: var(--sky-0369a1);
  border-color: var(--sky-0ea5e9-30);
}

.urgency-badge {
  color: var(--gray-171717);
}

.book-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  color: var(--white);
  border: none;
  border-radius: 0.875rem;
  font-weight: 700;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: box-shadow 0.3s cubic-bezier(0, 0, 0.2, 1), transform 0.3s cubic-bezier(0, 0, 0.2, 1), background 0.3s cubic-bezier(0, 0, 0.2, 1);
  box-shadow: 0 4px 16px var(--accent-primary-30);
}

.book-button-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.book-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px var(--accent-primary-40);
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
}

.book-button:active {
  transform: translateY(0);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .suggestion-card {
    padding: 1rem;
  }
  .visit-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .visit-icon {
    font-size: 2rem;
  }
}
</style>
