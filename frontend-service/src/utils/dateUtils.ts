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
/**
 * Format Date object to Italian date format with slashes (dd/mm/yyyy)
 * Example: "15/03/2026"
 * @param date - Date object to format
 * @returns Formatted date string
 */
export function formatDateSlash(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Format Date object to time string (HH:mm)
 * Example: "14:30"
 * @param date - Date object to format
 * @returns Time string
 */
export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Format Date object to time string for input field (HH:mm)
 * Example: "14:30"
 * @param date - Date object to format
 * @returns Time string for input
 */
export function formatTimeForInput(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Get Italian day name from date string in format dd/mm/yyyy
 * Example: "15/03/2026" -> "Mercoledì"
 * @param dateStr - Date string in format dd/mm/yyyy
 * @returns Italian day name
 */
export function formatDayName(dateStr: string): string {
  const date = parseItalianDateSlash(dateStr)
  if (!date) return ''
  const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
  return days[date.getDay()] || ''
}

/**
 * Parse date string in ISO format (YYYY-MM-DD) or Italian format
 * @param dateStr - Date string to parse
 * @returns Date object or null if parsing fails
 */
export function parseAnyDate(dateStr: string): Date | null {
  // Prova prima formato italiano
  let date = parseItalianDate(dateStr)
  
  // Se non funziona, prova formato ISO (YYYY-MM-DD)
  if (!date) {
    date = new Date(dateStr)
    // Verifica che sia una data valida
    if (isNaN(date.getTime())) {
      return null
    }
  }
  
  return date
}

/**
 * Get date with time set to start of day (00:00:00.000)
 * @param date - Date object
 * @returns New Date object at start of day
 */
export function startOfDay(date: Date): Date {
  const newDate = new Date(date)
  newDate.setHours(0, 0, 0, 0)
  return newDate
}

/**
 * Get date with time set to end of day (23:59:59.999)
 * @param date - Date object
 * @returns New Date object at end of day
 */
export function endOfDay(date: Date): Date {
  const newDate = new Date(date)
  newDate.setHours(23, 59, 59, 999)
  return newDate
}

/**
 * Compare two dates ignoring time (only year, month, day)
 * Returns: -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Comparison result
 */
export function compareDatesOnly(date1: Date, date2: Date): number {
  const num1 = date1.getFullYear() * 10000 + date1.getMonth() * 100 + date1.getDate()
  const num2 = date2.getFullYear() * 10000 + date2.getMonth() * 100 + date2.getDate()
  
  if (num1 < num2) return -1
  if (num1 > num2) return 1
  return 0
}

/**
 * Check if a date is within a range (inclusive, ignores time)
 * @param date - Date to check
 * @param from - Start of range (optional)
 * @param to - End of range (optional)
 * @returns True if date is within range
 */
export function isDateInRange(date: Date, from: Date | null, to: Date | null): boolean {
  const dateNum = date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate()
  
  if (from && to) {
    const fromNum = from.getFullYear() * 10000 + from.getMonth() * 100 + from.getDate()
    const toNum = to.getFullYear() * 10000 + to.getMonth() * 100 + to.getDate()
    return dateNum >= fromNum && dateNum <= toNum
  } else if (from) {
    const fromNum = from.getFullYear() * 10000 + from.getMonth() * 100 + from.getDate()
    return dateNum >= fromNum
  } else if (to) {
    const toNum = to.getFullYear() * 10000 + to.getMonth() * 100 + to.getDate()
    return dateNum <= toNum
  }
  
  return true
}
