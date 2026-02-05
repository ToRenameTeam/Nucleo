<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import TopBar from '../../components/shared/TopBar.vue'
import Breadcrumbs from '../../components/shared/Breadcrumbs.vue'
import BottomBar from '../../components/shared/BottomBar.vue'
import Footer from '../../components/shared/Footer.vue'
import {
  CalendarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClockIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/outline'
import {
  CalendarIcon as CalendarIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  ClockIcon as ClockIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid
} from '@heroicons/vue/24/solid'

const { t } = useI18n()

const tabIcons = {
  calendar: { outline: CalendarIcon, solid: CalendarIconSolid },
  documents: { outline: DocumentTextIcon, solid: DocumentTextIconSolid },
  patients: { outline: UserGroupIcon, solid: UserGroupIconSolid },
  availability: { outline: ClockIcon, solid: ClockIconSolid },
  settings: { outline: Cog6ToothIcon, solid: Cog6ToothIconSolid }
}

const doctorTabs = computed(() => [
  { id: 'doctor-appointments', label: t('tabs.appointments'), icon: tabIcons.calendar },
  { id: 'doctor-availabilities', label: t('tabs.availability'), icon: tabIcons.availability },
  { id: 'doctor-documents', label: t('tabs.documents'), icon: tabIcons.documents },
  { id: 'doctor-patients', label: t('tabs.patients'), icon: tabIcons.patients },
  { id: 'doctor-settings', label: t('tabs.settings'), icon: tabIcons.settings }
])
</script>

<template>
  <div class="doctor-layout">
    <TopBar />
    <Breadcrumbs />
    <main id="main-content" class="main-content" tabindex="-1">
      <router-view />
    </main>
    <BottomBar :tabs="doctorTabs" />
    <Footer />
  </div>
</template>

<style scoped>
.doctor-layout {
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
