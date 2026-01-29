<script setup lang="ts">
import { UserIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'
import type { ProfileCard } from '../../types/shared'

// i18n instance
const { t } = useI18n()

// Props definition
const props = defineProps<ProfileCard>()

// Emit click event
const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <div 
    @click="emit('click')"
    :class="['profile-card', { 'add-card': isAddCard }]"
  >
    <div class="profile-card__icon">
      <PlusIcon v-if="isAddCard" class="icon-plus" :stroke-width="1.5" />
      <UserIcon v-else class="icon-user" :stroke-width="1.5" />
    </div>
    <div v-if="!isAddCard" class="profile-card__info">
      <span class="profile-card__name">{{ name }}</span>
      <span class="profile-card__role">{{ role }}</span>
    </div>
    <span v-else class="profile-card__add-label">{{ t('patientChoice.addProfile') }}</span>
  </div>
</template>

<style scoped>
/* Card container */
.profile-card {
  width: 9rem; /* 36 Tailwind = 144px */
  height: 11rem; /* 44 Tailwind = 176px */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem; /* gap-3 = 12px */
  border-radius: 0.75rem; /* rounded-lg = 12px */
  background: var(--bg-secondary-30);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 4px 16px var(--text-primary-10), inset 0 1px 0 var(--bg-secondary-70);
  cursor: pointer;
  transition: box-shadow 0.3s cubic-bezier(0, 0, 0.2, 1), transform 0.3s cubic-bezier(0, 0, 0.2, 1), background 0.3s cubic-bezier(0, 0, 0.2, 1);
}

.profile-card:hover {
  box-shadow: 0 8px 24px var(--text-primary-12), inset 0 1px 0 var(--bg-secondary-80);
  background: var(--bg-secondary-45);
  transform: translateY(-4px);
}

/* Add card variant */
.add-card {
  background: var(--bg-secondary-15);
  border: 2px dashed var(--text-primary-30);
  box-shadow: 0 2px 8px var(--text-primary-6);
}
.add-card:hover {
  background: var(--bg-secondary-25);
}

/* Icon container */
.profile-card__icon {
  width: 5rem;
  height: 5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

/* Icon styles */
.icon-plus {
  width: 2rem; /* w-8 = 32px */
  height: 2rem; /* h-8 = 32px */
  color: var(--text-gray-400);
}
.icon-user {
  width: 2.5rem; /* w-10 = 40px */
  height: 2.5rem; /* h-10 = 40px */
  color: var(--text-gray-400);
}

/* Info section */
.profile-card__info {
  text-align: center;
}
.profile-card__name {
  display: block;
  font-size: 1.25rem; /* text-xl = 20px */
  font-weight: 500; /* font-medium */
  color: var(--text-gray-900);
}
.profile-card__role {
  display: block;
  font-size: 0.75rem; /* text-xs = 12px */
  color: var(--text-gray-500);
}

/* Add label */
.profile-card__add-label {
  font-size: 1.125rem; /* text-lg = 18px */
  color: var(--text-gray-500);
}

@media (max-width: 600px) {
  .profile-card {
    width: 7.5rem;
    height: 9.5rem;
    gap: 0.5rem;
  }
  .profile-card__icon {
    width: 4rem;
    height: 4rem;
  }
  .icon-plus {
    width: 1.5rem;
    height: 1.5rem;
  }
  .icon-user {
    width: 2rem;
    height: 2rem;
  }
  .profile-card__name {
    font-size: 1rem;
  }
  .profile-card__role {
    font-size: 0.625rem;
  }
  .profile-card__add-label {
    font-size: 1rem;
  }
}
</style>
