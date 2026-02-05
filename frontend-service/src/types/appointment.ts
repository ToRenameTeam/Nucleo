export interface Appointment {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  user?: string;
  fiscalCode?: string;
  location?: string;
  patientId?: string;
  doctorId?: string;
  status?: string;
  category?: string[]; // Service type categories
  serviceTypeDescription?: string;
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