export interface Appointment {
  id: string;
  title: string;
  description: string;
  tags?: string[];
  date: string;
  time?: string;
  fiscalCode?: string;
  location?: string;
}

export interface AppointmentCard {
  appointment: Appointment;
  selected?: boolean;
}

export interface UpcomingAppointments {
  appointments: any[];
}

export type AppointmentBooking = {
  isOpen: boolean;
  preselectedVisit?: string | null;
}

export type VisitTypeSelector = {
  modelValue: string | null;
  loading?: boolean;
}

export interface DateSelector {
  modelValue: string | null;
  disabled?: boolean;
  loading?: boolean;
}

export interface TimeSlotSelector {
  modelValue: string | null;
  selectedDate: string | null;
  disabled?: boolean;
  loading?: boolean;
}