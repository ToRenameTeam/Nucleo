<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ProfileCard from '../components/shared/ProfileCard.vue'
import { useAuth } from '../authentication/useAuth'
import type { Profile } from '../types/auth'

const { t } = useI18n()
const router = useRouter()
const { login } = useAuth()

const profiles = ref<Profile[]>([
  { id: '1', name: 'Marco', role: 'Tu' },
  { id: '2', name: 'Laura', role: 'Moglie' },
  { id: '3', name: 'Sofia', role: 'Figlia' },
  { id: '4', name: 'Nonno Giulio', role: 'Padre' },
  { id: '5', name: 'Nonna Maria', role: 'Madre' }
])

const selectProfile = (profile: Profile) => {
  login(profile)
  router.push('/home')
}

const addProfile = () => {
  console.log('Aggiungi nuovo profilo')
}
</script>

<template>
  <div class="patient-choice-page">
    <h1 class="patient-choice-title">
      {{ t('app.title') }}
      <div class="title-underline"></div>
    </h1>
    <p class="patient-choice-subtitle">
      {{ t('patientChoice.subtitle') }}
    </p>
    <div class="profiles-container">
      <ProfileCard
        v-for="profile in profiles"
        :key="profile.id"
        :name="profile.name"
        :role="profile.role"
        @click="selectProfile(profile)"
      />
      <ProfileCard
        :name="t('patientChoice.addProfile')"
        :is-add-card="true"
        @click="addProfile"
      />
    </div>
  </div>
</template>

<style scoped>
.patient-choice-page {
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

.patient-choice-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, var(--sky-0ea5e9-15) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, var(--purple-a855f7-15) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.patient-choice-title {
  font-size: clamp(3rem, 8vw, 4.5rem);
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--gray-171717);
  position: relative;
  z-index: 1;
  animation: fadeInDown 0.6s cubic-bezier(0, 0, 0.2, 1);
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

.patient-choice-subtitle {
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

.profiles-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
  max-width: 56rem;
  position: relative;
  z-index: 1;
  animation: fadeIn 0.6s cubic-bezier(0, 0, 0.2, 1);
  animation-delay: 0.4s;
  animation-fill-mode: both;
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
  .patient-choice-page {
    padding: 1rem;
  }
  .patient-choice-title {
    font-size: 2.5rem;
  }
  .patient-choice-subtitle {
    font-size: 1rem;
  }
  .profiles-container {
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .patient-choice-page {
    padding: 0.75rem;
  }
  .patient-choice-title {
    font-size: 2rem;
  }
  .profiles-container {
    gap: 0.75rem;
    max-width: 100%;
  }
}
</style>
