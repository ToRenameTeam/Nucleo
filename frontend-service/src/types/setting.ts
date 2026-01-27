import type { Component } from 'vue'

export interface SettingItem {
  icon?: Component
  title: string
  subtitle?: string
  showChevron?: boolean
  variant?: 'default' | 'danger'
}