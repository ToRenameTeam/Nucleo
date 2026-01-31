<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import TopBar from '../../components/shared/TopBar.vue'
import Breadcrumbs from '../../components/shared/Breadcrumbs.vue'
import BottomBar from '../../components/shared/BottomBar.vue'
import Footer from '../../components/shared/Footer.vue'
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/outline'
import {
  HomeIcon as HomeIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  CalendarIcon as CalendarIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid
} from '@heroicons/vue/24/solid'

const { t } = useI18n()

const tabIcons = {
  home: { outline: HomeIcon, solid: HomeIconSolid },
  patients: { outline: UserGroupIcon, solid: UserGroupIconSolid },
  calendar: { outline: CalendarIcon, solid: CalendarIconSolid },
  analytics: { outline: ChartBarIcon, solid: ChartBarIconSolid },
  settings: { outline: Cog6ToothIcon, solid: Cog6ToothIconSolid }
}

const doctorTabs = computed(() => [
  { id: 'doctor-home', label: t('tabs.home'), icon: tabIcons.home },
  { id: 'doctor-patients', label: t('tabs.patients'), icon: tabIcons.patients },
  { id: 'doctor-calendar', label: t('tabs.calendar'), icon: tabIcons.calendar },
  { id: 'doctor-analytics', label: t('tabs.analytics'), icon: tabIcons.analytics },
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
