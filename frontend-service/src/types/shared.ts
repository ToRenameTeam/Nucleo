import type { FunctionalComponent } from 'vue'

// BaseCard Types
export interface CardMetadata {
  icon: FunctionalComponent
  label: string
}

export interface BaseCard {
  title: string
  description: string
  icon: FunctionalComponent
  metadata: CardMetadata[]
  selected?: boolean
  selectable?: boolean
  showActions?: boolean
  clickable?: boolean
}

// BaseModal Types
export interface BaseModal {
  isOpen: boolean
  title?: string
  subtitle?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  showFooter?: boolean
  closeOnBackdrop?: boolean
}

// LoadingSpinner Types
export interface LoadingSpinner {
  size?: 'small' | 'medium' | 'large'
  message?: string
  inline?: boolean
}

// Toast Types
export interface Toast {
  message: string
  show: boolean
  duration?: number
  type?: 'success' | 'error' | 'info' | 'warning'
}

// ProfileCard Types
export interface ProfileCard {
  name?: string
  isAddCard?: boolean
}

// Breadcrumbs Types
export interface BreadcrumbItem {
  name: string
  path?: string
}