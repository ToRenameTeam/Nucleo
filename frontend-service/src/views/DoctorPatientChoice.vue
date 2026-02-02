<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { UserIcon, BuildingOfficeIcon } from '@heroicons/vue/24/outline'
import { useAuth } from '../composables/useAuth'

const { t } = useI18n()
const router = useRouter()
const { setAuthenticatedUser, selectPatientProfile: setProfile, currentUser } = useAuth()

const selectDoctor = () => {
  if (currentUser.value) {
    setAuthenticatedUser({
      ...currentUser.value,
      activeProfile: 'DOCTOR'
    })

  setProfile({
    id: currentUser.value.userId,
    name: currentUser.value.name,
    fiscalCode: currentUser.value.fiscalCode
  })

    router.push('/doctor/appointments')
  }
}

const selectPatient = () => {
  if (currentUser.value) {
    setAuthenticatedUser({
      ...currentUser.value,
      activeProfile: 'PATIENT'
    })
    router.push('/patient-choice')
  }
}
</script>

<template>
  <div class="doctor-patient-choice-page">
    <h1 class="choice-title">
      {{ t('app.title') }}
      <div class="title-underline"></div>
    </h1>
    <p class="choice-subtitle">
      {{ t('doctorPatientChoice.subtitle') }}
    </p>
    <div class="options-container">
      <button class="option-card" @click="selectDoctor">
        <div class="option-icon-wrapper">
          <div class="option-icon-bg">
            <BuildingOfficeIcon class="option-icon" />
          </div>
        </div>
        <div class="option-content">
          <h2 class="option-title">{{ t('doctorPatientChoice.doctorArea.title') }}</h2>
          <p class="option-description">{{ t('doctorPatientChoice.doctorArea.description') }}</p>
        </div>
      </button>

      <button class="option-card" @click="selectPatient">
        <div class="option-icon-wrapper">
          <div class="option-icon-bg">
            <UserIcon class="option-icon" />
          </div>
        </div>
        <div class="option-content">
          <h2 class="option-title">{{ t('doctorPatientChoice.patientArea.title') }}</h2>
          <p class="option-description">{{ t('doctorPatientChoice.patientArea.description') }}</p>
        </div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.doctor-patient-choice-page {
  min-height: 100vh;
  max-width: 100vw;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-mid) 50%, var(--bg-gradient-end) 100%);
  position: relative;
}

.doctor-patient-choice-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, var(--accent-primary-15) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, var(--accent-secondary-15) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.choice-title {
  font-size: clamp(3rem, 8vw, 4.5rem);
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--gray-171717);
  position: relative;
  z-index: 1;
  animation: fadeInDown 0.6s cubic-bezier(0, 0, 0.2, 1);
  text-align: center;
}

.title-underline {
  position: absolute;
  bottom: -1.25rem;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--gray-171717);
  animation: expandWidth 0.8s cubic-bezier(0, 0, 0.2, 1);
}

.choice-subtitle {
  color: var(--gray-525252);
  font-size: 1.25rem;
  font-weight: 500;
  position: relative;
  z-index: 1;
  animation: fadeIn 0.6s cubic-bezier(0, 0, 0.2, 1);
  animation-delay: 0.2s;
  animation-fill-mode: both;
  margin-bottom: 1.5rem;
  text-align: center;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 40rem;
  width: 100%;
  position: relative;
  z-index: 1;
  animation: fadeIn 0.6s cubic-bezier(0, 0, 0.2, 1);
  animation-delay: 0.4s;
  animation-fill-mode: both;
}

.option-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: var(--bg-secondary-25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 1.25rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  text-align: left;
  width: 100%;
  box-shadow: 0 4px 24px var(--shadow), 0 1px 2px var(--white-90);
}

.option-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px var(--text-primary-15), 0 1px 2px var(--white-90);
  background: var(--bg-secondary-35);
}

.option-card:active {
  transform: translateY(-2px);
}

.option-icon-wrapper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-icon-bg {
  width: 4rem;
  height: 4rem;
  background: var(--white-30);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--white-40);
  box-shadow: 0 2px 8px var(--shadow);
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
}

.option-icon {
  width: 2rem;
  height: 2rem;
  color: var(--text-primary);
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
}

.option-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-heading);
  margin: 0;
  transition: color 0.2s cubic-bezier(0, 0, 0.2, 1);
}

.option-card:hover .option-title {
  color: var(--text-primary);
}

.option-description {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

@keyframes fadeInDown {
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

@keyframes expandWidth {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .doctor-patient-choice-page {
    padding: 1.5rem;
  }
  
  .choice-title {
    font-size: 2.5rem;
  }
  
  .choice-subtitle {
    font-size: 1rem;
  }
  
  .option-card {
    padding: 1.5rem;
  }
  
  .option-icon-bg {
    width: 3rem;
    height: 3rem;
  }
  
  .option-icon {
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .option-title {
    font-size: 1.25rem;
  }
  
  .option-description {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .doctor-patient-choice-page {
    padding: 1rem;
  }
  
  .choice-title {
    font-size: 2rem;
  }
  
  .options-container {
    gap: 1rem;
  }
  
  .option-card {
    flex-direction: column;
    text-align: center;
    padding: 1.25rem;
  }
}
</style>
