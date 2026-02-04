<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="doctor-home">
    <div class="doctor-home-header">
      <h1 class="doctor-home-title">{{ t('doctor.home.title') }}</h1>
      <p class="doctor-home-subtitle">{{ t('doctor.home.subtitle') }}</p>
    </div>

    <div class="doctor-home-content">
      <!-- Contenuto temporaneo - sarà implementato successivamente -->
    </div>
  </div>
</template>

<style scoped>
.doctor-home {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.doctor-home-header {
  margin-bottom: 2rem;
}

.doctor-home-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.doctor-home-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin: 0;
}

.doctor-home-content {
  min-height: 400px;
}

@media (max-width: 768px) {
  .doctor-home {
    padding: 1.5rem;
  }

  .doctor-home-title {
    font-size: 1.5rem;
  }

  .doctor-home-subtitle {
    font-size: 1rem;
  }
}
</style>
