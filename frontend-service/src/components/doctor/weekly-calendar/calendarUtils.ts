import type { AvailabilityDisplay } from '../../../types/availability'

/**
 * Format hour for display (e.g., 8 -> "08:00")
 */
export function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`
}

/**
 * Format time for display using locale
 */
export function formatTime(date: Date, locale: string): string {
  return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
}

/**
 * Get week range string for display (e.g., "1 gen - 7 gen 2026")
 */
export function getWeekRangeLabel(weekStart: Date, locale: string): string {
  const startDate = weekStart
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)
  
  return `${startDate.toLocaleDateString(locale, { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}`
}

/**
 * Generate array of week days starting from a given date
 */
export function generateWeekDays(weekStart: Date, locale: string): { date: Date; label: string; isToday: boolean }[] {
  const days: { date: Date; label: string; isToday: boolean }[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)
    date.setHours(0, 0, 0, 0)
    
    const isToday = date.getTime() === today.getTime()
    
    days.push({
      date,
      label: date.toLocaleDateString(locale, { 
        weekday: 'short', 
        day: 'numeric',
        month: 'short'
      }),
      isToday
    })
  }
  
  return days
}

/**
 * Generate array of hours between start and end hour
 */
export function generateHoursArray(startHour: number, endHour: number): number[] {
  const hoursArray: number[] = []
  for (let h = startHour; h <= endHour; h++) {
    hoursArray.push(h)
  }
  return hoursArray
}

/**
 * Get availabilities for a specific day and hour slot
 */
export function getAvailabilitiesForSlot(
  availabilities: AvailabilityDisplay[],
  dayDate: Date,
  hour: number
): AvailabilityDisplay[] {
  return availabilities.filter(avail => {
    const availDate = new Date(avail.startDateTime)
    const sameDay = availDate.toDateString() === dayDate.toDateString()
    const availHour = availDate.getHours()
    return sameDay && availHour === hour
  })
}

/**
 * Check if a slot has any availability
 */
export function hasAvailability(
  availabilities: AvailabilityDisplay[],
  dayDate: Date,
  hour: number
): boolean {
  return getAvailabilitiesForSlot(availabilities, dayDate, hour).length > 0
}

/**
 * Calculate CSS position and height for availability block based on start time and duration
 */
export function getAvailabilityStyle(availability: AvailabilityDisplay): Record<string, string> {
  const startMinutes = availability.startDateTime.getMinutes()
  const durationMinutes = availability.durationMinutes
  
  // Position from top based on start minutes
  const topOffset = (startMinutes / 60) * 100
  // Height based on duration
  const height = (durationMinutes / 60) * 100
  
  return {
    top: `${topOffset}%`,
    height: `${height}%`
  }
}
