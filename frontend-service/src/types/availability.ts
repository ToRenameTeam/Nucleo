export type AvailabilityStatus = 'AVAILABLE' | 'BOOKED' | 'CANCELLED'

export interface TimeSlot {
  startDateTime: string
  durationMinutes: number
}

export interface Availability {
  availabilityId: string
  doctorId: string
  facilityId: string
  serviceTypeId: string
  timeSlot: TimeSlot
  status: AvailabilityStatus
}

export interface AvailabilityDisplay {
  id: string
  doctorId: string
  facilityId: string
  facilityName: string
  serviceTypeId: string
  serviceTypeName: string
  startDateTime: Date
  endDateTime: Date
  durationMinutes: number
  status: AvailabilityStatus
  isBooked: boolean
}

export interface CreateAvailabilityRequest {
  doctorId: string
  facilityId: string
  serviceTypeId: string
  startDateTime: string
  durationMinutes: number
}

export interface UpdateAvailabilityRequest {
  facilityId?: string
  serviceTypeId?: string
  startDateTime?: string
  durationMinutes?: number
}

export interface WeeklyCalendarProps {
  availabilities: AvailabilityDisplay[]
  currentWeekStart: Date
  startHour?: number
  endHour?: number
}

export interface AvailabilityModalProps {
  isOpen: boolean
  mode: 'create' | 'edit'
  availability?: AvailabilityDisplay | null
  preselectedDate?: Date | null
  preselectedHour?: number | null
}
