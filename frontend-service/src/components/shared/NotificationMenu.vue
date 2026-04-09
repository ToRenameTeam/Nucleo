<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { BellIcon } from '@heroicons/vue/24/outline';
import type { NotificationItem } from '../../types/notification';

const { t, locale } = useI18n();

const props = defineProps<{
  notifications: NotificationItem[];
  unreadCount: number;
}>();

const emit = defineEmits<{
  opened: [];
}>();

const isOpen = ref(false);

const notificationLabel = computed(function () {
  return props.unreadCount > 0
    ? t('topbar.notificationsUnreadAria', { count: props.unreadCount })
    : t('topbar.notifications');
});

function toggleMenu() {
  isOpen.value = !isOpen.value;

  if (isOpen.value) {
    emit('opened');
  }
}

function closeMenu() {
  isOpen.value = false;
}

function formatNotificationDate(timestamp: string): string {
  return new Date(timestamp).toLocaleString(locale.value === 'it' ? 'it-IT' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });
}

defineExpose({
  closeMenu,
});
</script>

<template>
  <div class="notifications-container">
    <button
      class="topbar-icon-button notifications-button"
      :aria-label="notificationLabel"
      :aria-expanded="isOpen"
      @click="toggleMenu"
    >
      <BellIcon class="notifications-icon" aria-hidden="true" stroke-width="2" />
      <span v-if="unreadCount > 0" class="notifications-badge" aria-live="polite">
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>
    <div v-if="isOpen" class="notifications-menu">
      <div class="notifications-menu__header">
        <p class="notifications-title">{{ t('topbar.notifications') }}</p>
        <button class="notifications-close" type="button" @click="closeMenu">
          {{ t('topbar.close') }}
        </button>
      </div>
      <p v-if="notifications.length === 0" class="notifications-empty">
        {{ t('topbar.noNotifications') }}
      </p>
      <ul v-else class="notifications-list">
        <li
          v-for="notification in notifications"
          :key="notification.id"
          class="notifications-item"
          :class="{ unread: notification.status === 'UNREAD' }"
        >
          <div class="notifications-item-header">
            <p class="notifications-item-title">{{ notification.title }}</p>
            <span class="notifications-item-date">
              {{ formatNotificationDate(notification.created_at) }}
            </span>
          </div>
          <p v-if="notification.content" class="notifications-item-content">
            {{ notification.content }}
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.notifications-container {
  position: relative;
}

.notifications-button {
  background: var(--white-60);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--white-50);
  box-shadow:
    0 2px 8px var(--black-5),
    inset 0 1px 0 var(--white-80);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  position: relative;
  min-width: 2.25rem;
  min-height: 2.25rem;
  cursor: pointer;
  padding: 0.375rem;
}

.notifications-button:hover {
  background: var(--white-80);
  box-shadow:
    0 4px 16px var(--black-12),
    inset 0 1px 0 var(--white-90);
  transform: translateY(-1px);
}

.notifications-icon {
  width: 1rem;
  height: 1rem;
  color: var(--topbar-text-secondary);
}

.notifications-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  min-width: 1.125rem;
  height: 1.125rem;
  border-radius: 999px;
  background: var(--notification-red);
  color: var(--white);
  font-size: 0.625rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.25rem;
}

.notifications-menu {
  position: absolute;
  top: calc(100% + 0.5vh);
  right: 0;
  width: min(26rem, 88vw);
  max-height: 60vh;
  overflow-y: auto;
  background: var(--glass-menu-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-menu-border);
  outline: 1px solid var(--rgba-white-10);
  box-shadow: var(--glass-menu-shadow), var(--glass-menu-inset-shadow);
  border-radius: 0.75rem;
  z-index: 60;
  padding: 0.75rem;
}

.notifications-menu__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--rgba-white-15);
}

.notifications-title {
  color: var(--glass-menu-text-primary);
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0;
}

.notifications-close {
  border: 1px solid var(--white-50);
  background: var(--white-40);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: var(--glass-menu-text-primary);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
}

.notifications-close:hover {
  background: var(--white-60);
  box-shadow: 0 2px 8px var(--black-12);
}

.notifications-empty {
  color: var(--glass-menu-text-secondary);
  font-size: 0.875rem;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notifications-item {
  padding: 0.6rem;
  border-radius: 0.6rem;
  background: var(--white-40);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--white-50);
  box-shadow:
    0 4px 14px var(--black-10),
    inset 0 1px 0 var(--white-70);
}

.notifications-item.unread {
  background: var(--accent-primary-10);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-color: var(--accent-primary-40);
  box-shadow:
    0 6px 18px var(--black-12),
    inset 0 1px 0 var(--white-70);
}

.notifications-item-header {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.notifications-item-title {
  color: var(--glass-menu-text-primary);
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
}

.notifications-item-date {
  color: var(--glass-menu-text-secondary);
  font-size: 0.75rem;
  white-space: nowrap;
}

.notifications-item-content {
  margin-top: 0.25rem;
  color: var(--glass-menu-text-secondary);
  font-size: 0.825rem;
}
</style>
