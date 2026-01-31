<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import TopBar from '../../components/shared/TopBar.vue'
import Breadcrumbs from '../../components/shared/Breadcrumbs.vue'
import BottomBar from '../../components/shared/BottomBar.vue'
import Footer from '../../components/shared/Footer.vue'
import {
  HomeIcon,
  DocumentTextIcon,
  HeartIcon,
  CalendarIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/outline'
import {
  HomeIcon as HomeIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  HeartIcon as HeartIconSolid,
  CalendarIcon as CalendarIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid
} from '@heroicons/vue/24/solid'

const { t } = useI18n()

const tabIcons = {
  home: { outline: HomeIcon, solid: HomeIconSolid },
  documents: { outline: DocumentTextIcon, solid: DocumentTextIconSolid },
  health: { outline: HeartIcon, solid: HeartIconSolid },
  calendar: { outline: CalendarIcon, solid: CalendarIconSolid },
  settings: { outline: Cog6ToothIcon, solid: Cog6ToothIconSolid }
}

const patientTabs = computed(() => [
  { id: 'patient-home', label: t('tabs.home'), icon: tabIcons.home },
  { id: 'patient-documents', label: t('tabs.documents'), icon: tabIcons.documents },
  { id: 'patient-health', label: t('tabs.health'), icon: tabIcons.health },
  { id: 'patient-calendar', label: t('tabs.calendar'), icon: tabIcons.calendar },
  { id: 'patient-settings', label: t('tabs.settings'), icon: tabIcons.settings }
])
</script>

<template>
  <div class="patient-layout">
    <TopBar />
    <Breadcrumbs />
    <main id="main-content" class="main-content" tabindex="-1">
      <router-view />
    </main>
    <BottomBar :tabs="patientTabs" />
    <Footer />
  </div>
</template>

<style scoped>
.patient-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  position: relative;
  z-index: 1;
}

main:focus {
  outline: none;
}
</style>
