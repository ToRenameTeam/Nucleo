<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const hideNavigation = computed(() => route.meta.hideNavigation === true)
</script>

<template>
  <div class="app-container">
    <!-- Skip link per accessibilità WCAG 2.4.1 -->
    <a href="#main-content" class="skip-link">Salta al contenuto principale</a>
    
    <router-view v-if="hideNavigation" />
    
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--bg-gradient-start) 0%, var(--bg-gradient-mid) 50%, var(--bg-gradient-end) 100%);
  position: relative;
}

.app-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, var(--accent-primary-20) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, var(--accent-secondary-20) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

/* Skip link per accessibilità - visibile solo al focus */
.skip-link {
  position: absolute;
  top: -100px;
  left: 0;
  background: var(--gray-171717);
  color: white;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  font-weight: 600;
  z-index: 10000;
  border-radius: 0 0 0.5rem 0;
  box-shadow: 0 4px 12px var(--black-15);
  transition: top 0.3s;
}

.skip-link:focus {
  top: 0;
  outline: 3px solid var(--accent-primary);
  outline-offset: 2px;
}
</style>
