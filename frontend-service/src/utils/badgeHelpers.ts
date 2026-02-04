import { TAG_COLOR_MAP, TAG_ICON_MAP } from '../constants/mockData'
import type { BadgeColors } from '../types/document'

/**
 * Get badge colors for a given tag/category
 * Returns CSS variable names for color, background, and border
 */
export function getBadgeColors(tag: string): BadgeColors {
  const normalizedTag = tag.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  const colorKey = TAG_COLOR_MAP[normalizedTag]

  if (colorKey) {
    return {
      color: `var(--badge-${colorKey})`,
      bgColor: `var(--badge-${colorKey}-bg)`,
      borderColor: `var(--badge-${colorKey}-border)`
    }
  }

  return {
    color: 'var(--text-primary)',
    bgColor: 'var(--bg-secondary-30)',
    borderColor: 'var(--border-color)'
  }
}

/**
 * Get badge icon (emoji) for a given tag/category
 * Returns the corresponding emoji or empty string if not found
 */
export function getBadgeIcon(tag: string): string {
  const normalizedTag = tag.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  return TAG_ICON_MAP[normalizedTag] || ''
}
