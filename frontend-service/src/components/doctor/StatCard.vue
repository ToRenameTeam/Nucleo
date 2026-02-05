<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  value: number
  label: string
  icon?: Component
  iconBgColor?: string
  iconColor?: string
  indicatorBgColor?: string
  indicatorBorderColor?: string
}

defineProps<Props>()
</script>

<template>
  <div class="stat-card">
    <!-- Icon or Indicator -->
    <component 
      v-if="icon" 
      :is="icon" 
      class="stat-icon"
      :style="{
        backgroundColor: iconBgColor,
        color: iconColor
      }"
    />
    <div 
      v-else 
      class="stat-indicator"
      :style="{
        backgroundColor: indicatorBgColor,
        borderColor: indicatorBorderColor
      }"
    ></div>
    
    <!-- Content -->
    <div class="stat-content">
      <span class="stat-value">{{ value }}</span>
      <span class="stat-label">{{ label }}</span>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--white-40);
  backdrop-filter: blur(20px);
  border: 1px solid var(--white-60);
  border-radius: 1rem;
  box-shadow: 0 4px 16px var(--black-6);
}

.stat-icon {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0.5rem;
  border-radius: 0.75rem;
}

.stat-indicator {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.5rem;
  border-width: 2px;
  border-style: solid;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-171717);
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--gray-525252);
  margin-top: 0.25rem;
}
</style>
