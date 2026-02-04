// ============================================================================
// Date Formatting and Parsing Utilities
// ============================================================================

/**
 * Format Date object to ISO date string (YYYY-MM-DD)
 * @param date - Date object to format
 * @returns ISO date string
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const MONTHS: Record<string, number> = {
  'Gen': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'Mag': 4, 'Giu': 5,
  'Lug': 6, 'Ago': 7, 'Set': 8, 'Ott': 9, 'Nov': 10, 'Dic': 11
}

const MONTH_NAMES = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic']

/**
 * Parse Italian date format "GG Mese AAAA" to Date object
 * Example: "15 Gen 2026"
 * @param dateStr - Date string in Italian format
 * @returns Date object or null if parsing fails
 */
export function parseItalianDate(dateStr: string): Date | null {
  const parts = dateStr.split(' ')
  if (parts.length !== 3) return null
  
  const day = parseInt(parts[0] || '')
  const monthKey = parts[1] || ''
  const month = MONTHS[monthKey]
  const year = parseInt(parts[2] || '')
  
  if (isNaN(day) || month === undefined || isNaN(year)) return null
  
  return new Date(year, month, day)
}

/**
 * Format Date object to Italian date format "GG Mese AAAA"
 * Example: "15 Gen 2026"
 * @param date - Date object to format
 * @returns Formatted date string
 */
export function formatItalianDate(date: Date): string {
  const day = date.getDate()
  const month = MONTH_NAMES[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

/**
 * Parse Italian date format with slashes (dd/mm/yyyy) to Date object
 * Example: "15/03/2026"
 * @param dateStr - Date string in format "dd/mm/yyyy"
 * @returns Date object or null if parsing fails
 */
export function parseItalianDateSlash(dateStr: string): Date | null {
  const parts = dateStr.split('/')
  if (parts.length !== 3) return null
  
  const day = parseInt(parts[0] || '')
  const month = parseInt(parts[1] || '') - 1 // Months are 0-indexed in JS
  const year = parseInt(parts[2] || '')
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null
  
  return new Date(year, month, day)
}

/**
 * Extract time from time string and set it on a Date object
 * Supports formats like "14:30" or "14:30 - 15:00"
 * @param date - Date object to modify
 * @param timeStr - Time string to parse
 * @returns Modified Date object
 */
export function setTimeOnDate(date: Date, timeStr: string | undefined): Date {
  if (!timeStr) return date
  
  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/)
  if (!timeMatch || !timeMatch[1] || !timeMatch[2]) return date
  
  const hours = parseInt(timeMatch[1])
  const minutes = parseInt(timeMatch[2])
  
  if (isNaN(hours) || isNaN(minutes)) return date
  
  date.setHours(hours, minutes)
  return date
}