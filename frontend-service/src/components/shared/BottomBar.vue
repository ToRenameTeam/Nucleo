<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Component } from 'vue'

interface TabIcon {
  outline: Component
  solid: Component
}

interface Tab {
  id: string
  label: string
  icon: TabIcon
}

interface Props {
  tabs: Tab[]
}

const props = defineProps<Props>()
const router = useRouter()
const route = useRoute()

const activeTab = computed(() => route.name as string)

function setActiveTab(tabId: string) {
  router.push({ name: tabId })
}
</script>

<template>
  <div class="bottombar-wrapper">
    <div class="bottombar-container">
      <button v-for="tab in tabs" :key="tab.id" :class="['tab-button', { active: activeTab === tab.id }]"
        :aria-label="`Vai alla sezione ${tab.label}`" :aria-current="activeTab === tab.id ? 'page' : undefined"
        @click="setActiveTab(tab.id)">
        <component :is="activeTab === tab.id ? tab.icon.solid : tab.icon.outline" class="tab-icon" aria-hidden="true" />
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.bottombar-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 1rem;
  z-index: 10;
  pointer-events: none;
}

.bottombar-container {
  pointer-events: all;
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--bg-secondary-40);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--bg-secondary-60);
  border-radius: 2rem;
  box-shadow:
    var(--shadow),
    inset 0 1px 0 var(--bg-secondary-80),
    0 0 0 1px var(--bg-secondary-10);
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
}

.tab-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  min-width: 4rem;
  border-radius: 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
  color: var(--text-secondary);
  position: relative;
}

.tab-button:hover {
  background: var(--bg-secondary-50);
  transform: translateY(-2px);
}

.tab-button.active {
  background: var(--bg-secondary-80);
  color: var(--accent-primary);
  box-shadow:
    0 4px 16px var(--accent-primary-20),
    inset 0 1px 0 var(--white-90);
}

.tab-button.active::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 1rem;
  padding: 2px;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
  -webkit-mask: linear-gradient(var(--white) 0 0) content-box, linear-gradient(var(--white) 0 0);
  mask: linear-gradient(var(--white) 0 0) content-box, linear-gradient(var(--white) 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.6;
}

.tab-icon {
  width: 1.5rem;
  height: 1.5rem;
  transition: transform 0.3s cubic-bezier(0, 0, 0.2, 1);
}

.tab-label {
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.3s cubic-bezier(0, 0, 0.2, 1);
}

.tab-button.active .tab-label {
  font-weight: 600;
  color: var(--accent-primary);
}

.tab-button.active .tab-icon {
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .bottombar-container {
    padding: 0.5rem 1rem;
    gap: 0.25rem;
  }

  .tab-button {
    padding: 0.5rem 0.75rem;
    min-width: 3.5rem;
  }

  .tab-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  .tab-label {
    font-size: 0.625rem;
  }
}

@media (max-width: 480px) {
  .bottombar-wrapper {
    padding-bottom: 0.5rem;
  }

  .bottombar-container {
    padding: 0.5rem 0.75rem;
    gap: 0.125rem;
  }

  .tab-button {
    padding: 0.625rem 0.5rem;
    min-width: 3rem;
    gap: 0.125rem;
  }

  .tab-icon {
    width: 1.375rem;
    height: 1.375rem;
  }

  .tab-label {
    display: none;
  }
}
</style>
