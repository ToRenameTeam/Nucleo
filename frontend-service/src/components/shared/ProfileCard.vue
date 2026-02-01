<script setup lang="ts">
import { UserIcon } from '@heroicons/vue/24/outline'
import type { ProfileCard } from '../../types/shared'

const props = defineProps<ProfileCard>()

const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <div @click="emit('click')" :class="['profile-card']">
    <div class="profile-card_icon">
      <UserIcon class="icon-user" :stroke-width="1.5" />
    </div>
    <div class="profile-card__info">
      <span class="profile-card_name">{{ name }}</span>
      <span class="profile-card_subtitle">{{ fiscalCode }}</span>
    </div>
  </div>
</template>

<style scoped>
.profile-card {
  width: 9rem;
  height: 11rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  border-radius: 0.75rem;
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

.profile-card_icon {
  width: 5rem;
  height: 5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.icon-plus {
  width: 2rem;
  height: 2rem;
  color: var(--text-gray-400);
}

.icon-user {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--text-gray-400);
}

.profile-card__info {
  text-align: center;
}

.profile-card_name {
  display: block;
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--text-gray-900);
}

.profile-card_subtitle {
  display: block;
  font-size: 0.75rem;
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
}
</style>
