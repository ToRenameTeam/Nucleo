// Tipi di visite disponibili
export const VISIT_TYPES = [
  { id: 'cardiology', key: 'cardiology'},
  { id: 'dermatology', key: 'dermatology'},
  { id: 'general', key: 'general', icon: '⚕️' },
  { id: 'ophthalmology', key: 'ophthalmology'},
  { id: 'orthopedics', key: 'orthopedics'},
  { id: 'pediatrics', key: 'pediatrics'},
  { id: 'gynecology', key: 'gynecology'},
  { id: 'neurology', key: 'neurology'},
  { id: 'psychiatry', key: 'psychiatry'},
  { id: 'physiotherapy', key: 'physiotherapy'},
  { id: 'bloodTest', key: 'bloodTest'},
  { id: 'ecg', key: 'ecg'},
  { id: 'ultrasound', key: 'ultrasound'},
  { id: 'xray', key: 'xray'},
]

// Slot orari disponibili
export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
]

// Dettagli appuntamento per data/ora
export interface AppointmentDetails {
  doctor: string
  location: string
}

// Mock function per ottenere dettagli appuntamento basati su data e ora
export function getAppointmentDetails(date: string, time: string): AppointmentDetails {
  // Array di medici e location disponibili
  const doctors = [
    'Dr.ssa Maria Rossi',
    'Dr. Giuseppe Verdi',
    'Dr. Luca Bianchi',
    'Dr.ssa Laura Ferrari',
    'Dr. Marco Colombo',
    'Dr.ssa Anna Ricci'
  ]
  
  const locations = [
    'Ospedale San Raffaele - Via Olgettina 60, Milano',
    'Poliambulatorio Salute - Via Roma 15, Milano',
    'Centro Medico San Marco - Corso Garibaldi 42, Milano',
    'Clinica Villa Maria - Via Manzoni 8, Milano'
  ]
  
  // Usa data e ora come seed per generare risultati consistenti
  const seed = (date + time).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const doctorIndex = seed % doctors.length
  const locationIndex = (seed * 7) % locations.length
  
  return {
    doctor: doctors[doctorIndex]!,
    location: locations[locationIndex]!
  }
}

// Tag to color key mapping
export const TAG_COLOR_MAP: Record<string, string> = {
  'cardiologia': 'cardiologia',
  'diabete': 'diabete',
  'endocrinologia': 'endocrinologia',
  'farmaci': 'farmaci',
  'esami': 'esami',
  'analisi': 'analisi',
  'laboratorio': 'laboratorio',
  'oculistica': 'oculistica',
  'ortopedia': 'ortopedia',
  'dermatologia': 'dermatologia',
  'radiologia': 'radiologia',
  'ecografia': 'ecografia',
  'nefrologia': 'nefrologia',
  'vascolare': 'vascolare',
  'riabilitazione': 'riabilitazione',
  'fisioterapia': 'fisioterapia',
  'pediatria': 'pediatria',
  'controllo': 'controllo',
  'neurologia': 'neurologia',
  'pneumologia': 'pneumologia',
  'gastroenterologia': 'gastroenterologia',
  'prescrizione': 'farmaci',
  'visita': 'controllo',
  'diagnostica': 'esami'
}

// Tag to icon mapping
export const TAG_ICON_MAP: Record<string, string> = {
  'cardiologia': '❤️',
  'diabete': '🩸',
  'endocrinologia': '🧬',
  'farmaci': '💊',
  'esami': '🔬',
  'analisi': '🧪',
  'laboratorio': '🧬',
  'oculistica': '👁️',
  'ortopedia': '🦴',
  'dermatologia': '🔬',
  'radiologia': '📷',
  'ecografia': '📡',
  'nefrologia': '🫘',
  'vascolare': '🩸',
  'riabilitazione': '💪',
  'fisioterapia': '🏃',
  'pediatria': '👶',
  'controllo': '✅',
  'neurologia': '🧠',
  'pneumologia': '🫁',
  'gastroenterologia': '🩺',
  'prescrizione': '💊',
  'visita': '👨‍⚕️',
  'diagnostica': '🔬'
}